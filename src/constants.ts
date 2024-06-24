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

export const comparisonOperators: Array<ComparisonOperators> = [
  { key: 'isEmpty', defaultLabel: 'Is Empty', type: 'string' },
  { key: 'notEmpty', defaultLabel: 'Not Empty', type: 'string' },
  { key: 'greaterThanOrEqualTo', defaultLabel: 'Greater than or equal to', type: 'string' },
  { key: 'lessThanOrEqualTo', defaultLabel: 'Less than or equal to', type: 'string' },
  { key: 'equals', defaultLabel: 'Equals', type: 'string' },
  { key: 'notEquals', defaultLabel: 'Not Equals', type: 'string' },
  { key: 'doesNotMatchExpression', defaultLabel: 'Does not match expression', type: 'string' },
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
