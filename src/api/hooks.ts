import useSWR from "swr";
import { openmrsFetch } from "@openmrs/esm-framework";
import { Form } from "./types";

export function getPocForms() {
  const url =
    "/ws/rest/v1/form?q=POC&v=custom:(uuid,name,encounterType:(uuid,name),version,published,retired,resources:(uuid,name,dataType,valueReference))";
  const { data, error, isValidating } = useSWR<
    { data: { results: Form[] } },
    Error
  >(url, openmrsFetch);
  return { ...getPocForms, data: data?.data?.results };
}
