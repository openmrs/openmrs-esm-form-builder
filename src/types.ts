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
  questionOptions: QuestionOption;
}

export interface QuestionOption {
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
}

export interface Concept {
  uuid: string;
  display: string;
  mappings: Array<Mappings>;
  answers: Array<ConceptAnswer>;
}

export interface ConceptAnswer {
  uuid: string;
  display: string;
}

export interface Mappings {
  display: string;
}
