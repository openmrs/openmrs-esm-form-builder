import React from 'react';
import { render, screen } from '@testing-library/react';
import UiSelectExtended from './ui-select-extended.component';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import userEvent from '@testing-library/user-event';

const mockSetFormField = jest.fn();
const formField: FormField = {
  datePickerFormat: 'both',
  type: 'obs',
  questionOptions: { rendering: 'ui-select-extended', isSearchable: false },
  id: '1',
};

describe('UiSelectExtended Component', () => {
  it('renders', () => {
    renderUiSelectExtendedComponent();

    expect(screen.getByText(/is the ui-select-extended rendering searchable/i)).toBeInTheDocument();
  });

  it('shows the default isSearchable value', () => {
    renderUiSelectExtendedComponent();

    const notSearchableRadioButton = screen.getByRole('radio', { name: /not searchable/i });

    expect(notSearchableRadioButton).toBeChecked();
  });

  it('updates the form field when the isSearchable value is edited', async () => {
    formField.questionOptions.isSearchable = true;
    const user = userEvent.setup();
    renderUiSelectExtendedComponent();

    const searchableRadioButton = screen.getByRole('radio', {
      name: /not searchable/i,
    });
    await user.click(searchableRadioButton);

    expect(mockSetFormField).toHaveBeenCalledWith({
      ...formField,
      questionOptions: { ...formField.questionOptions, isSearchable: false },
    });
  });
});

function renderUiSelectExtendedComponent() {
  render(<UiSelectExtended formField={formField} setFormField={mockSetFormField} />);
}
