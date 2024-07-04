import type { RenderType } from '@openmrs/esm-form-engine-lib';
import type { CalculationFunctions, ComparisonOperators } from './types';

export const helpLink: string =
  'https://openmrs.atlassian.net/wiki/spaces/projects/pages/114426045/Validation+Rule+Builder';

export const dateBasedCalculationFunctions: Array<string> = [
  'Age Based On Date',
  'Expected Delivery Date',
  'Months On ART',
];

export const heightAndWeightBasedCalculationFunctions: Array<string> = [
  'BMI',
  'BSA',
  'Height For Age Zscore',
  'BMI For Age Zscore',
  'Weight For Height Zscore',
];

export const emptyStates: Array<string> = ['Is Empty', 'Not Empty'];
export const arrContains: Array<string> = ['Contains any', 'Does not contains any'];

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

export const comparisonOperators: Array<ComparisonOperators> = [
  { key: 'isEmpty', defaultLabel: 'Is Empty', type: 'string' },
  { key: 'notEmpty', defaultLabel: 'Not Empty', type: 'string' },
  { key: 'greaterThanOrEqualTo', defaultLabel: 'Greater than or equal to', type: 'string' },
  { key: 'lessThanOrEqualTo', defaultLabel: 'Less than or equal to', type: 'string' },
  { key: 'equals', defaultLabel: 'Equals', type: 'string' },
  { key: 'notEquals', defaultLabel: 'Not Equals', type: 'string' },
  { key: 'doesNotMatchExpression', defaultLabel: 'Does not match expression', type: 'string' },
  { key: 'arrayContains', defaultLabel: 'Contains', type: 'string' },
  { key: 'arrayNotContains', defaultLabel: 'Does not contains', type: 'string' },
  { key: 'arrayContainsAny', defaultLabel: 'Contains any', type: 'string' },
  { key: 'arrayNotContainsAny', defaultLabel: 'Does not contains any', type: 'string' },
];

export const calculateFunctions: Array<CalculationFunctions> = [
  { key: 'bmi', defaultLabel: 'BMI', type: 'string' },
  { key: 'bsa', defaultLabel: 'BSA', type: 'string' },
  { key: 'heightForAgeScore', defaultLabel: 'Height For Age Zscore', type: 'string' },
  { key: 'bmiForAgeScore', defaultLabel: 'BMI For Age Zscore', type: 'string' },
  { key: 'ageBasedonArt', defaultLabel: 'Age Based On Date', type: 'string' },
  { key: 'monthsOnArt', defaultLabel: 'Months On ART', type: 'string' },
  { key: 'expectedDeliveryDate', defaultLabel: 'Expected Delivery Date', type: 'string' },
];
