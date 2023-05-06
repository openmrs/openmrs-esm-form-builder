import useSWR from "swr";
import { openmrsFetch } from "@openmrs/esm-framework";
import { Form } from "../types";

export function useForms() {
  const FORMS_URL =
    "/ws/rest/v1/form?v=custom:(uuid,name,encounterType:(uuid,name),version,published,retired,resources:(uuid,name,dataType,valueReference))";

  const { data, error, isValidating, mutate } = useSWR<
    { data: { results: Array<Form> } },
    Error
  >(FORMS_URL, openmrsFetch);

  return {
    forms: data?.data?.results ?? [],
    error: error,
    isLoading: (!data && !error) || false,
    isValidating,
    mutate,
  };
}
