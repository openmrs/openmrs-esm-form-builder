import React from 'react';
import { render, screen } from '@testing-library/react';
import Text from './text.component';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import userEvent from '@testing-library/user-event';

const mockSetFormField = jest.fn();
const formField: FormField = {
  datePickerFormat: 'both',
  type: 'obs',
  questionOptions: { rendering: 'text', minLength: '1', maxLength: '10' },
  id: '1',
};

describe('Text Component', () => {
  it('renders', () => {
    renderTextComponent();

    expect(screen.getByText(/min length of characters/i)).toBeInTheDocument();
    expect(screen.getByText(/max length of characters/i)).toBeInTheDocument();
  });

  it('shows the default min and max values', () => {
    renderTextComponent();

    const minInput = screen.getByRole('textbox', {
      name: /min length of characters/i,
    });
    const maxInput = screen.getByRole('textbox', {
      name: /max length of characters/i,
    });

    expect(minInput).toHaveValue('1');
    expect(maxInput).toHaveValue('10');
  });

  it('updates the form field when the min or max value is edited', async () => {
    formField.questionOptions.minLength = '';
    formField.questionOptions.maxLength = '';
    const user = userEvent.setup();

    renderTextComponent();

    const minInput = screen.getByRole('textbox', { name: /min length of characters/i });
    await user.type(minInput, '5');
    expect(mockSetFormField).toHaveBeenCalledWith({
      ...formField,
      questionOptions: { ...formField.questionOptions, minLength: '5' },
    });

    const maxInput = screen.getByRole('textbox', { name: /max length of characters/i });
    await user.type(maxInput, '6');
    expect(mockSetFormField).toHaveBeenLastCalledWith({
      ...formField,
      questionOptions: { ...formField.questionOptions, maxLength: '6' },
    });
  });
});

function renderTextComponent() {
  render(<Text formField={formField} setFormField={mockSetFormField} />);
}
