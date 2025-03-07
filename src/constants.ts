import type { FormField, RenderType } from '@openmrs/esm-form-engine-lib';

export const questionTypes = [
  'control',
  'encounterDatetime',
  'encounterLocation',
  'encounterProvider',
  'encounterRole',
  'obs',
  'obsGroup',
  'patientIdentifier',
  'testOrder',
  'programState',
] as const;

export type QuestionType = (typeof questionTypes)[number];

export const renderingTypes: Array<RenderType> = [
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

export const renderTypeOptions: Record<Exclude<QuestionType, 'obs'>, Array<RenderType>> = {
  control: ['text', 'markdown'],
  encounterDatetime: ['date', 'datetime'],
  encounterLocation: ['ui-select-extended'],
  encounterProvider: ['ui-select-extended'],
  encounterRole: ['ui-select-extended'],
  obsGroup: ['group', 'repeating'],
  testOrder: ['group', 'repeating'],
  patientIdentifier: ['text'],
  programState: ['select'],
};

/**
  Required properties for all question types.
 */
export const requiredProperties: Array<keyof FormField> = ['id', 'label', 'type', 'questionOptions'];

/**
   Type-specific properties for each question type.
 */
export const typeSpecificProperties: Record<string, Array<keyof FormField>> = {
  control: [],
  encounterDatetime: ['datePickerFormat'],
  encounterLocation: [],
  encounterProvider: [],
  encounterRole: [],
  obs: ['required'],
  obsGroup: ['questions'],
  patientIdentifier: [],
  testOrder: [],
  programState: [],
};

/**
  Merge required properties with type-specific ones.
 */
export const allowedPropertiesMapping: Record<string, string[]> = Object.fromEntries(
  Object.entries(typeSpecificProperties).map(([type, props]) => {
    const mergedProps = new Set<string>([...requiredProperties, ...props]);
    return [type, Array.from(mergedProps)];
  }),
);

/**
   Mapping of allowed keys for the nested questionOptions object per question type.
 */
export const allowedQuestionOptionsMapping: Record<string, string[]> = {
  control: ['rendering', 'minLength', 'maxLength'],
  encounterDatetime: ['rendering'],
  encounterLocation: ['rendering'],
  encounterProvider: ['rendering'],
  encounterRole: ['rendering', 'isSearchable'],
  obs: ['rendering', 'concept', 'answers'],
  obsGroup: ['rendering', 'concept'],
  patientIdentifier: ['rendering', 'identifierType', 'minLength', 'maxLength'],
  testOrder: ['rendering'],
  programState: ['rendering', 'programUuid', 'workflowUuid', 'answers'],
};
