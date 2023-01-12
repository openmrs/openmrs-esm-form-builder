import { Type } from "@openmrs/esm-framework";

export const configSchema = {
  questionTypes: {
    _type: Type.Array,
    _description:
      "Provides information that the processor uses to render a field",
    _default: [
      "complex-obs",
      "control",
      "encounterDatetime",
      "encounterLocation",
      "encounterProvider",
      "obs",
      "obsGroup",
      "personAttribute",
      "testOrder",
    ],
  },
  fieldTypes: {
    _type: Type.Array,
    _description:
      "An array of available field types. A question can have only one field type, and the field type determines how the question is rendered.",
    _default: [
      "date",
      "drug",
      "field-set",
      "file",
      "group",
      "multiCheckbox",
      "number",
      "problem",
      "radio",
      "repeating",
      "select",
      "text",
      "textarea",
      "ui-select-extended",
    ],
  },
  patientUuid: {
    _type: "String",
    _default: "6e0c17ae-da79-4d48-93d9-396ff82b98d4",
    _description:
      "UUID of the test patient whose information gets rendered in a patient banner within the form renderer",
  },
};
