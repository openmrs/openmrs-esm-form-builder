import type { OpenmrsResource } from '@openmrs/esm-framework';
import type { ReferencedForm, RenderType, RequiredFieldProps } from '@openmrs/openmrs-form-engine-lib';
import type { AuditInfo } from './components/audit-details/audit-details.component';

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
  auditInfo: AuditInfo;
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
  | 'encounterRole'
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
        type: string;
        required?: string | boolean | RequiredFieldProps;
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
  referencedForms: Array<ReferencedForm>;
  version?: string;
  description?: string;
  encounter?: string | OpenmrsEncounter;
  allowUnspecifiedAll?: boolean;
  defaultPage?: string;
  readonly?: string | boolean;
  inlineRendering?: 'single-line' | 'multiline' | 'automatic';
  markdown?: unknown;
  postSubmissionActions?: Array<{ actionId: string; config?: Record<string, unknown> }>;
  formOptions?: {
    usePreviousValueDisabled: boolean;
  };
  translations?: Record<string, string>;
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
  questions?: Array<Question>;
  required?: string | boolean | RequiredFieldProps;
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
  identifierType?: string;
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
  allowDecimal?: boolean;
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

export interface PatientIdentifierType {
  display: string;
  name: string;
  description: string;
  uuid: string;
}

export interface PersonAttributeType {
  display: string;
  format: string;
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    answers: Array<ConceptAnswer>;
  };
}

export interface OpenmrsEncounter {
  uuid?: string;
  encounterDatetime?: string | Date;
  patient?: OpenmrsResource | string;
  location?: OpenmrsResource | string;
  encounterType?: OpenmrsResource | string;
  obs?: Array<OpenmrsObs>;
  orders?: Array<OpenmrsResource>;
  voided?: boolean;
  visit?: OpenmrsResource | string;
  encounterProviders?: Array<Record<string, unknown>>;
  form?: {
    uuid: string;
    [anythingElse: string]: unknown;
  };
}

export type SessionMode = 'edit' | 'enter' | 'view' | 'embedded-view';

export interface PostSubmissionAction {
  applyAction(
    formSession: {
      patient: fhir.Patient;
      encounters: Array<OpenmrsEncounter>;
      sessionMode: SessionMode;
    },
    config?: Record<string, unknown>,
    enabled?: string,
  ): void;
}

export interface OpenmrsObs extends OpenmrsResource {
  concept: OpenmrsResource;
  obsDatetime: string | Date;
  obsGroup: OpenmrsObs;
  groupMembers: Array<OpenmrsObs>;
  comment: string;
  location: OpenmrsResource;
  order: OpenmrsResource;
  encounter: OpenmrsResource;
  voided: boolean;
  value: unknown;
  formFieldPath: string;
  formFieldNamespace: string;
  status: string;
  interpretation: string;
  [anythingElse: string]: unknown;
}
