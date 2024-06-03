import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export function usePersonAttributeName(attributeType: string | undefined) {
  const url = `${restBaseUrl}/personattributetype?q=${attributeType}&v=default`;

  const { data, error, isLoading } = useSWR<{ data: { name: { display: string } } }, Error>(
    attributeType ? url : null,
    openmrsFetch,
  );

  return {
    personAttributeName: data?.data?.name ?? null,
    personAttributeNameLookupError: error,
    isLoadingPersonAttributeName: isLoading || false,
  };
}
