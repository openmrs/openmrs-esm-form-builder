import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

interface ClobData {
  translations: Record<string, string>;
}

export function useBackendTranslations(formUuid: string | undefined, langCode: string) {
  const shouldFetch = !!formUuid && langCode !== 'en';

  const { data, error, isLoading } = useSWR<ClobData>(
    shouldFetch ? `${restBaseUrl}/form/${formUuid}?v=full` : null,
    async (formUrl) => {
      const formResponse = await openmrsFetch(formUrl);
      const form = formResponse?.data;

      if (!form?.resources?.length) return { translations: {} };

      const translationResource = form.resources.find((r: any) => r.name?.endsWith(`translations_${langCode}`));

      if (!translationResource?.valueReference) return { translations: {} };

      const clobUrl = `${restBaseUrl}/clobdata/${translationResource.valueReference}`;
      const clobResponse = await openmrsFetch(clobUrl);
      const clobData = clobResponse?.data;

      return clobData ?? { translations: {} };
    },
  );

  return {
    backendTranslations: data?.translations ?? {},
    backendTranslationError: error,
    isLoadingTranslations: isLoading,
  };
}
