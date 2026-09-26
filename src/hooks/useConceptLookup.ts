import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { Concept } from '@types';

export function useConceptLookup(conceptId: string) {
  // includeAll ensures retired concepts show up in search results so they can
  // be flagged as retired in the UI. See O3-4997.
  const url = `${restBaseUrl}/concept?q=${conceptId}&v=full&includeAll=true`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<Concept> } }, Error>(
    conceptId ? url : null,
    openmrsFetch,
  );

  return {
    concepts: data?.data?.results ?? [],
    conceptLookupError: error,
    isLoadingConcepts: isLoading,
  };
}
