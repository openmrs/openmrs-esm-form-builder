import type { RenderType } from '@openmrs/openmrs-form-engine-lib';

export interface Form {
  uuid: string;
  name: string;
  encounterType: EncounterType;
  version: string;
  resources: Array<Resource>;
  description: string;
  published?: boolean;
  retired?: boolean;
  formFields?: Array<string>;
  display?: string;
  auditInfo: string;
}

export interface FilterProps {
  rowIds: Array<string>;
  headers: Array<Record<string, string>>;
  cellsById: Record<string, Record<string, boolean | string | null | Record<string, unknown>>>;
  inputValue: string;
  getCellId: (row, key) => string;
}

export interface EncounterType {
  uuid: string;
  name: string;
  display: string;
}

export interface Resource {
  uuid: string;
  name: string;
  dataType: string;
  valueReference: string;
}

export type QuestionType =
  | 'complex-obs'
  | 'control'
  | 'encounterDatetime'
  | 'encounterLocation'
  | 'encounterProvider'
  | 'obs'
  | 'obsGroup'
  | 'personAttribute'
  | 'testOrder'
  | 'patientIdentifier';

export interface Schema {
  name: string;
  pages: Array<{
    label: string;
    sections: Array<{
      label: string;
      isExpanded: string;
      questions: Array<{
        id: string;
        label: string;
        // TODO: This should be a union of all question types i.e QuestionType
        type: string;
        required?: boolean;
        questionOptions: {
          type?: string;
          concept?: string;
          answers?: Array<Record<string, string>>;
          rendering: RenderType;
          max?: string;
          min?: string;
          conceptMappings?: Array<Record<string, string>>;
        };
        validators?: Array<Record<string, string>>;
      }>;
    }>;
  }>;
  processor: string;
  uuid: string;
  encounterType: string;
  referencedForms: [];
  version?: string;
  description?: string;
}

export interface SchemaContextType {
  schema: Schema;
  setSchema: (schema: Schema) => void;
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
  id: string;
  label: string;
  type: string;
  questionOptions: QuestionOptions;
  required?: boolean;
  validators?: Array<Record<string, string>>;
}

export interface QuestionOptions {
  rendering: RenderType;
  answers?: Array<Record<string, string>>;
  concept?: string;
  conceptMappings?: Array<ConceptMapping>;
  max?: string;
  min?: string;
  attributeType?: string;
  calculate?: {
    calculateExpression: string;
  };
  rows?: string;
  orderSettingUuid?: string;
  orderType?: string;
  selectableOrders?: Array<Answer>;
  weekList?: [];
}

export interface Answer {
  concept: string;
  label: string;
}

export type ConceptMapping = Record<string, string>;

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
