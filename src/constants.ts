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
import { type ComparisonOperators } from './types';

export const comparisonOperators: Array<ComparisonOperators> = [
  { key: 'isEmpty', defaultLabel: 'Is Empty', type: 'string' },
  { key: 'notEmpty', defaultLabel: 'Not Empty', type: 'string' },
  { key: 'greaterThanOrEqualTo', defaultLabel: 'Greater than or equal to', type: 'string' },
  { key: 'lessThanOrEqualTo', defaultLabel: 'Less than or equal to', type: 'string' },
  { key: 'equals', defaultLabel: 'Equals', type: 'string' },
  { key: 'notEquals', defaultLabel: 'Not Equals', type: 'string' },
];

export enum ActionType {
  Fail = 'Fail',
  Calculate = 'Calculate',
}
