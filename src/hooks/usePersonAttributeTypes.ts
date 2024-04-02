import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type PersonAttributeType } from '../types';

export function usePersonAttributeTypes() {
  const customRepresentation = 'custom:(uuid,display,format,concept)';
  const url = `${restBaseUrl}/personattributetype?v=${customRepresentation}`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<PersonAttributeType> } }, Error>(
    url,
    openmrsFetch,
  );

  return {
    personAttributeTypes: data?.data?.results ?? [],
    personAttributeTypeLookupError: error,
    isLoadingPersonAttributeTypes: isLoading,
  };
}
