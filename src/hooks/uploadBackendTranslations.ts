import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { Resource } from '@types';

export async function uploadBackendTranslations(
  formUuid: string,
  langCode: string,
  formName: string,
  translations: Record<string, string>,
): Promise<void> {
  try {
    const formResponse = await openmrsFetch(`${restBaseUrl}/form/${formUuid}?v=full`);
    const form = formResponse?.data;

    const resourceName = `${formName}_translations_${langCode}`;
    const existingResource = form?.resources?.find((r: Resource) => r.name === resourceName);

    if (existingResource) {
      await openmrsFetch(`${restBaseUrl}/form/${formUuid}/resource/${existingResource.uuid}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (existingResource.valueReference) {
        await openmrsFetch(`${restBaseUrl}/clobdata/${existingResource.valueReference}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const translationBlob = new Blob([JSON.stringify({ translations })], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', translationBlob);

    const clobResponse = await window.fetch(`${window.openmrsBase}${restBaseUrl}/clobdata`, {
      method: 'POST',
      body: formData,
    });

    const newClobdataUuid = await clobResponse.text();
    if (!newClobdataUuid) throw new Error('Failed to create new clobdata');

    await openmrsFetch(`${restBaseUrl}/form/${formUuid}/resource`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: resourceName,
        valueReference: newClobdataUuid,
      }),
    });
  } catch (error) {
    console.error('Error uploading backend translations:', error);
    throw error;
  }
}
