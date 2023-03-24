import { openmrsFetch, FetchResponse } from "@openmrs/esm-framework";
import { Schema } from "./types";

export const deleteClobData = async (valueReference: string) => {
  const request: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/clobdata/${valueReference}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );
  return request;
};

export const deleteResource = async (
  formUUID: string,
  resourceUUID: string
) => {
  const request: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/form/${formUUID}/resource/${resourceUUID}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );
  return request;
};

export const uploadSchema = async (schema: Schema) => {
  const schemaBlob = new Blob([JSON.stringify(schema)], {
    type: "application/json",
  });
  const body = new FormData();
  body.append("file", schemaBlob);

  const request = await window
    .fetch(`${window.spaBase}/ws/rest/v1/clobdata`, {
      body,
      method: "POST",
    })
    .then((response) => {
      return response.clone().text();
    });

  return request;
};

export const getResourceUUID = async (
  formUUID: string,
  valueReference: any
) => {
  const body = {
    name: "JSON schema",
    dataType: "AmpathJsonSchema",
    valueReference: valueReference,
  };

  const request: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/form/${formUUID}/resource`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    }
  );

  return request;
};

export const saveNewForm = async (
  name: any,
  version: any,
  published?: any,
  description?: any,
  encounterType?: any
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
  const request: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/form/${uuid}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    }
  );
  return request;
};

export const unpublishForm = async (uuid) => {
  const body = { published: false };
  const request: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/form/${uuid}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    }
  );
  return request;
};

export const updateName = async (name: string, uuid) => {
  const body = { name: name };
  const request: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/form/${uuid}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    }
  );
  return request;
};

export const updateVersion = async (version: string, uuid) => {
  const body = { version: version };
  const request: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/form/${uuid}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    }
  );
  return request;
};

export const updateDescription = async (description: string, uuid) => {
  const body = { description: description };
  const request: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/form/${uuid}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    }
  );
  return request;
};

export const updateEncounterType = async (encounterTypeUUID: any, uuid) => {
  const body = { encounterType: encounterTypeUUID };
  const request: FetchResponse = await openmrsFetch(
    `/ws/rest/v1/form/${uuid}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    }
  );
  return request;
};
