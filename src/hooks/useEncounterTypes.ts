import useSWRImmutable from "swr/immutable";
import { openmrsFetch } from "@openmrs/esm-framework";
import type { EncounterType } from "../types";

export const useEncounterTypes = () => {
  const url = `/ws/rest/v1/encountertype?v=custom:(uuid,name)`;

  const { data, error, isLoading } = useSWRImmutable<
    { data: { results: Array<EncounterType> } },
    Error
  >(url, openmrsFetch);

  return {
    encounterTypes: data?.data?.results ?? [],
    encounterTypesError: error,
    isEncounterTypesLoading: isLoading,
  };
};
