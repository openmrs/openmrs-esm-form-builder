import useSWR from "swr";
import { openmrsFetch } from "@openmrs/esm-framework";
import type { Concept } from "../types";

export function useConceptLookup(conceptId: string) {
  const url = `/ws/rest/v1/concept?q=${conceptId}&v=full`;

  const { data, error } = useSWR<{ data: { results: Array<Concept> } }, Error>(
    conceptId ? url : null,
    openmrsFetch
  );

  return {
    concepts: data?.data?.results ?? [],
    conceptLookupError: error || null,
    isLoadingConcepts: (!data && !error) || false,
  };
}
