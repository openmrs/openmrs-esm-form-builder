import { Type } from "@openmrs/esm-framework";

export const configSchema = {
  questionTypes: {
    _type: Type.Array,
    _description:
      "Provides information that the processor uses to render a field",
    _default: [
      "obs",
      "obsGroup",
      "testOrder",
      "control",
      "complex-obs",
      "encounterDatetime",
      "encounterProvider",
      "encounterLocation",
      "personAttribute",
    ],
  },
  renderElements: {
    _type: Type.Array,
    _description: "The field type of the question",
    _default: [
      "text",
      "number",
      "select",
      "date",
      "multiCheckbox",
      "textarea",
      "radio",
      "ui-select-extended",
      "group",
      "repeating",
      "drug",
      "file",
      "field-set",
      "problem",
    ],
  },
};
