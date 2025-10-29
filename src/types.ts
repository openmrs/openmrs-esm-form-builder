import type { OpenmrsResource } from '@openmrs/esm-framework';
import type {
  OpenmrsFormResource,
  FormField,
  ProgramState,
  ReferencedForm,
  RenderType,
  RequiredFieldProps,
  FormReference,
  OpenmrsEncounter,
  OpenmrsObs,
  SessionMode,
  PostSubmissionAction,
  FormSchema,
  FormPage,
  FormSection,
  FormQuestionOptions,
  QuestionAnswerOption,
  HideProps,
  DisableProps,
  RepeatOptions,
} from '@openmrs/esm-form-engine-lib';
import type { AuditInfo } from './components/audit-details/audit-details.component';
import type { questionTypes } from '@constants';

// Extend FormSchema to include description property
export interface FormBuilderSchema extends FormSchema {
  description?: string;
}

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

export type QuestionType = (typeof questionTypes)[number];

export type DatePickerType = 'both' | 'calendar' | 'timer';

// Using extended FormBuilderSchema instead of FormSchema
export type Schema = FormBuilderSchema;

export interface SchemaContextType {
  schema: Schema;
  setSchema: (schema: Schema) => void;
}

// Using FormPage from form-engine-lib instead of local Page
export type Page = FormPage;
// Export FormPage as well for direct imports
export { FormPage };

// Using FormSection from form-engine-lib instead of local Section
export type Section = FormSection;
// Export FormSection as well for direct imports
export { FormSection };

// Using FormField from form-engine-lib instead of local Question
export type Question = FormField;
// Export FormField as well for direct imports
export { FormField };

// Using FormQuestionOptions from form-engine-lib instead of local QuestionOptions
export type QuestionOptions = FormQuestionOptions;
// Export FormQuestionOptions as well for direct imports
export { FormQuestionOptions };

export interface Answer {
  concept: string;
  label: string;
}

export type ConceptMapping = Record<string, string>;

export interface Concept {
  uuid: string;
  display: string;
  mappings: Array<Mapping>;
  datatype: OpenmrsResource;
  conceptClass?: { display?: string };
  answers?: Array<ConceptAnswer>;
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

// Export the imported types directly
export type {
  OpenmrsEncounter,
  OpenmrsObs,
  SessionMode,
  PostSubmissionAction,
  FormSchema,
  QuestionAnswerOption,
  HideProps,
  DisableProps,
  RepeatOptions,
  OpenmrsFormResource,
  RenderType,
  RequiredFieldProps,
  FormReference,
  ReferencedForm,
  ProgramState,
};

export interface Program {
  uuid: string;
  name: string;
  allWorkflows: Array<ProgramWorkflow>;
}

export interface ProgramWorkflow {
  uuid: string;
  states: Array<ProgramState>;
  concept: {
    display: string;
    uuid: string;
  };
}

export interface DatePickerTypeOption {
  value: DatePickerType;
  label: string;
  defaultChecked: boolean;
}
