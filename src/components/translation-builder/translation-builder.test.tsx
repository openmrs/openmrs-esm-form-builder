import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { fetchBackendTranslations } from '@hooks/useBackendTranslations';
import { uploadBackendTranslations } from '@hooks/uploadBackendTranslations';
import TranslationBuilder from './translation-builder.component';

vi.mock('@hooks/getLanguageOptionsFromSession', () => ({
  useLanguageOptions: () => [
    { label: 'English (en)', code: 'en' },
    { label: 'French (fr)', code: 'fr' },
    { label: 'Spanish (es)', code: 'es' },
  ],
}));

vi.mock('@hooks/useBackendTranslations', () => ({
  fetchBackendTranslations: vi.fn(),
}));

vi.mock('@hooks/uploadBackendTranslations', () => ({
  uploadBackendTranslations: vi.fn(),
}));

const mockFetchBackendTranslations = vi.mocked(fetchBackendTranslations);
const mockUploadBackendTranslations = vi.mocked(uploadBackendTranslations);

// Carbon's TabList reads media queries, which jsdom doesn't implement
window.matchMedia = vi.fn().mockReturnValue({
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

const formSchema = {
  name: 'Test form',
  pages: [{ label: 'Page 1', sections: [{ label: 'Section 1', questions: [] }] }],
};

function TranslationBuilderWithState({
  onTranslationsChange,
}: {
  onTranslationsChange?: (langCode: string, translations: Record<string, string>) => void;
}) {
  const [translationsByLanguage, setTranslationsByLanguage] = useState<Record<string, Record<string, string>>>({});

  return (
    <MemoryRouter>
      <TranslationBuilder
        formSchema={formSchema}
        translationsByLanguage={translationsByLanguage}
        onTranslationsChange={(langCode, translations) => {
          onTranslationsChange?.(langCode, translations);
          setTranslationsByLanguage((previous) => ({ ...previous, [langCode]: translations }));
        }}
      />
    </MemoryRouter>
  );
}

async function selectLanguage(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('combobox'));
  await user.click(screen.getByRole('option', { name }));
}

describe('TranslationBuilder', () => {
  it('reports translations for the selected language as a flat map without changing the schema', async () => {
    const user = userEvent.setup();
    const onTranslationsChange = vi.fn();
    const originalSchema = structuredClone(formSchema);
    mockFetchBackendTranslations.mockResolvedValue({ 'Page 1': 'Page un', 'Section 1': 'Section 1' });

    render(<TranslationBuilderWithState onTranslationsChange={onTranslationsChange} />);

    await selectLanguage(user, 'French (fr)');

    await waitFor(() =>
      expect(onTranslationsChange).toHaveBeenCalledWith('fr', { 'Page 1': 'Page un', 'Section 1': 'Section 1' }),
    );
    expect(formSchema).toEqual(originalSchema);
  });

  it("doesn't upload the previous language's translations while the selected language is loading", async () => {
    const user = userEvent.setup();
    mockFetchBackendTranslations.mockResolvedValueOnce({ 'Page 1': 'Page un', 'Section 1': 'Section un' });
    mockFetchBackendTranslations.mockReturnValueOnce(new Promise(() => {}));

    render(<TranslationBuilderWithState />);

    await selectLanguage(user, 'French (fr)');
    await screen.findByText('Page un');
    await selectLanguage(user, 'Spanish (es)');
    await user.click(screen.getByRole('button', { name: /^upload/i }));

    expect(mockUploadBackendTranslations).not.toHaveBeenCalled();
  });
});
