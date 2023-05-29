import useSWR from "swr/immutable";
import { openmrsFetch } from "@openmrs/esm-framework";
import type { Form } from "../types";

export const useForm = (uuid: string) => {
  const url = `/ws/rest/v1/form/${uuid}?v=full`;

  const { data, error, isLoading, mutate } = useSWR<{ data: Form }, Error>(
    uuid ? url : null,
    openmrsFetch
  );

  return {
    form: data?.data,
    formError: error,
    isLoadingForm: isLoading,
    mutate,
  };
};
