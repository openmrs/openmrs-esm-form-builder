import useSWRImmutable from 'swr/immutable';
import { openmrsFetch } from '@openmrs/esm-framework';

export function useStandardFormSchema() {
  const url = 'https://json.openmrs.org/form.schema.json';
  const { data, error, isLoading } = useSWRImmutable<{ data }, Error>(url, openmrsFetch);

  return {
    schema: data?.data,
    schemaProperties: data?.data.properties,
    error,
    isLoading,
  };
}
