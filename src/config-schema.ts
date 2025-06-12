import { Type } from '@openmrs/esm-framework';
import { type RenderType } from '@openmrs/esm-form-engine-lib';
import type { QuestionType } from '@types';

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
      'patientIdentifier',
      'personAttribute',
      'testOrder',
      'programState',
    ],
    _elements: {
      _type: Type.String,
    },
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
      'checkbox',
      'checkbox-searchable',
      'number',
      'problem',
      'radio',
      'repeating',
      'select',
      'text',
      'textarea',
      'ui-select-extended',
      'toggle',
      'markdown',
    ],
    _elements: {
      _type: Type.String,
    },
  },
  showSchemaSaveWarning: {
    _type: Type.Boolean,
    _default: true,
    _description: 'Whether to show a warning about possibly losing data in the forms dashboard',
  },
  dataTypeToRenderingMap: {
    Numeric: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: ['number', 'fixed-value'],
    },
    Coded: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: [
        'select',
        'checkbox',
        'checkbox-searchable',
        'radio',
        'content-switcher',
        'fixed-value',
        'markdown',
        'ui-select-extended',
        'drug',
        'problem',
        'encounter-provider',
        'encounter-location',
        'select-concept-answers',
        'encounter-role',
        'multiCheckbox',
      ],
    },
    Text: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: ['text', 'textarea', 'fixed-value'],
    },
    Date: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: ['date', 'fixed-value'],
    },
    Datetime: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: ['datetime', 'fixed-value'],
    },
    Boolean: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: ['toggle', 'select', 'radio', 'content-switcher', 'fixed-value'],
    },
    Rule: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: ['repeating', 'group'],
    },
    'N/A': {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: [],
    },
    Complex: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
      _default: ['file'],
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

export interface ConfigObject {
  questionTypes: Array<QuestionType>;
  fieldTypes: Array<RenderType>;
  showSchemaSaveWarning: boolean;
  dataTypeToRenderingMap: Record<string, Array<string>>;
  enableFormValidation: boolean;
  blockRenderingWithErrors: boolean;
}
