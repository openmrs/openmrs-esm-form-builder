import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';

export function useStandardFormSchema() {
  const url = 'https://json.openmrs.org/form.schema.json';
  const { data, error, isLoading } = useSWR<{ data }, Error>(url, openmrsFetch);

  return {
    schema: data?.data,
    error,
    isLoading,
  };
}
