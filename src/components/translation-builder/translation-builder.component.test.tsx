import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TranslationBuilder from './translation-builder.component';

import { showModal, showSnackbar, useSession, openmrsFetch } from '@openmrs/esm-framework';

// mocked framework functions
const mockedShowModal = jest.mocked(showModal);
const mockedShowSnackbar = jest.mocked(showSnackbar);
const mockedUseSession = jest.mocked(useSession);
const mockedOpenmrsFetch = jest.mocked(openmrsFetch);


const mockSchema = {
  uuid: 'test-form',
  name: 'Test Form',
  translations: {
    fr: {

      Label: 'Champ',
      Name: '',

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


function renderWithRouter(ui: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={['/form/test-form-uuid']}>
      <Routes>
        <Route path="/form/:formUuid" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TranslationBuilder', () => {
  beforeEach(() => {
    mockedUseSession.mockReturnValue({
      allowedLocales: ['en', 'fr'],
      locale: 'en',
    } as ReturnType<typeof useSession>);

    mockedOpenmrsFetch.mockImplementation(async (url: string) => {
      if (url.includes('/form/')) {
        return {
          data: {
            resources: [{ name: 'translations_fr', valueReference: 'mock-clob' }],
          },
        } as any;
      }
      if (url.includes('/clobdata/')) {
        return {
          data: {
            translations: {
              Label: 'Champ',
              Name: '',
            },
          },
        } as any;
      }
      return { data: {} } as any;
    });
  });

  async function selectLanguage(user: ReturnType<typeof userEvent.setup>, label: string) {
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByText(label));
  }

  //   test one ensures UI renders correctly
  it('renders UI components correctly', async () => {
    const user = userEvent.setup();
    renderWithRouter(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={jest.fn()} />);
    await selectLanguage(user, 'French (fr)');
    expect(screen.getByText(/download translation/i)).toBeInTheDocument();
    expect(screen.getByText(/upload translation/i)).toBeInTheDocument();
    expect(await screen.findByPlaceholderText(/search translation keys/i)).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Translated')).toBeInTheDocument();
    expect(screen.getByText('Untranslated')).toBeInTheDocument();
    expect(await screen.findByText('Label')).toBeInTheDocument();

    expect(screen.getByText('Champ')).toBeInTheDocument();
  });

  //  test two shows updates translation on save
  it('opens edit modal and updates translation on save', async () => {

    const user = userEvent.setup();
    const updateSchemaMock = jest.fn();
    let onSaveCallback!: (value: string) => void;
    mockedShowModal.mockImplementation((_id, options: any) => {
      onSaveCallback = options.onSave;
      return jest.fn();
    });
    renderWithRouter(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={updateSchemaMock} />);
    await selectLanguage(user, 'French (fr)');
    const editButtons = await screen.findAllByRole('button', { name: /edit string/i });
    await user.click(editButtons[0]);
    onSaveCallback('Updated Translation');
    await waitFor(() => {
      expect(updateSchemaMock).toHaveBeenCalled();
    });
    const updatedSchema = updateSchemaMock.mock.calls[updateSchemaMock.mock.calls.length - 1][0];
    expect(updatedSchema.translations.fr['Label']).toBe('Updated Translation');
  });

  //test three ensures the translated filter works as expected
  it('filters translated keys in "Translated" tab', async () => {
    const user = userEvent.setup();
    renderWithRouter(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={jest.fn()} />);
    await selectLanguage(user, 'French (fr)');
    // Wait for translations to load
    await screen.findByText('Label');
    await user.click(screen.getByText('Translated'));
    await waitFor(() => {
      expect(screen.getByText('Label')).toBeInTheDocument();
    });
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
  });

  //test four ensures the untranslated filter works as expected
  it('filters untranslated keys in "Untranslated" tab', async () => {
    const user = userEvent.setup();
    renderWithRouter(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={jest.fn()} />);
    await selectLanguage(user, 'French (fr)');
    // Wait for translations to load
    await screen.findByText('Name');
    await user.click(screen.getByText('Untranslated'));
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
    expect(screen.queryByText('Label')).not.toBeInTheDocument();

  });

  //  test five filtering keys by search
  it('filters keys by search query', async () => {

    const user = userEvent.setup();
    renderWithRouter(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={jest.fn()} />);
    await selectLanguage(user, 'French (fr)');
    // Wait for translations to load
    await screen.findByText('Name');
    await user.type(await screen.findByPlaceholderText(/search translation keys/i), 'name');
    await waitFor(() => {
      expect(screen.queryByText('Label')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Name')).toBeInTheDocument();
  });


  //test six switching languages and backend
  it('switches language and loads backend translations', async () => {
    const updateSchemaMock = jest.fn();


    mockedOpenmrsFetch.mockImplementation(async (url: string) => {
      if (url.includes('/form/')) {
        return {
          data: { resources: [{ name: 'translations_fr', valueReference: 'mock-clob' }] },
        } as any;
      }
      if (url.includes('/clobdata/')) {
        return {
          data: {
            translations: { Label: 'Étiquette', Name: 'Nom' },
          },
        } as any;
      }
      return { data: {} } as any;
    });
    const user = userEvent.setup();
    renderWithRouter(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={updateSchemaMock} />);
    await selectLanguage(user, 'French (fr)');
    await waitFor(() => {
      expect(mockedOpenmrsFetch).toHaveBeenCalled();
    });
    expect(screen.getByText('Étiquette')).toBeInTheDocument();
    expect(updateSchemaMock).toHaveBeenCalled();
    expect(screen.getByText('Nom')).toBeInTheDocument();
  });

  //test seven handling download with translations
  it('handles download when translations exist', async () => {
    const user = userEvent.setup();
    global.URL.createObjectURL = jest.fn(() => 'blob:url') as any;
    global.URL.revokeObjectURL = jest.fn() as any;
    renderWithRouter(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={jest.fn()} />);
    await selectLanguage(user, 'French (fr)');
    const downloadBtn = await screen.findByText(/download translation/i);
    await user.click(downloadBtn);
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });

  //test eight shows error when download without translations
  it('shows inline error message when download attempted without translations', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <TranslationBuilder formSchema={{ ...mockSchema, translations: {} }} onUpdateSchema={jest.fn()} />,
    );
    await selectLanguage(user, 'French (fr)');
    const downloadBtn = await screen.findByText(/download translation/i);
    await user.click(downloadBtn);
    await waitFor(() => {
      expect(screen.getByText(/no translations found/i)).toBeInTheDocument();
    });
  });

  // test nine
  it('uploads translation successfully and shows snackbar', async () => {
    const user = userEvent.setup();
    mockedOpenmrsFetch.mockImplementation(async (url: string) => {
      if (url.includes('/form/')) return { data: { resources: [] } } as any;
      return { data: {} } as any;
    });

    // Mock window.fetch for the clobdata POST
    const originalFetch = window.fetch;
    window.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('new-clob-uuid'),
    }) as any;
    renderWithRouter(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={jest.fn()} />);
    await selectLanguage(user, 'French (fr)');
    const uploadBtn = await screen.findByText(/upload translation/i);
    await user.click(uploadBtn);
    await waitFor(() => {
      expect(mockedShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }));
    });
    window.fetch = originalFetch;
  });

  //test ten showing the snackbar notification
  it('shows error snackbar if upload fails', async () => {
    const user = userEvent.setup();
    mockedOpenmrsFetch.mockRejectedValue(new Error('Upload failed'));
    renderWithRouter(<TranslationBuilder formSchema={mockSchema} onUpdateSchema={jest.fn()} />);
    await selectLanguage(user, 'French (fr)');
    const uploadBtn = await screen.findByText(/upload translation/i);
    await user.click(uploadBtn);

    await waitFor(() => {
      expect(mockedShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
    });
  });
});
