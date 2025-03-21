import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import Question from './question.component';
import '@testing-library/jest-dom';
import type { FormField, RenderType } from '@openmrs/esm-form-engine-lib';
import { FormFieldProvider } from '../../form-field-context';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

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
  it('should render the component with radio buttons', () => {
    renderQuestionComponent();

    expect(screen.getByRole('group', { name: /isQuestionInfoProvided/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Yes/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /No/i })).toBeInTheDocument();
  });

  it('shows TextInput when "Yes" is selected', async () => {
    const user = userEvent.setup();
    renderQuestionComponent();

    const yesRadio = screen.getByRole('radio', { name: /Yes/i });
    await user.click(yesRadio);

    expect(screen.getByLabelText(/questionInfo/i)).toBeInTheDocument();
  });

  it('hides TextInput when "No" is selected', async () => {
    const user = userEvent.setup();
    renderQuestionComponent();

    const noRadio = screen.getByRole('radio', { name: /No/i });
    await user.click(noRadio);

    expect(screen.queryByLabelText(/questionInfo/i)).not.toBeInTheDocument();
  });

  it('updates questionInfo state when user types in TextInput', async () => {
    const user = userEvent.setup();
    renderQuestionComponent();

    const yesRadio = screen.getByRole('radio', { name: /Yes/i });
    await user.click(yesRadio);

    const textInput = screen.getByLabelText(/questionInfo/i);
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
