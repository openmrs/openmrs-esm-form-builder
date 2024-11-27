import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { Form } from '@types';

export function useForms() {
  const url = `${restBaseUrl}/form?v=custom:(uuid,name,encounterType:(uuid,name),version,published,retired,resources:(uuid,name,dataType,valueReference))`;

  const { data, error, isValidating, mutate } = useSWR<{ data: { results: Array<Form> } }, Error>(url, openmrsFetch);

  return {
    forms: data?.data?.results ?? [],
    error: error,
    isLoading: (!data && !error) || false,
    isValidating,
    mutate,
  };
}
