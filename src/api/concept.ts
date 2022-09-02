import useSWR from "swr";
import { openmrsFetch, showToast } from "@openmrs/esm-framework";
import { Concept } from "./types";

export function useConcepts() {
  const url = "/ws/rest/v1/concept?class=Question&v=full";
  const { data, error } = useSWR<{ data: { results: Array<Concept> } }, Error>(
    url,
    openmrsFetch
  );
  if (error) {
    showToast({
      title: "Error",
      kind: "error",
      critical: true,
      description: `${error.message}`,
    });
  }
  return { concepts: data?.data?.results ?? [] };
}
