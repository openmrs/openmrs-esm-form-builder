export interface Form {
  uuid: string;
  name: string;
  encounterType: EncounterType;
  version: string;
  published: boolean;
  retired: boolean;
  resources: Array<Resources>;
}

export interface EncounterType {
  uuid: string;
  name: string;
}

export interface Resources {
  uuid: string;
  name: string;
  dataType: string;
  valueReference: string;
}
