import useSWR from "swr";
import { openmrsFetch } from "@openmrs/esm-framework";

export function useConceptName(conceptId: string | undefined) {
  const customRepresentation = "custom:(name:(display))";
  const url = `/ws/rest/v1/concept/${conceptId}?v=${customRepresentation}`;

  const { data, error } = useSWR<
    { data: { name: { display: string } } },
    Error
  >(conceptId ? url : null, openmrsFetch);

  return {
    conceptName: data?.data?.name?.display ?? null,
    conceptNameLookupError: error,
    isLoadingConceptName: (!data && !error) || false,
  };
}
