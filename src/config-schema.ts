import { Type, validators } from '@openmrs/esm-framework';
import { type RenderType } from '@openmrs/esm-form-engine-lib';
import type { QuestionType } from '@types';

const allowedQuestionTypes: Array<QuestionType> = [
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
];

const allowedFieldTypes: Array<RenderType> = [
  'checkbox',
  'checkbox-searchable',
  'content-switcher',
  'date',
  'datetime',
  'drug',
  'encounter-location',
  'encounter-provider',
  'encounter-role',
  'fixed-value',
  'file',
  'group',
  'number',
  'problem',
  'radio',
  'repeating',
  'select',
  'text',
  'textarea',
  'toggle',
  'ui-select-extended',
  'workspace-launcher',
  'markdown',
  'extension-widget',
  'select-concept-answers',
];

export const configSchema = {
  questionTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.String,
    },
    _description: 'Provides information that the processor uses to render a field',
    _default: allowedQuestionTypes,
    _validators: [validators.oneOf(allowedQuestionTypes)],
  },
  fieldTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.String,
    },
    _description:
      'An array of available field types. A question can have only one field type, and the field type determines how the question is rendered.',
    _default: allowedFieldTypes,
    _validators: [validators.oneOf(allowedFieldTypes)],
  },
  showSchemaSaveWarning: {
    _type: Type.Boolean,
    _description: 'Whether to show a warning about possibly losing data in the forms dashboard',
    _default: true,
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
    _description: 'Whether to enable form validation',
    _default: false,
  },
  blockRenderingWithErrors: {
    _type: Type.Boolean,
    _description: 'Whether to block form rendering when there are validation errors',
    _default: false,
  },
  enableRDESection: {
    _type: Type.Boolean,
    _default: false,
    _description:
      'Whether to add an Encounter Details section for retrospective data entry, which includes encounter date/time and provider fields',
  },
};

export interface ConfigObject {
  questionTypes: Array<QuestionType>;
  fieldTypes: Array<RenderType>;
  showSchemaSaveWarning: boolean;
  dataTypeToRenderingMap: Record<string, Array<string>>;
  enableFormValidation: boolean;
  blockRenderingWithErrors: boolean;
  enableRDESection: boolean;
}
