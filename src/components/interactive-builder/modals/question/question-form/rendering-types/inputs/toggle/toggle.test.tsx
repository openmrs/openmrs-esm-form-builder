import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Toggle from './toggle.component';
import type { FormField } from '@openmrs/esm-form-engine-lib';

const mockSetFormField = jest.fn();
const formField: FormField = {
  datePickerFormat: 'both',
  type: 'obs',
  questionOptions: { rendering: 'toggle', toggleOptions: { labelTrue: 'True', labelFalse: 'False' } },
  id: '1',
};

describe('Toggle Component', () => {
  it('renders', () => {
    renderToggleComponent();

    expect(screen.getByText(/label true/i)).toBeInTheDocument();
    expect(screen.getByText(/label false/i)).toBeInTheDocument();
  });

  it('shows the default labelTrue and labelFalse values', () => {
    renderToggleComponent();

    const labelTrue = screen.getByRole('textbox', { name: /label true/i });
    const labelFalse = screen.getByRole('textbox', { name: /label false/i });

    expect(labelTrue).toHaveValue('True');
    expect(labelFalse).toHaveValue('False');
  });

  it('updates the form field when the labelTrue value is edited', () => {
    formField.questionOptions.toggleOptions.labelTrue = '';
    renderToggleComponent();

    const labelTrueInput = screen.getByRole('textbox', { name: /label true/i });

    fireEvent.input(labelTrueInput, { target: { value: 'Yes' } });

    expect(mockSetFormField).toHaveBeenLastCalledWith({
      ...formField,
      questionOptions: { ...formField.questionOptions, toggleOptions: { labelTrue: 'Yes', labelFalse: 'False' } },
    });
  });
});

function renderToggleComponent() {
  render(<Toggle formField={formField} setFormField={mockSetFormField} />);
}
