import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export function useConceptName(conceptId: string | undefined) {
  const customRepresentation = 'custom:(name:(display))';
  const url = `${restBaseUrl}/concept/${conceptId}?v=${customRepresentation}`;

  const { data, error } = useSWR<{ data: { name: { display: string } } }, Error>(conceptId ? url : null, openmrsFetch);

  return {
    conceptName: data?.data?.name?.display ?? null,
    conceptNameLookupError: error,
    isLoadingConceptName: (conceptId && !data && !error) || false,
  };
}
