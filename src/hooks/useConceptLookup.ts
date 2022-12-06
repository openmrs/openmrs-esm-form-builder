import useSWR from "swr";
import { openmrsFetch } from "@openmrs/esm-framework";
import { Concept } from "../types";

export function useConceptLookup(conceptId: string) {
  const CONCEPT_LOOKUP_URL = `/ws/rest/v1/concept?q=${conceptId}&v=full`;

  const { data, error } = useSWR<{ data: { results: Array<Concept> } }, Error>(
    conceptId ? CONCEPT_LOOKUP_URL : null,
    openmrsFetch
  );

  return {
    concepts: data?.data?.results ?? [],
    error: error || null,
    isLoading: (!data && !error) || false,
  };
}
