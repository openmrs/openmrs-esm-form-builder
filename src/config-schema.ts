import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  questionTypes: {
    _type: Type.Array,
    _description: 'Provides information that the processor uses to render a field',
    _default: [
      'control',
      'encounterDatetime',
      'encounterLocation',
      'encounterProvider',
      'encounterRole',
      'obs',
      'obsGroup',
      'personAttribute',
      'testOrder',
    ],
  },
  fieldTypes: {
    _type: Type.Array,
    _description:
      'An array of available field types. A question can have only one field type, and the field type determines how the question is rendered.',
    _default: [
      'date',
      'drug',
      'field-set',
      'file',
      'group',
      'multiCheckbox',
      'number',
      'problem',
      'radio',
      'repeating',
      'select',
      'text',
      'textarea',
      'ui-select-extended',
    ],
  },
  showSchemaSaveWarning: {
    _type: Type.Boolean,
    _default: true,
    _description: 'Whether to show a warning about possibly losing data in the forms dashboard',
  },
  dataTypeToRenderingMap: {
    _description: 'A map used to match concept datatypes to rendering types',
    _type: Type.Object,
    _default: {
      Numeric: ['number', 'fixed-value'],
      Coded: ['select', 'checkbox', 'radio', 'toggle', 'content-switcher', 'fixed-value'],
      Text: ['text', 'textarea', 'fixed-value'],
      Date: ['date', 'fixed-value'],
      Datetime: ['datetime', 'fixed-value'],
      Boolean: ['toggle', 'select', 'radio', 'content-switcher', 'fixed-value'],
      Rule: ['repeating', 'group'],
    },
  },
  enableFormValidation: {
    _type: Type.Boolean,
    _default: false,
    _description: 'Whether to enable form validation',
  },
  blockRenderingWithErrors: {
    _type: Type.Boolean,
    _default: false,
    _description: 'Whether to enable form validation',
  },
};
