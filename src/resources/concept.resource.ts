import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export async function fetchConceptById(uuid: string) {
  const url = `${restBaseUrl}/concept/${uuid}?v=full`;
  return await openmrsFetch(url);
}
