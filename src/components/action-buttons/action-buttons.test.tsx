import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useConfig } from '@openmrs/esm-framework';
import { useForm } from '@hooks/useForm';
import type { Form, Schema } from '@types';
import ActionButtons from './action-buttons.component';

vi.mock('@hooks/useForm');
vi.mock('@resources/forms.resource');

const mockUseConfig = vi.mocked(useConfig);

const schema = { name: 'Nutrition', pages: [] } as unknown as Schema;
const schemaResource = {
  uuid: 'resource-uuid',
  name: 'JSON schema',
  dataType: 'AmpathJsonSchema',
  valueReference: 'clob-uuid',
};

function renderActionButtons(form: Partial<Form>, props: Partial<React.ComponentProps<typeof ActionButtons>> = {}) {
  vi.mocked(useForm).mockReturnValue({
    form: { uuid: 'form-uuid', name: 'Nutrition', published: false, ...form } as Form,
    formError: undefined,
    isLoadingForm: false,
    isValidatingForm: false,
    mutate: vi.fn(),
  });

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
  it.each([
    { enableFormValidation: true, buttonName: 'Validate and publish form' },
    { enableFormValidation: false, buttonName: 'Publish form' },
  ])('only enables $buttonName once the form has a saved schema', ({ enableFormValidation, buttonName }) => {
    mockUseConfig.mockReturnValue({ enableFormValidation, dataTypeToRenderingMap: {} });

    // A schema in the editor, such as a restored draft, isn't saved to the form yet.
    const { unmount } = renderActionButtons({ resources: [] });
    expect(screen.getByRole('button', { name: buttonName })).toBeDisabled();
    unmount();

    renderActionButtons({ resources: [schemaResource] });
    expect(screen.getByRole('button', { name: buttonName })).toBeEnabled();
  });
});
