import useSWRImmutable from "swr/immutable";
import { openmrsFetch, showToast } from "@openmrs/esm-framework";
import { Form, Schema } from "../types";

export const useFormClobdata = (form?: Form) => {
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
