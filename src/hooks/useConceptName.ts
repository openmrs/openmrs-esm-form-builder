import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { isEmpty } from '@openmrs/openmrs-form-engine-lib';

export function useConceptName(conceptId: string | undefined) {
  const customRepresentation = 'custom:(name:(display))';
  const url = `${restBaseUrl}/concept/${conceptId}?v=${customRepresentation}`;

  const { data, error } = useSWR<{ data: { name: { display: string } } }, Error>(conceptId ? url : null, openmrsFetch);

  return {
    conceptName: data?.data?.name?.display ?? null,
    conceptNameLookupError: error,
    isLoadingConceptName: !conceptId || isEmpty(conceptId) ? false : (!data && !error) || false,
  };
}
