import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export function usePatientIdentifierName(identifierType: string | undefined) {
  const url = `${restBaseUrl}/patientidentifiertype/${identifierType}`;

  const { data, error } = useSWR<{ data: { name: { display: string } } }, Error>(
    identifierType ? url : null,
    openmrsFetch,
  );

  return {
    patientidentifierName: data?.data?.name ?? null,
    patientidentifierNameLookupError: error,
    isLoadingpatientidentifierName: (!data && !error) || false,
  };
}
