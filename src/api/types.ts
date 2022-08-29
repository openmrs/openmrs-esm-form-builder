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
