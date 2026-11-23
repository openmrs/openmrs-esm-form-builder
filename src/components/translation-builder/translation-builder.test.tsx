import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { fetchBackendTranslations } from '@hooks/useBackendTranslations';
import TranslationBuilder from './translation-builder.component';

vi.mock('@hooks/getLanguageOptionsFromSession', () => ({
  useLanguageOptions: () => [
    { label: 'English (en)', code: 'en' },
    { label: 'French (fr)', code: 'fr' },
  ],
}));

vi.mock('@hooks/useBackendTranslations', () => ({
  fetchBackendTranslations: vi.fn(),
}));

const mockFetchBackendTranslations = vi.mocked(fetchBackendTranslations);

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

describe('TranslationBuilder', () => {
  it('reports translations for the selected language as a flat map without changing the schema', async () => {
    const user = userEvent.setup();
    const onTranslationsChange = vi.fn();
    const originalSchema = structuredClone(formSchema);
    mockFetchBackendTranslations.mockResolvedValue({ 'Page 1': 'Page un', 'Section 1': 'Section 1' });

    render(
      <MemoryRouter>
        <TranslationBuilder formSchema={formSchema} onTranslationsChange={onTranslationsChange} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'French (fr)' }));

    await waitFor(() =>
      expect(onTranslationsChange).toHaveBeenCalledWith('fr', { 'Page 1': 'Page un', 'Section 1': 'Section 1' }),
    );
    expect(formSchema).toEqual(originalSchema);
  });
});
