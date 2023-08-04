import { openmrsFetch } from "@openmrs/esm-framework";
import { async } from "rxjs";

export const handleFormValidation = async (schema) => {
  const resolutionsArray = [];

  if (schema) {
    const parsedForm = typeof schema == "string" ? JSON.parse(schema) : schema;

    const asyncTasks = [];

    parsedForm.pages?.forEach((page) =>
      page.sections?.forEach((section) =>
        section.questions?.forEach((question) => {
          asyncTasks.push(handleQuestionValidation(question, resolutionsArray));

          question.type === "obsGroup" &&
            question.questions?.forEach((obsGrpQuestion) =>
              asyncTasks.push(
                handleQuestionValidation(obsGrpQuestion, resolutionsArray)
              )
            );
        })
      )
    );
    await Promise.all(asyncTasks);

    return resolutionsArray;
  }
};

const handleQuestionValidation = async (conceptObject, array) => {
  const conceptRepresentation =
    "custom:(uuid,display,datatype,conceptMappings:(conceptReferenceTerm:(conceptSource:(name),code)))";

  const searchRef = conceptObject.questionOptions.concept
    ? conceptObject.questionOptions.concept
    : conceptObject.questionOptions.conceptMappings
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
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  } else {
    array.push({ ...conceptObject, resolution: `No UUID` });
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
    });

  renderTypes.hasOwnProperty(responseObject.datatype.display) &&
    !renderTypes[responseObject.datatype.display].includes(
      conceptObject.questionOptions.rendering
    ) &&
    array.push({
      ...conceptObject,
      resolution: `❌ ${conceptObject.questionOptions.concept}: datatype "${responseObject.datatype.display}" doesn't match control type "${conceptObject.questionOptions.rendering}"`,
    });

  !renderTypes.hasOwnProperty(responseObject.datatype.display) &&
    array.push({
      ...conceptObject,
      resolution: `Untracked datatype "${responseObject.datatype.display}"`,
    });
};
