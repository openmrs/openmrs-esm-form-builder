import { restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import type { Form } from '@types';

export function useForms() {
  const url = `${restBaseUrl}/form?v=custom:(uuid,name,encounterType:(uuid,name),version,published,retired,resources:(uuid,name,dataType,valueReference))&includeAll=true`;

  const { data, error, isLoading, isValidating, mutate } = useOpenmrsFetchAll<Form>(url);

  return {
    forms: data ?? [],
    error: error,
    isLoading,
    isValidating,
    mutate,
  };
}
