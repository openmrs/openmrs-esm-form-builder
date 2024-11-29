import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Number from './number.component';
import type { FormField } from '@openmrs/esm-form-engine-lib';

const mockSetFormField = jest.fn();
const formField: FormField = {
  type: 'obs',
  questionOptions: { rendering: 'number', min: '1', max: '10' },
  id: '1',
};

describe('Number Component', () => {
  it('renders', () => {
    renderNumberComponent();

    expect(screen.getByText(/min value that can be entered/i)).toBeInTheDocument();
    expect(screen.getByText(/max value that can be entered/i)).toBeInTheDocument();
  });

  it('shows the default min and max values', () => {
    renderNumberComponent();

    const minInput = screen.getByRole('textbox', {
      name: /min/i,
    });
    const maxInput = screen.getByRole('textbox', {
      name: /max/i,
    });

    expect(minInput).toHaveValue('1');
    expect(maxInput).toHaveValue('10');
  });

  it('updates the form field when the min or max value is edited', async () => {
    formField.questionOptions.min = '';
    formField.questionOptions.max = '';
    renderNumberComponent();
    const user = userEvent.setup();

    const minInput = screen.getByRole('textbox', { name: /min value that can be entered/i });
    await user.type(minInput, '5');
    expect(mockSetFormField).toHaveBeenCalledWith({
      ...formField,
      questionOptions: { ...formField.questionOptions, min: '5' },
    });

    const maxInput = screen.getByRole('textbox', { name: /max value that can be entered/i });
    await user.type(maxInput, '6');
    expect(mockSetFormField).toHaveBeenLastCalledWith({
      ...formField,
      questionOptions: { ...formField.questionOptions, max: '6' },
    });
  });

  it('shows the invalid min and max values', () => {
    formField.questionOptions.min = '4';
    formField.questionOptions.max = '3';
    renderNumberComponent();

    const minInput = screen.getByRole('textbox', {
      name: /min value that can be entered/i,
    });
    const maxInput = screen.getByRole('textbox', {
      name: /max value that can be entered/i,
    });

    expect(minInput).toHaveClass('cds--text-input--invalid');
    expect(maxInput).toHaveClass('cds--text-input--invalid');
  });
});

function renderNumberComponent() {
  render(<Number formField={formField} setFormField={mockSetFormField} />);
}
