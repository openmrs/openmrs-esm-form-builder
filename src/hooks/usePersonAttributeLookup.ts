import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { PersonAttributeType } from '../types';

export function usePersonAttributeLookup(attributeTypeId: string) {
  const url = `${restBaseUrl}/personattributetype?q=${attributeTypeId}&v=default`;

  const { data, error, isLoading } = useSWR<{ data: PersonAttributeType }, Error>(
    attributeTypeId ? url : null,
    openmrsFetch,
  );

  return {
    personAttributeType: data?.data ?? {},
    personAttributeLookupError: error,
    isLoadingPersonAttributeType: isLoading,
  };
}
