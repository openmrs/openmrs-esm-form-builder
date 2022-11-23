import useSWRImmutable from "swr/immutable";
import { openmrsFetch, showToast } from "@openmrs/esm-framework";
import { Form } from "../types";

export const useFormMetadata = (uuid: string) => {
  const url = uuid == "new" ? null : `/ws/rest/v1/form/${uuid}?v=full`;
  const { data, error } = useSWRImmutable<{ data: Form }, Error>(
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

  if (uuid == "new") {
    return {
      formMetaData: null,
    };
  } else {
    return {
      formMetaData: data?.data,
    };
  }
};
