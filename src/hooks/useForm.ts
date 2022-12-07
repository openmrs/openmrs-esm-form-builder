import useSWRImmutable from "swr/immutable";
import { openmrsFetch } from "@openmrs/esm-framework";
import { Form } from "../types";

export const useForm = (uuid: string) => {
  const FORM_URL = `/ws/rest/v1/form/${uuid}?v=full`;

  const { data, error } = useSWRImmutable<{ data: Form }, Error>(
    uuid ? FORM_URL : null,
    openmrsFetch
  );

  return {
    form: data?.data,
    formError: error || null,
    isLoadingForm: (!data && !error) || false,
  };
};
