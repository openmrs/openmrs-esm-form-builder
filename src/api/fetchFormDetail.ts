import useSWRImmutable from "swr/immutable";
import { openmrsFetch, showToast } from "@openmrs/esm-framework";
import { Form, Schema } from "../api/types";

export const useFormMetadata = (uuid: string) => {
  const url = uuid == "new" ? null : `/ws/rest/v1/form/${uuid}?v=full`;
  const { data, error } = useSWRImmutable<{ data: Form }, Error>(
    url,
    openmrsFetch
  );
  if (error) {
    showToast({
      title: "Error",
      kind: "error",
      critical: true,
      description: `${error.message}`,
    });
  }
  if (uuid == "new") {
    return {
      formMetaData: null,
    };
  } else {
    return {
      formMetaData: data?.data,
    };
  }
};

export const useFormSchema = (form?: Form) => {
  const schema: Schema = {
    name: "",
    pages: [],
    processor: "EncounterFormProcessor",
    uuid: "xxx",
    referencedForms: [],
  };
  const url =
    form?.resources.length == 0 || !form?.resources[0]
      ? null
      : `/ws/rest/v1/clobdata/${form?.resources[0].valueReference}`;
  const { data, error } = useSWRImmutable<{ data: Schema }, Error>(
    url,
    openmrsFetch
  );
  if (error) {
    showToast({
      title: "Error",
      kind: "error",
      critical: true,
      description: `${error.message}`,
    });
  }
  if (url == null) {
    return {
      formSchemaData: schema,
    };
  } else {
    return {
      formSchemaData: data?.data,
    };
  }
};
