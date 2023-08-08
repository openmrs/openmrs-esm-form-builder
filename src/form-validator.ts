import { openmrsFetch } from "@openmrs/esm-framework";
import { async } from "rxjs";

export const handleFormValidation = async (schema) => {
  const questionResolutionsArray = [];
  const answersResolutionsArray = []

  if (schema) {
    const parsedForm = typeof schema == "string" ? JSON.parse(schema) : schema;

    const asyncTasks = [];

    parsedForm.pages?.forEach((page) =>
      page.sections?.forEach((section) =>
        section.questions?.forEach((question) => {
          asyncTasks.push(
            handleQuestionValidation(question, questionResolutionsArray),
            handleAnswerValidation(question, answersResolutionsArray)
          );
          question.type === "obsGroup" &&
            question.questions?.forEach((obsGrpQuestion) =>
              asyncTasks.push(
                handleQuestionValidation(obsGrpQuestion, questionResolutionsArray),
                handleAnswerValidation(question, answersResolutionsArray)
              )
            );
        })
      )
    );
    await Promise.all(asyncTasks);

    return [questionResolutionsArray, answersResolutionsArray];
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
          ...conceptObject,
          resolution: `Concept "${conceptObject.questionOptions.concept}" not found`,
          resolutionType: `Warning`
        });
      }
    } catch (error) {}

  } else {
    array.push({ ...conceptObject, resolution: `No UUID`, resolutionType: `Warning` });
  }
};

const dataTypeChecker = (conceptObject, responseObject, array) => {
  const renderTypes = {
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

  renderTypes.hasOwnProperty(responseObject.datatype.display) &&
    renderTypes[responseObject.datatype.display].includes(
      conceptObject.questionOptions.rendering
    ) &&
    array.push({
      ...conceptObject,
      resolution: `✅ ${conceptObject.questionOptions.concept}: datatype "${responseObject.datatype.display}" matches control type "${conceptObject.questionOptions.rendering}"`,
      resolutionType: `Success`
    });

  renderTypes.hasOwnProperty(responseObject.datatype.display) &&
    !renderTypes[responseObject.datatype.display].includes(
      conceptObject.questionOptions.rendering
    ) &&
    array.push({
      ...conceptObject,
      resolution: `❌ ${conceptObject.questionOptions.concept}: datatype "${responseObject.datatype.display}" doesn't match control type "${conceptObject.questionOptions.rendering}"`,
      resolutionType: `Error`
    });

  !renderTypes.hasOwnProperty(responseObject.datatype.display) &&
    array.push({
      ...conceptObject,
      resolution: `Untracked datatype "${responseObject.datatype.display}"`,
      resolutionType: `Warning`
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
        if (response.data.results.length) {
          const [value] = response.data.results;
          array.push({...questionObject, resolution: `concept "✅ ${answer.concept}" found`, resolutionType: `Success`});
        } else {
          array.push({...questionObject, resolution: `concept "❌ ${answer.concept}" not found`, resolutionType: `Error`})
        }
      });
    });
};