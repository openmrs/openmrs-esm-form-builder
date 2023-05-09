import { APIRequestContext } from "@playwright/test";

export const deleteForm = async (api: APIRequestContext, uuid: string) => {
  await api.delete(`form/${uuid}`, { data: {} });
};
