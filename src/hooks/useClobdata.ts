import useSWRImmutable from "swr/immutable";
import { openmrsFetch } from "@openmrs/esm-framework";
import { Form, Schema } from "../types";

export const useClobdata = (form?: Form) => {
  const valueReference = form?.resources?.[0].valueReference;
  const formHasResources = form?.resources.length > 0 && valueReference;
  const CLOBDATA_URL = `/ws/rest/v1/clobdata/${valueReference}`;

  const { data, error } = useSWRImmutable<{ data: Schema }, Error>(
    formHasResources ? CLOBDATA_URL : null,
    openmrsFetch
  );

  return {
    clobdata: data?.data,
    clobdataError: error || null,
    isLoadingClobdata: (!data && !error) || false,
  };
};
