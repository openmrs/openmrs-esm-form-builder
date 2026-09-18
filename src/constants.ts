import type { RenderType } from '@openmrs/esm-form-engine-lib';

export const questionTypes = [
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

/**
 * Wrapper rendering types that hold nested questions. They are only valid for
 * question types that can contain child questions (obsGroup, testOrder). A plain
 * `obs` rendered as `repeating`/`group` has no inner control and cannot be rendered
 * by the form engine.
 */
export const groupRenderingTypes: Array<RenderType> = ['group', 'repeating'];

export const obsRenderingTypes: Array<RenderType> = renderingTypes.filter(
  (renderType) => !groupRenderingTypes.includes(renderType),
);

export const renderTypeOptions: Record<QuestionType, Array<RenderType>> = {
  control: ['text', 'markdown'],
  encounterDatetime: ['date', 'datetime'],
  encounterLocation: ['ui-select-extended'],
  encounterProvider: ['ui-select-extended'],
  encounterRole: ['ui-select-extended'],
  obs: obsRenderingTypes,
  obsGroup: groupRenderingTypes,
  personAttribute: ['text', 'select', 'date', 'radio', 'checkbox', 'textarea', 'toggle', 'ui-select-extended'],
  testOrder: groupRenderingTypes,
  patientIdentifier: ['text'],
  programState: ['select'],
};
