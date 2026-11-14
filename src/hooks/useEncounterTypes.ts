import { restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import type { EncounterType } from '@types';

export const useEncounterTypes = () => {
  const url = `${restBaseUrl}/encountertype?v=custom:(uuid,name)`;

  const { data, error, isLoading } = useOpenmrsFetchAll<EncounterType>(url, { immutable: true });

  return {
    encounterTypes: data ?? [],
    encounterTypesError: error,
    isEncounterTypesLoading: isLoading,
  };
};
