import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextArea from './textarea.component';
import { FormFieldProvider } from '../../../../form-field-context';
import type { FormField } from '@openmrs/esm-form-engine-lib';

const mockSetFormField = jest.fn();
const formField: FormField = {
  datePickerFormat: 'both',
  type: 'obs',
  questionOptions: { rendering: 'textarea', rows: 5 },
  id: '1',
};

jest.mock('../../../../form-field-context', () => ({
  ...jest.requireActual('../../../../form-field-context'),
  useFormField: () => ({ formField, setFormField: mockSetFormField }),
}));

describe('Text Component', () => {
  it('renders', () => {
    renderTextComponent();

    expect(screen.getByText(/rows/i)).toBeInTheDocument();
  });

  it('shows the default rows value', () => {
    renderTextComponent();

    const rowsInput = screen.getByRole('textbox', {
      name: /rows/i,
    });

    expect(rowsInput).toHaveValue('5');
  });

  it('updates the form field when the rows value is edited', async () => {
    formField.questionOptions.rows = 0;
    renderTextComponent();
    const user = userEvent.setup();
    const rowsInput = screen.getByRole('textbox', {
      name: /rows/i,
    });
    await user.type(rowsInput, '8');

    expect(mockSetFormField).toHaveBeenCalledWith({
      ...formField,
      questionOptions: { ...formField.questionOptions, rows: 8 },
    });
  });
});

function renderTextComponent() {
  render(
    <FormFieldProvider initialFormField={formField}>
      <TextArea />
    </FormFieldProvider>,
  );
}
