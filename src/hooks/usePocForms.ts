import useSWR from "swr";
import { openmrsFetch } from "@openmrs/esm-framework";
import { Form } from "../types";

export function usePocForms() {
  const FORMS_URL =
    "/ws/rest/v1/form?q=POC&v=custom:(uuid,name,encounterType:(uuid,name),version,published,retired,resources:(uuid,name,dataType,valueReference))";

  const { data, error, isValidating } = useSWR<
    { data: { results: Array<Form> } },
    Error
  >(FORMS_URL, openmrsFetch);

  return {
    forms: data?.data?.results ?? [],
    error: error,
    isLoading: (!data && !error) || false,
    isValidating,
  };
}
