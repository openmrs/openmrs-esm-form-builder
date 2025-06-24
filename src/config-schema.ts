import { Type } from '@openmrs/esm-framework';
import { type RenderType } from '@openmrs/esm-form-engine-lib';
import type { QuestionType } from '@types';

export const configSchema = {
  questionTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.String,
    },
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
  },
  fieldTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.String,
    },
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
  },
  showSchemaSaveWarning: {
    _type: Type.Boolean,
    _description: 'Whether to show a warning about possibly losing data in the forms dashboard',
    _default: true,
  },
  dataTypeToRenderingMap: {
    _description: 'A map used to match concept datatypes to rendering types',
    _default: {
      Numeric: ['number', 'fixed-value'],
      Coded: [
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
      Text: ['text', 'textarea', 'fixed-value'],
      Date: ['date', 'fixed-value'],
      Datetime: ['datetime', 'fixed-value'],
      Boolean: ['toggle', 'select', 'radio', 'content-switcher', 'fixed-value'],
      Rule: ['repeating', 'group'],
      'N/A': [],
      Complex: ['file'],
    },
    Numeric: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
    },
    Coded: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
    },
    Text: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
    },
    Date: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
    },
    Datetime: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
    },
    Boolean: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
    },
    Rule: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
    },
    'N/A': {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
    },
    Complex: {
      _type: Type.Array,
      _elements: {
        _type: Type.String,
      },
    },
  },
  enableFormValidation: {
    _type: Type.Boolean,
    _description: 'Whether to enable form validation',
    _default: false,
  },
  blockRenderingWithErrors: {
    _type: Type.Boolean,
    _description: 'Whether to enable form validation',
    _default: false,
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
