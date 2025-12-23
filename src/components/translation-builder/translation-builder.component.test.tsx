import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TranslationBuilder from './translation-builder.component';

import { showModal, showSnackbar } from '@openmrs/esm-framework';
import { useLanguageOptions } from '@hooks/getLanguageOptionsFromSession';
import { fetchBackendTranslations } from '@hooks/useBackendTranslations';
import { uploadBackendTranslations } from '@hooks/uploadBackendTranslations';

jest.mock('@hooks/getLanguageOptionsFromSession');
jest.mock('@hooks/useBackendTranslations');
jest.mock('@hooks/uploadBackendTranslations');
jest.mock('@openmrs/esm-framework');

const mockedUseLanguageOptions = useLanguageOptions as jest.Mock;
const mockedFetchTranslations = fetchBackendTranslations as jest.Mock;
const mockedUploadTranslations = uploadBackendTranslations as jest.Mock;
const mockedShowModal = showModal as jest.Mock;
const mockedShowSnackbar = showSnackbar as jest.Mock;

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

const mockSchema = {
  uuid: 'test-form',
  name: 'Test Form',
  translations: {
    fr: {
      'field.label': 'Champ',
      'field.name': '',
    },
  },
  pages: [
    {
      sections: [
        {
          questions: [
            { id: 'field.label', label: 'Label' },
            { id: 'field.name', label: 'Name' },
          ],
        },
      ],
    },
  ],
};

describe('TranslationBuilder', () => {
  beforeEach(() => {
    mockedUseLanguageOptions.mockReturnValue([
      { code: 'en', label: 'English' },
      { code: 'fr', label: 'French' },
    ]);

    mockedFetchTranslations.mockResolvedValue({
      'field.label': 'Champ',
      'field.name': '',
    });

    mockedShowSnackbar.mockReset();
    mockedShowModal.mockReset();
    mockedUploadTranslations.mockReset();
    mockedFetchTranslations.mockClear();
  });

  async function selectLanguage(label: string) {
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByText(label));
  }

  //   test one ensures UI renders as correctly
  it('renders UI components correctly', async () => {
    render(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={jest.fn()} />);
    await selectLanguage('French');

    expect(screen.getByText(/download translation/i)).toBeInTheDocument();
    expect(screen.getByText(/upload translation/i)).toBeInTheDocument();
    expect(await screen.findByPlaceholderText(/search translation keys/i)).toBeInTheDocument(); // ✅ fixed
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Translated')).toBeInTheDocument();
    expect(screen.getByText('Untranslated')).toBeInTheDocument();
    expect(screen.getByTestId('translation-row-field-label')).toBeInTheDocument();
    expect(screen.getByText('Champ')).toBeInTheDocument();
  });

  //  test two shows updates translation on save
  it('opens edit modal and updates translation on save', async () => {
    const updateSchemaMock = jest.fn();
    let onSaveCallback!: (value: string) => void;

    mockedShowModal.mockImplementation((_id, { onSave }) => {
      onSaveCallback = onSave;
      return jest.fn();
    });

    render(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={updateSchemaMock} />);

    await selectLanguage('French');

    const editButtons = await screen.findAllByRole('button', { name: /edit string/i });
    fireEvent.click(editButtons[0]);

    act(() => {
      onSaveCallback('Updated Translation');
    });

    await waitFor(() => {
      expect(updateSchemaMock).toHaveBeenCalled();
    });

    const updatedSchema = updateSchemaMock.mock.calls[updateSchemaMock.mock.calls.length - 1][0];

    expect(updatedSchema.translations.fr['field.label']).toBe('Updated Translation');
  });
  //test three ensures the translated  works as expected
  it('filters translated keys in "Translated" tab', async () => {
    render(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={jest.fn()} />);
    await selectLanguage('French');

    fireEvent.click(screen.getAllByRole('tab')[1]);

    await waitFor(() => {
      expect(screen.getByTestId('translation-row-field-label')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('translation-row-field-name')).not.toBeInTheDocument();
  });
  //test four ensures the untranslated work as expected
  it('filters untranslated keys in "Untranslated" tab', async () => {
    render(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={jest.fn()} />);
    await selectLanguage('French');

    fireEvent.click(screen.getAllByRole('tab')[2]);

    await waitFor(() => {
      expect(screen.getByTestId('translation-row-field-name')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('translation-row-field-label')).not.toBeInTheDocument();
  });

  //  test five filtering keys by search
  it('filters keys by search query', async () => {
    render(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={jest.fn()} />);
    await selectLanguage('French');

    fireEvent.change(await screen.findByPlaceholderText(/search translation keys/i), {
      target: { value: 'name' },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('translation-row-field-label')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('translation-row-field-name')).toBeInTheDocument();
  });
  //test six switching languages and backend
  it('switches language and loads backend translations', async () => {
    const updateSchemaMock = jest.fn();

    mockedFetchTranslations.mockResolvedValue({
      'field.label': 'Étiquette',
      'field.name': 'Nom',
    });

    render(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={updateSchemaMock} />);
    await selectLanguage('French');

    await waitFor(() => {
      expect(mockedFetchTranslations).toHaveBeenCalled();
    });
    expect(updateSchemaMock).toHaveBeenCalled();
    expect(screen.getByText('Étiquette')).toBeInTheDocument();
    expect(screen.getByText('Nom')).toBeInTheDocument();
  });
  //test seven handling download with translations
  it('handles download when translations exist', async () => {
    global.URL.createObjectURL = jest.fn(() => 'blob:url') as any;
    global.URL.revokeObjectURL = jest.fn() as any;

    render(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={jest.fn()} />);
    await selectLanguage('French');

    fireEvent.click(screen.getByText(/download translation/i));

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });
  //test eight shows error when download without translations
  it('shows inline error message when download attempted without translations', async () => {
    render(<TranslationBuilder formSchema={{ ...mockSchema, translations: {} }} onUpdateSchema={jest.fn()} />);

    await selectLanguage('French');
    fireEvent.click(screen.getByText(/download translation/i));

    await waitFor(() => {
      expect(screen.getByText(/no translations found/i)).toBeInTheDocument(); // ✅ quick fix
    });
  });
  // test nine
  it('uploads translation successfully and shows snackbar', async () => {
    mockedUploadTranslations.mockResolvedValue({});

    render(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={jest.fn()} />);
    await selectLanguage('French');

    fireEvent.click(screen.getByText(/upload translation/i));

    await waitFor(() => {
      expect(mockedUploadTranslations).toHaveBeenCalled();
    });
    expect(mockedShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }));
  });
  //test ten showing the snackbar notification
  it('shows error snackbar if upload fails', async () => {
    mockedUploadTranslations.mockRejectedValue(new Error('Upload failed'));

    render(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={jest.fn()} />);
    await selectLanguage('French');

    fireEvent.click(screen.getByText(/upload translation/i));

    await waitFor(() => {
      expect(mockedShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
    });
  });
});
