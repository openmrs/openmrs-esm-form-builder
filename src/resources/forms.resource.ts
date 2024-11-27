import { openmrsFetch, type FetchResponse, restBaseUrl } from '@openmrs/esm-framework';
import type { Form, Schema } from '@types';

interface SavePayload {
  name: string;
  description?: string;
  version?: string;
  published?: boolean;
  encounterType?: string;
}

export async function deleteClobdata(valueReference: string): Promise<FetchResponse<Schema>> {
  const response: FetchResponse = await openmrsFetch(`${restBaseUrl}/clobdata/${valueReference}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export async function deleteForm(formUuid: string): Promise<FetchResponse<Record<string, never>>> {
  const response: FetchResponse = await openmrsFetch(`${restBaseUrl}/form/${formUuid}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export async function deleteResource(
  formUuid: string,
  resourceUuid: string,
): Promise<FetchResponse<Record<string, never>>> {
  const response: FetchResponse = await openmrsFetch(`${restBaseUrl}/form/${formUuid}/resource/${resourceUuid}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export async function uploadSchema(schema: Schema): Promise<string> {
  const schemaBlob = new Blob([JSON.stringify(schema)], {
    type: 'application/json',
  });
  const body = new FormData();
  body.append('file', schemaBlob);

  const response = await window
    .fetch(`${window.openmrsBase}${restBaseUrl}/clobdata`, {
      body,
      method: 'POST',
    })
    .then((response) => {
      return response.text();
    });

  return response;
}

export async function getResourceUuid(formUuid: string, valueReference: string): Promise<FetchResponse<Schema>> {
  const body = {
    name: 'JSON schema',
    dataType: 'AmpathJsonSchema',
    valueReference: valueReference,
  };

  const response: FetchResponse = await openmrsFetch(`${restBaseUrl}/form/${formUuid}/resource`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body,
  });

  return response;
}

export async function updateForm(
  formUuid: string,
  name: string,
  version: string,
  description: string,
  encounterTypeUuid: string,
): Promise<FetchResponse<Schema>> {
  const abortController = new AbortController();
  const body = {
    name: name,
    version: version,
    description: description,
    encounterType: {
      uuid: encounterTypeUuid,
    },
  };

  const response: FetchResponse = await openmrsFetch(`${restBaseUrl}/form/${formUuid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body,
    signal: abortController.signal,
  });

  return response;
}

export async function saveNewForm(
  name: string,
  version: string,
  published?: boolean,
  description?: string,
  encounterType?: string,
): Promise<Form> {
  const abortController = new AbortController();

  const body: SavePayload = {
    name: name,
    version: version,
    published: published ?? false,
    description: description ?? '',
  };

  if (encounterType) {
    body.encounterType = encounterType;
  }
  const headers = {
    'Content-Type': 'application/json',
  };

  const response: FetchResponse<Form> = await openmrsFetch(`${restBaseUrl}/form`, {
    method: 'POST',
    headers: headers,
    body: body,
    signal: abortController.signal,
  });

  return response.data;
}

export async function publishForm(uuid: string): Promise<FetchResponse<Form>> {
  const body = { published: true };
  const response: FetchResponse = await openmrsFetch(`${restBaseUrl}/form/${uuid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body,
  });
  return response;
}

export async function unpublishForm(uuid: string): Promise<FetchResponse<Form>> {
  const body = { published: false };
  const response: FetchResponse = await openmrsFetch(`${restBaseUrl}/form/${uuid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body,
  });
  return response;
}
