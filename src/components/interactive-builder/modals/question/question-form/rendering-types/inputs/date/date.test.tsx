import React from 'react';
import { render, screen } from '@testing-library/react';
import Date from './date.component';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import userEvent from '@testing-library/user-event';

const mockSetFormField = jest.fn();
const formField: FormField = {
  datePickerFormat: 'both',
  type: 'obs',
  questionOptions: { rendering: 'date' },
  id: '1',
};

describe('Date Component', () => {
  it('renders', () => {
    renderDateComponent();

    expect(screen.getByText(/the type of date picker to show/i)).toBeInTheDocument();
  });

  it('checks the default radio button based on date picker format', () => {
    renderDateComponent();

    const calendarAndTimerRadioButton = screen.getByRole('radio', {
      name: /calendar and timer/i,
    });

    expect(calendarAndTimerRadioButton).toBeChecked();
  });

  it('updates the form field when the date picker type is edited', async () => {
    renderDateComponent();

    const user = userEvent.setup();
    const calendarRadioButton = screen.getByRole('radio', { name: /calendar only/i });
    await user.click(calendarRadioButton);

    expect(mockSetFormField).toHaveBeenCalledWith({
      ...formField,
      datePickerFormat: 'calendar',
    });
  });
});

function renderDateComponent() {
  render(<Date formField={formField} setFormField={mockSetFormField} />);
}
