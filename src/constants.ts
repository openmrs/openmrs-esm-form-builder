import { type ComparisonOperators } from "./types";

export const comparisonOperators: Array<ComparisonOperators> = [
  { key: 'isEmpty', defaultLabel: 'Is Empty',  type: 'string' },
  { key: 'notEmpty', defaultLabel: 'Not Empty',  type: 'string' },
  { key: 'greaterThanOrEqualTo', defaultLabel: 'Greater than or equal to', type: 'string' },
  { key: 'lessThanOrEqualTo', defaultLabel: 'Less than or equal to', type: 'string' },
  { key: 'equals', defaultLabel: 'Equals', type: 'string' },
  { key: 'notEquals', defaultLabel: 'Not Equals', type: 'string' },
];

export enum ActionType {
  Fail = 'Fail',
  Calculate = 'Calculate'
}
