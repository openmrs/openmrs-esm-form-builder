import { APIRequestContext } from "@playwright/test";
import customSchema from "../support/customSchema.json";

export const createForm = async (api: APIRequestContext) => {
  const formResponse = await api.post("form", {
    data: {
      name: "Form created for testing",
      version: "1.0",
      published: false,
      description: "This is the form description",
      encounterType: {
        uuid: "e22e39fd-7db2-45e7-80f1-60fa0d5a4378",
      },
    },
  });
  const form = await formResponse.json();

  return form;
};

export const addFormResources = async (
  api: APIRequestContext,
  valueReference: string,
  formUuid: string
) => {
  await api.post(`form/${formUuid}/resource`, {
    data: {
      name: "JSON schema",
      dataType: "AmpathJsonSchema",
      valueReference: valueReference,
    },
  });
};

export const createValueReference = async (api: APIRequestContext) => {
  const boundary =
    "--------------------------" + Math.floor(Math.random() * 1e16);
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelimiter = "\r\n--" + boundary + "--";

  const body =
    delimiter +
    'Content-Disposition: form-data; name="file"; filename="schema.json"\r\n' +
    "Content-Type: application/json\r\n\r\n" +
    JSON.stringify(customSchema) +
    closeDelimiter;

  const valueReference = await api.post("clobdata", {
    data: body,
    headers: {
      "Content-Type": "multipart/form-data; boundary=" + boundary,
    },
  });

  return await valueReference.text();
};

export async function deleteForm(api: APIRequestContext, uuid: string) {
  await api.delete(`form/${uuid}`, { data: {} });
}
