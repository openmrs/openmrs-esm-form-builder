export interface Form {
  uuid: string;
  name: string;
  encounterType: EncounterType;
  version: string;
  description: string;
  published: boolean;
  retired: boolean;
  resources: Array<Resource>;
}

export type RouteParams = { formUuid: string };

export interface FilterProps {
  rowIds: Array<string>;
  headers: Array<Record<string, string>>;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
}

export interface EncounterType {
  uuid: string;
  name: string;
}

export interface Resource {
  uuid: string;
  name: string;
  dataType: string;
  valueReference: string;
}

export interface Schema {
  name: string;
  pages: any;
  processor: string;
  uuid: string;
  encounterType: string;
  referencedForms: any;
}

export interface ClobResponse {
  body: any;
  data: any;
  headers: any;
  statusText: any;
  status: any;
}

export interface SchemaContextType {
  schema: Schema;
  setSchema: any;
}

export interface Page {
  label: string;
  sections: Array<Section>;
}

export interface Section {
  label: string;
  questions: Array<Question>;
  isExpanded: string | boolean;
}

export interface Question {
  label: string;
  id: string;
  type: string;
  questionOptions: QuestionOptions;
  required: string;
}

export interface QuestionOptions {
  rendering: string;
  answers: Array<Answer>;
  max: string;
  min: string;
  concept: string;
  conceptMappings: Array<ConceptMapping>;
  weekList: [];
  attributeType: string;
  calculate: any;
  rows: string;
  orderSettingUuid: string;
  orderType: string;
  selectableOrders: Array<Answer>;
}

export interface Answer {
  concept: string;
  label: string;
}

export interface ConceptMapping {
  type: string;
  value: string;
  relationship: string;
}

export interface Concept {
  uuid: string;
  display: string;
  mappings: Array<Mapping>;
  answers: Array<ConceptAnswer>;
}

export interface ConceptAnswer {
  uuid: string;
  display: string;
}

export interface Mapping {
  display: string;
  conceptMapType: {
    display: string;
  };
}

export enum FieldTypes {
  Date = "date",
  Drug = "drug",
  FieldSet = "field-set",
  File = "file",
  Group = "group",
  MultiCheckbox = "multiCheckbox",
  Number = "number",
  Problem = "problem",
  Radio = "radio",
  Repeating = "repeating",
  Select = "select",
  Text = "text",
  TextArea = "textarea",
  UiSelectExtended = "ui-select-extended",
}
