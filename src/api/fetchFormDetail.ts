import useSWR from "swr";
import { openmrsFetch } from "@openmrs/esm-framework";
import { Form, Schema } from "../api/types";

export const useFormMetadata = (uuid: string) => {
  const url = `/ws/rest/v1/form/${uuid}?v=full`;
  const { data, error } = useSWR<{ data: Form }, Error>(url, openmrsFetch);
  return {
    formMetaData: data?.data,
    isFormMetaDataLoading: !error && !data,
    formMetaDataError: error,
  };
};

export const useFormSchema = (form: Form) => {
  const GetDefaultSchema = () => {
    const schema: Schema = {
      name: "",
      pages: [],
      processor: "EncounterFormProcessor",
      uuid: "xxx",
      referencedForms: [],
    };
    return schema;
  };
  const url =
    form?.resources.length == 0 || !form?.resources[0]
      ? null
      : `/ws/rest/v1/clobdata/${form?.resources[0].valueReference}`;
  const { data, error } = useSWR<{ data: string }, Error>(url, openmrsFetch);
  return {
    formSchemaData: data == null ? GetDefaultSchema() : data?.data,
    isSchemaLoading: !error && !data,
    formSchemaError: error,
  };
};
