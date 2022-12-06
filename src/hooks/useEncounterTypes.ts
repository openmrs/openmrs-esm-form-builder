import useSWRImmutable from "swr/immutable";
import { openmrsFetch } from "@openmrs/esm-framework";
import { EncounterType } from "../types";

export const useEncounterTypes = () => {
  const ENCOUNTER_TYPES_URL = `/ws/rest/v1/encountertype?v=custom:(uuid,name)`;

  const { data, error } = useSWRImmutable<
    { data: { results: Array<EncounterType> } },
    Error
  >(ENCOUNTER_TYPES_URL, openmrsFetch);

  return {
    encounterTypes: data?.data?.results ?? [],
    encounterTypesError: error || null,
    isEncounterTypesLoading: (!data && !error) || false,
  };
};
