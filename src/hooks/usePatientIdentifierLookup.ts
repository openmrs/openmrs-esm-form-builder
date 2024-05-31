import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { PatientIdentifierType } from '../types';

export function usePatientIdentifierLookup(identifierId: string) {
  const url = `${restBaseUrl}/patientidentifiertype/${identifierId}`;

  const { data, error, isLoading } = useSWR<{ data: PatientIdentifierType }, Error>(
    identifierId ? url : null,
    openmrsFetch,
  );

  return {
    patientIdentifierType: data?.data ?? {},
    conceptLookupError: error,
    isLoadingPatientIdentifierType: isLoading,
  };
}
