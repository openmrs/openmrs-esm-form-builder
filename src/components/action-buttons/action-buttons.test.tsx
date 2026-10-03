import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import { useForm } from '@hooks/useForm';
import { publishForm } from '@resources/forms.resource';
import { handleFormValidation } from '@resources/form-validator.resource';
import type { Schema } from '@types';
import ActionButtons from './action-buttons.component';

vi.mock('@hooks/useForm');
vi.mock('@resources/forms.resource');
vi.mock('@resources/form-validator.resource');

const mockShowSnackbar = vi.mocked(showSnackbar);
const mockUseConfig = vi.mocked(useConfig);
const mockPublishForm = vi.mocked(publishForm);
const mockHandleFormValidation = vi.mocked(handleFormValidation);

const schema = { name: 'Nutrition', pages: [] } as unknown as Schema;
const form = { uuid: 'form-uuid', name: 'Nutrition', published: false } as ReturnType<typeof useForm>['form'];

function renderActionButtons(props: Partial<React.ComponentProps<typeof ActionButtons>> = {}) {
  return render(
    <MemoryRouter>
      <ActionButtons
        hasUnsavedChanges={false}
        isValidating={false}
        onFormValidation={vi.fn()}
        schema={schema}
        schemaErrors={[]}
        setPublishedWithErrors={vi.fn()}
        setValidationComplete={vi.fn()}
        setValidationResponse={vi.fn()}
        t={((key: string, fallback: string) => fallback) as React.ComponentProps<typeof ActionButtons>['t']}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('ActionButtons', () => {
  beforeEach(() => {
    vi.mocked(useForm).mockReturnValue({
      form,
      formError: undefined,
      isLoadingForm: false,
      isValidatingForm: false,
      mutate: vi.fn(),
    });
    mockUseConfig.mockReturnValue({ enableFormValidation: false, dataTypeToRenderingMap: {} });
    mockPublishForm.mockResolvedValue(undefined);
  });

  it('publishes the form when there are no unsaved changes', async () => {
    const user = userEvent.setup();
    renderActionButtons();

    await user.click(screen.getByRole('button', { name: /publish form/i }));

    expect(mockPublishForm).toHaveBeenCalledWith('form-uuid');
  });

  it('refuses to publish while the schema has unsaved changes', async () => {
    const user = userEvent.setup();
    renderActionButtons({ hasUnsavedChanges: true });

    await user.click(screen.getByRole('button', { name: /publish form/i }));

    expect(mockPublishForm).not.toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'warning', subtitle: 'Save the form before publishing it' }),
    );
  });

  it('reports a validation failure instead of leaving the button in its validating state', async () => {
    const user = userEvent.setup();
    mockUseConfig.mockReturnValue({ enableFormValidation: true, dataTypeToRenderingMap: {} });
    mockHandleFormValidation.mockRejectedValue(new Error('questionOptions is undefined'));
    renderActionButtons();

    await user.click(screen.getByRole('button', { name: /validate and publish form/i }));

    await waitFor(() =>
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'error', subtitle: 'questionOptions is undefined' }),
      ),
    );
    expect(mockPublishForm).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /validate and publish form/i })).toBeEnabled();
  });

  it('publishes after a validation that finds no errors', async () => {
    const user = userEvent.setup();
    mockUseConfig.mockReturnValue({ enableFormValidation: true, dataTypeToRenderingMap: {} });
    mockHandleFormValidation.mockResolvedValue([[], []]);
    renderActionButtons();

    await user.click(screen.getByRole('button', { name: /validate and publish form/i }));

    await waitFor(() => expect(mockPublishForm).toHaveBeenCalledWith('form-uuid'));
  });
});
