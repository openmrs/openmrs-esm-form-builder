import { useSession } from '@openmrs/esm-framework';

/**
 * Capitalizes the first letter of a string.
 */
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Hook to get readable language options from OpenMRS session.
 * Example output: [{ label: "English (en)", code: "en" }, { label: "French (fr)", code: "fr" }]
 */
export function useLanguageOptions(): { label: string; code: string }[] {
  const session = useSession();

  const localeCodes = session?.allowedLocales || [];
  const baseLocale = session?.locale || 'en';

  if (!Array.isArray(localeCodes) || localeCodes.length === 0) return [];

  let displayNames: Intl.DisplayNames;
  try {
    displayNames = new Intl.DisplayNames([baseLocale], { type: 'language' });
  } catch (err) {
    console.warn('Intl.DisplayNames not supported, falling back to raw locale codes.');
    return localeCodes.map((code) => ({ label: code, code }));
  }

  return localeCodes.map((code) => {
    const label = displayNames.of(code) || code;
    return {
      label: `${capitalizeFirstLetter(label)} (${code})`,
      code,
    };
  });
}
