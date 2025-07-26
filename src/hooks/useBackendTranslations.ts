import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export async function fetchBackendTranslations(
  formUuid: string,
  langCode: string,
  fallbackStrings: Record<string, string>,
): Promise<Record<string, string>> {
  try {
    const formUrl = `${restBaseUrl}/form/${formUuid}?v=full`;
    const formResponse = await openmrsFetch(formUrl);
    const form = formResponse?.data;

    const translationResource = form?.resources?.find((r: any) => r.name?.endsWith(`translations_${langCode}`));

    if (!translationResource?.valueReference) return fallbackStrings;

    const clobUrl = `${restBaseUrl}/clobdata/${translationResource.valueReference}`;
    const clobResponse = await openmrsFetch(clobUrl);
    const backendTranslations: Record<string, string> = clobResponse?.data?.translations ?? {};

    // Merge only existing keys
    return Object.entries(fallbackStrings).reduce(
      (acc, [key, value]) => {
        acc[key] = backendTranslations[key] ?? value;
        return acc;
      },
      {} as Record<string, string>,
    );
  } catch (error) {
    console.error('Error fetching backend translations:', error);
    return fallbackStrings;
  }
}
