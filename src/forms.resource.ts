import { openmrsFetch, FetchResponse } from "@openmrs/esm-framework";
import { Schema } from "./types";

export const deleteClobdata = async (valueReference: string) => {
  const response: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/clobdata/${valueReference}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );
  return response;
};

export async function deleteForm(formUuid: string): Promise<FetchResponse> {
  const response: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/form/${formUuid}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );
  return response;
}

export const deleteResource = async (
  formUuid: string,
  resourceUuid: string
) => {
  const response: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/form/${formUuid}/resource/${resourceUuid}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );
  return response;
};

export const uploadSchema = async (schema: Schema) => {
  const schemaBlob = new Blob([JSON.stringify(schema)], {
    type: undefined,
  });
  const body = new FormData();
  body.append("file", schemaBlob);

  const response = await window
    .fetch(`${window.openmrsBase}/ws/rest/v1/clobdata`, {
      body,
      method: "POST",
    })
    .then((response) => {
      return response.text();
    });

  return response;
};

export const getResourceUuid = async (
  formUuid: string,
  valueReference: string
) => {
  const body = {
    name: "JSON schema",
    dataType: "AmpathJsonSchema",
    valueReference: valueReference,
  };

  const response: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/form/${formUuid}/resource`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    }
  );

  return response;
};

export const updateForm = async (
  formUuid,
  name,
  version,
  description,
  encounterTypeUuid
) => {
  const abortController = new AbortController();
  const body = {
    name: name,
    version: version,
    description: description,
    encounterType: {
      uuid: encounterTypeUuid,
    },
  };

  const response: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/form/${formUuid}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
      signal: abortController.signal,
    }
  );

  return response;
};

export const saveNewForm = async (
  name: string,
  version: string,
  published?: boolean,
  description?: string,
  encounterType?: string
) => {
  const abortController = new AbortController();

  const body = {
    name: name,
    version: version,
    published: published || false,
    description: description || "",
  };
  if (encounterType) {
    body["encounterType"] = encounterType;
  }
  const headers = {
    "Content-Type": "application/json",
  };

  const response: FetchResponse = await openmrsFetch(`/ws/rest/v1/form`, {
    method: "POST",
    headers: headers,
    body: body,
    signal: abortController.signal,
  });

  return response.data;
};

export const publishForm = async (uuid) => {
  const body = { published: true };
  const response: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/form/${uuid}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    }
  );
  return response;
};

export const unpublishForm = async (uuid) => {
  const body = { published: false };
  const response: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/form/${uuid}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    }
  );
  return response;
};
