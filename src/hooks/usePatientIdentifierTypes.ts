import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { PatientIdentifierType } from '@types';

export function usePatientIdentifierTypes() {
  const customRepresentation = 'custom:(uuid,display,name,description)';
  const url = `${restBaseUrl}/patientidentifiertype?v=${customRepresentation}`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<PatientIdentifierType> } }, Error>(
    url,
    openmrsFetch,
  );

  return {
    patientIdentifierTypes: data?.data?.results ?? [],
    patientIdentifierTypeLookupError: error,
    isLoadingPatientIdentifierTypes: isLoading,
  };
}
