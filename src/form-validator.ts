import { openmrsFetch } from "@openmrs/esm-framework";
import { async } from "rxjs";

export const handleFormValidation = async (schema) => {

  const errorsArray = [];

  if (schema) {
    const parsedForm = typeof schema == "string" ? JSON.parse(schema) : schema;

    const asyncTasks = [];

    parsedForm.pages?.forEach((page) =>
      page.sections?.forEach((section) =>
        section.questions?.forEach((question) => {
          asyncTasks.push(
            handleQuestionValidation(question, errorsArray),
            handleAnswerValidation(question, errorsArray)
          );
          question.type === "obsGroup" &&
            question.questions?.forEach((obsGrpQuestion) =>
              asyncTasks.push(
                handleQuestionValidation(obsGrpQuestion, errorsArray),
                handleAnswerValidation(question, errorsArray)
              )
            );
        })
      )
    );
    console.log(asyncTasks)
    await Promise.all(asyncTasks);
    
    return [errorsArray];
  }
};

const handleQuestionValidation = async (conceptObject, array) => {
  const conceptRepresentation =
    "custom:(uuid,display,datatype,conceptMappings:(conceptReferenceTerm:(conceptSource:(name),code)))";

  const searchRef = conceptObject.questionOptions.concept
    ? conceptObject.questionOptions.concept
    : conceptObject.questionOptions.conceptMappings?.length
    ? conceptObject.questionOptions.conceptMappings
        ?.map((mapping) => {
          return `${mapping.type}:${mapping.value}`;
        })
        .join(",")
    : "";

  if (searchRef) {
    try {
      const { data } = await openmrsFetch(
        `/ws/rest/v1/concept?references=${searchRef}&v=${conceptRepresentation}`
      );
      if (data.results.length) {
        const [resObject] = data.results;
        dataTypeChecker(conceptObject, resObject, array);
      } else {
        array.push({
            errorMessage : `❓ Concept "${conceptObject.questionOptions.concept}" not found`,
            field: conceptObject
        });
      }
    } catch (error) {
        console.error(error)
    }

  } else {
    array.push({
        errorMessage : `❓ No UUID`,
        field: conceptObject
    });
  }
};

const dataTypeChecker = (conceptObject, responseObject, array) => {
  const dataTypeToRenderingMap = {
    Numeric: ["number", "fixed-value"],
    Coded: [
      "select",
      "checkbox",
      "radio",
      "toggle",
      "content-switcher",
      "fixed-value",
    ],
    Text: ["text", "textarea", "fixed-value"],
    Date: ["date", "fixed-value"],
    Datetime: ["datetime", "fixed-value"],
    Boolean: ["toggle", "select", "radio", "content-switcher", "fixed-value"],
    Rule: ["repeating", "group"],
  };

  dataTypeToRenderingMap.hasOwnProperty(responseObject.datatype.name) &&
    !dataTypeToRenderingMap[responseObject.datatype.name].includes(
      conceptObject.questionOptions.rendering
    ) &&
    array.push({
        errorMessage : `❓ ${conceptObject.questionOptions.concept}: datatype "${responseObject.datatype.name}" doesn't match control type "${conceptObject.questionOptions.rendering}"`,
        field: conceptObject
    });

  !dataTypeToRenderingMap.hasOwnProperty(responseObject.datatype.name) &&
    array.push({
        errorMessage : `❓ Untracked datatype "${responseObject.datatype.name}"`,
        field: conceptObject
        });
};

const handleAnswerValidation = (questionObject, array) => {
  const answerArray = questionObject.questionOptions.answers;
  const conceptRepresentation =
    "custom:(uuid,display,datatype,conceptMappings:(conceptReferenceTerm:(conceptSource:(name),code)))";

  answerArray?.length &&
    answerArray.forEach((answer) => {
      const searchRef = answer.concept
        ? answer.concept
        : answer.conceptMappings?.length
        ? answer.conceptMappings
            .map((eachMapping) => {
              return `${eachMapping.type}:${eachMapping.value}`;
            })
            .join(",")
        : "";

      openmrsFetch(
        `/ws/rest/v1/concept?references=${searchRef}&v=${conceptRepresentation}`
      ).then((response) => {
        if (!response.data.results.length) {
          array.push({
            errorMessage: `❌ concept "${answer.concept}" not found`,
            field: answer
        })
        }
      });
    });
};