import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { Concept } from '../types';

export function useConceptInfo(conceptId: string) {
  const url = `${restBaseUrl}/concept/${conceptId}`;

  const { data } = useSWR<{ data: Concept }, Error>(conceptId ? url : null, openmrsFetch);

  return {
    concept: data?.data ?? null,
  };
}
