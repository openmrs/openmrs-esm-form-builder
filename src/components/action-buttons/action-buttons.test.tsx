import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useConfig } from '@openmrs/esm-framework';
import { useForm } from '@hooks/useForm';
import type { Schema } from '@types';
import ActionButtons from './action-buttons.component';

vi.mock('@hooks/useForm');
vi.mock('@resources/forms.resource');

const mockUseConfig = vi.mocked(useConfig);

const schema = { name: 'Nutrition', pages: [] } as unknown as Schema;
const form = { uuid: 'form-uuid', name: 'Nutrition', published: false } as ReturnType<typeof useForm>['form'];

function renderActionButtons(props: Partial<React.ComponentProps<typeof ActionButtons>> = {}) {
  return render(
    <MemoryRouter>
      <ActionButtons
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
  });

  it.each([
    { enableFormValidation: true, buttonName: 'Validate and publish form' },
    { enableFormValidation: false, buttonName: 'Publish form' },
  ])('only enables $buttonName when there is a schema to publish', ({ enableFormValidation, buttonName }) => {
    mockUseConfig.mockReturnValue({ enableFormValidation, dataTypeToRenderingMap: {} });

    const { unmount } = renderActionButtons({ schema: undefined });
    expect(screen.getByRole('button', { name: buttonName })).toBeDisabled();
    unmount();

    renderActionButtons();
    expect(screen.getByRole('button', { name: buttonName })).toBeEnabled();
  });
});
