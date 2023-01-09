import useSWR from "swr";
import { openmrsFetch } from "@openmrs/esm-framework";

export function useConceptName(conceptId: string) {
  const customRepresentation = "custom:(name:(display))";
  const CONCEPT_LOOKUP_URL = `/ws/rest/v1/concept/${conceptId}?v=${customRepresentation}`;

  const { data, error } = useSWR<
    { data: { name: { display: string } } },
    Error
  >(conceptId ? CONCEPT_LOOKUP_URL : null, openmrsFetch);

  return {
    conceptName: data?.data?.name?.display ?? null,
    conceptNameLookupError: error || null,
    isLoadingConceptName: (!data && !error) || false,
  };
}
