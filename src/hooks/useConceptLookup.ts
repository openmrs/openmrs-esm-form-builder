import useSWR from "swr";
import { openmrsFetch, showToast } from "@openmrs/esm-framework";
import { Concept } from "../types";

export function useConceptLookup(conceptID) {
  const url =
    conceptID != "" ? `/ws/rest/v1/concept?q=${conceptID}&v=full` : null;
  const { data, error } = useSWR<{ data: { results: Array<Concept> } }, Error>(
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
  return { concepts: data?.data?.results ?? [] };
}
