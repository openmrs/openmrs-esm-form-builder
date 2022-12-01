import useSWRImmutable from "swr/immutable";
import { openmrsFetch } from "@openmrs/esm-framework";
import { Form, Schema } from "../types";

export const useClobdata = (form?: Form) => {
  const valueReference = form?.resources?.[0]?.valueReference;
  const formHasResources = form?.resources.length > 0 && valueReference;

  const url = `/ws/rest/v1/clobdata/${form?.resources[0].valueReference}`;

  const { data, error } = useSWRImmutable<{ data: Schema }, Error>(
    formHasResources ? url : null,
    openmrsFetch
  );

  return {
    clobdata: data?.data,
    clobdataError: error,
    isLoadingClobdata: !data && !error,
  };
};
