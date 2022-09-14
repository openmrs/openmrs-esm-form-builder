import useSWRImmutable from "swr/immutable";
import { openmrsFetch, showToast } from "@openmrs/esm-framework";
import { Form, Schema, EncounterType } from "../api/types";

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
    encounterType: "",
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
      isLoading: !schema && !error,
    };
  } else {
    return {
      formSchemaData: data?.data,
      isLoading: !data && !error,
    };
  }
};

export const useEncounterType = () => {
  const url = `/ws/rest/v1/encountertype?v=custom:(uuid,name)`;
  const { data, error } = useSWRImmutable<
    { data: { results: Array<EncounterType> } },
    Error
  >(url, openmrsFetch);
  return {
    encounterTypes: data?.data?.results ?? [],
    isEncounterTypesLoading: !error && !data,
    encounterTypesError: error,
  };
};
