import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export function usePatientIdentifierName(identifierType: string | undefined) {
  const url = `${restBaseUrl}/patientidentifiertype/${identifierType}`;

  const { data, error, isLoading } = useSWR<{ data: { name: { display: string } } }, Error>(
    identifierType ? url : null,
    openmrsFetch,
  );

  return {
    patientIdentifierName: data?.data?.name ?? null,
    patientIdentifierNameLookupError: error,
    isLoadingPatientidentifierName: isLoading || false,
  };
}
