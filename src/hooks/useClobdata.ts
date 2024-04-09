import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { Form, Schema } from '../types';

function hasValidResources(form?: Form) {
  return form?.resources?.some(({ name, valueReference }) => name === 'JSON schema' && valueReference != null);
}

export const useClobdata = (form?: Form) => {
  const valueReferenceUuid = form?.resources?.find(({ name }) => name === 'JSON schema')?.valueReference;
  const url = `${restBaseUrl}/clobdata/${valueReferenceUuid}`;

  const { data, error, isLoading, isValidating, mutate } = useSWRImmutable<{ data: Schema }, Error>(
    hasValidResources(form) ? url : null,
    openmrsFetch,
  );

  return {
    clobdata: data?.data,
    clobdataError: error,
    isLoadingClobdata: isLoading,
    isValidatingClobdata: isValidating,
    mutate: mutate,
  };
};
