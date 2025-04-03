import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import { FormFieldProvider } from '../../form-field-context';
import Question from './question.component';

const mockSetFormField = jest.fn();
const checkIfQuestionIdExists = jest.fn();

const formField: FormField = {
  type: 'obs',
  questionOptions: { rendering: 'text' },
  id: '1',
};

jest.mock('../../form-field-context', () => ({
  ...jest.requireActual('../../form-field-context'),
  useFormField: () => ({ formField, setFormField: mockSetFormField }),
}));

describe('Question Component', () => {
  it('should render the toggles for question info', () => {
    renderQuestionComponent();

    expect(
      screen.getByRole('group', { name: /would you like to provide additional details about the question?/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Yes/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /No/i })).toBeInTheDocument();
  });

  it('shows TextInput when "Yes" is selected', async () => {
    const user = userEvent.setup();
    renderQuestionComponent();

    const yesRadio = screen.getByRole('radio', { name: /Yes/i });
    await user.click(yesRadio);

    expect(screen.getByLabelText(/additional question info/i)).toBeInTheDocument();
  });

  it('hides TextInput when "No" is selected', async () => {
    const user = userEvent.setup();
    renderQuestionComponent();

    const noRadio = screen.getByRole('radio', { name: /No/i });
    await user.click(noRadio);

    expect(screen.queryByLabelText(/additional question info/i)).not.toBeInTheDocument();
  });

  it('updates questionInfo state when user types in TextInput', async () => {
    const user = userEvent.setup();
    renderQuestionComponent();

    const yesRadio = screen.getByRole('radio', { name: /Yes/i });
    await user.click(yesRadio);

    const textInput = screen.getByLabelText(/additional question info/i);
    await user.type(textInput, 'New question info');

    expect(textInput).toHaveValue('New question info');
  });
});

function renderQuestionComponent() {
  render(
    <FormFieldProvider initialFormField={formField}>
      <Question checkIfQuestionIdExists={checkIfQuestionIdExists} />
    </FormFieldProvider>,
  );
}
