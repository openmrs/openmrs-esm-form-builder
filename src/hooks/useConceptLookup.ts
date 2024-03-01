import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { Concept } from '../types';

export function useConceptLookup(conceptId: string) {
  const url = `${restBaseUrl}/concept?q=${conceptId}&v=full`;

  const { data, error } = useSWR<{ data: { results: Array<Concept> } }, Error>(conceptId ? url : null, openmrsFetch);

  return {
    concepts: data?.data?.results ?? [],
    conceptLookupError: error,
    isLoadingConcepts: (!data && !error) || false,
  };
}
