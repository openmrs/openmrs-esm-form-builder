import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { navigate, showSnackbar, showModal, useConfig } from '@openmrs/esm-framework';
import { useForm } from '@hooks/useForm';
import { useEncounterTypes } from '@hooks/useEncounterTypes';
import {
  saveNewForm,
  updateForm,
  uploadSchema,
  getResourceUuid,
  deleteResource,
  deleteClobdata,
} from '@resources/forms.resource';
import SaveFormModal from './save-form.modal';
import ActionButtons from '../../../action-buttons/action-buttons.component';
import { MemoryRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

vi.mock('@hooks/useForm');
vi.mock('@hooks/useEncounterTypes');
vi.mock('@resources/forms.resource');

const schema = {
  name: 'Nutrition',
  version: '1.0',
  description: 'Nutrition form',
  encounterType: 'encounter-type',
  pages: [],
} as React.ComponentProps<typeof SaveFormModal>['schema'];
const form = {
  uuid: 'existing-form',
  name: 'Nutrition',
  version: '1.0',
  description: 'Nutrition form',
  resources: [{ uuid: 'old-link', name: 'JSON schema', valueReference: 'old-clob' }],
} as React.ComponentProps<typeof SaveFormModal>['form'];
const mutate = vi.fn();

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.mocked(useForm).mockReturnValue({
    mutate,
    form: undefined,
    formError: undefined,
    isLoadingForm: false,
    isValidatingForm: false,
  });
  vi.mocked(useEncounterTypes).mockReturnValue({
    encounterTypes: [{ uuid: 'encounter-type', name: 'Nutrition encounter' }],
  } as ReturnType<typeof useEncounterTypes>);
  vi.mocked(uploadSchema).mockResolvedValue('new-clob');
  vi.mocked(saveNewForm).mockResolvedValue({
    ...form,
    uuid: 'new-form',
    encounterType: { uuid: 'encounter-type', name: 'Nutrition encounter', display: 'Nutrition encounter' },
    resources: [],
    auditInfo: undefined,
  });
  vi.mocked(updateForm).mockResolvedValue(undefined);
  vi.mocked(getResourceUuid).mockResolvedValue(undefined);
  vi.mocked(deleteResource).mockResolvedValue(undefined);
  vi.mocked(deleteClobdata).mockResolvedValue(undefined);
});

describe('save form modal', () => {
  it('creates a new form without a router provider', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    render(<SaveFormModal schema={schema} form={undefined} close={close} />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(saveNewForm).toHaveBeenCalledWith('Nutrition', '1.0', false, 'Nutrition form', 'encounter-type');
    expect(getResourceUuid).toHaveBeenCalledWith('new-form', 'new-clob');
    expect(updateForm).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(expect.objectContaining({ to: expect.stringContaining('/edit/new-form') })),
    );
  });

  it('updates the selected existing form after the confirmation step', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    render(<SaveFormModal schema={schema} form={form} formUuid="existing-form" close={close} />);
    expect(useForm).toHaveBeenCalledWith('existing-form');
    expect(screen.queryByRole('textbox', { name: 'Form Name' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Update existing version' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(updateForm).toHaveBeenCalledWith('existing-form', 'Nutrition', '1.0', 'Nutrition form', 'encounter-type');
    expect(getResourceUuid).toHaveBeenCalledWith('existing-form', 'new-clob');
    expect(deleteResource).toHaveBeenCalledWith('existing-form', 'old-link');
    expect(deleteClobdata).toHaveBeenCalledWith('old-clob');
    expect(saveNewForm).not.toHaveBeenCalled();
  });

  it('creates a new version instead of updating the old form', async () => {
    const user = userEvent.setup();
    render(<SaveFormModal schema={schema} form={form} formUuid="existing-form" close={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Save as a new form' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(saveNewForm).toHaveBeenCalledOnce());
    expect(updateForm).not.toHaveBeenCalled();
    expect(deleteResource).not.toHaveBeenCalled();
  });

  it('keeps failed saves open and cancellation does not save', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    vi.mocked(saveNewForm).mockRejectedValueOnce(new Error('Cannot save'));
    render(<SaveFormModal schema={schema} form={undefined} close={close} />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(showSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' })));
    expect(close).not.toHaveBeenCalled();
    await user.click(screen.getAllByRole('button', { name: 'Close' }).at(-1));
    expect(close).toHaveBeenCalledOnce();
    expect(saveNewForm).toHaveBeenCalledOnce();
  });
  it.each(['success', 'failure'])(
    'blocks reopening after dismissal until a pending save settles: %s',
    async (outcome) => {
      let resolve: (value: Awaited<ReturnType<typeof saveNewForm>>) => void;
      let reject: (error: Error) => void;
      const pending = new Promise<Awaited<ReturnType<typeof saveNewForm>>>((done, fail) => {
        resolve = done;
        reject = fail;
      });
      vi.mocked(saveNewForm).mockReturnValueOnce(pending);
      vi.mocked(useConfig).mockReturnValue({});
      const user = userEvent.setup();
      const Launcher = () => {
        const { t } = useTranslation();
        return (
          <MemoryRouter>
            <ActionButtons
              schema={schema}
              t={t}
              isValidating={false}
              schemaErrors={[]}
              onFormValidation={vi.fn()}
              setPublishedWithErrors={vi.fn()}
              setValidationComplete={vi.fn()}
              setValidationResponse={vi.fn()}
            />
          </MemoryRouter>
        );
      };
      vi.mocked(showModal).mockImplementation((name, props) => {
        const close = () => view.unmount();
        const view = render(
          <SaveFormModal
            schema={schema}
            form={undefined}
            onSavingChange={props.onSavingChange as React.ComponentProps<typeof SaveFormModal>['onSavingChange']}
            close={close}
          />,
        );
        return close;
      });
      render(<Launcher />);
      const launcher = screen.getByRole('button', { name: 'Save form' });
      await user.click(launcher);
      await user.click(screen.getByRole('button', { name: 'Save' }));
      await user.click(screen.getAllByRole('button', { name: 'Close' }).at(-1));
      expect(launcher).toBeDisabled();
      await user.click(launcher);
      expect(showModal).toHaveBeenCalledOnce();
      expect(showModal).toHaveBeenCalledWith(
        'save-form-modal',
        expect.objectContaining({ schema, onSavingChange: expect.any(Function) }),
      );
      expect(saveNewForm).toHaveBeenCalledOnce();
      await act(async () => {
        if (outcome === 'success') {
          resolve({ ...form, uuid: 'new-form', encounterType: undefined, resources: [], auditInfo: undefined });
        } else {
          reject(new Error('Cannot save'));
        }
        await pending.catch(() => {});
      });
      await waitFor(() => expect(launcher).toBeEnabled());
    },
  );
});
