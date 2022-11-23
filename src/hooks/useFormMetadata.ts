import useSWRImmutable from "swr/immutable";
import { openmrsFetch } from "@openmrs/esm-framework";
import { Form } from "../types";

export const useFormMetadata = (uuid: string) => {
  const url = `/ws/rest/v1/form/${uuid}?v=full`;

  const { data, error } = useSWRImmutable<{ data: Form }, Error>(
    uuid === "new" ? null : url,
    openmrsFetch
  );

  return {
    metadata: data?.data,
    error: error,
    isLoading: !data && !error,
  };
};
