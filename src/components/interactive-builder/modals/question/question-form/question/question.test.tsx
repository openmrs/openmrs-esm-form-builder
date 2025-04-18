import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Question from './question.component';
import { FormFieldProvider } from '../../form-field-context';
import type { FormField } from '@openmrs/esm-form-engine-lib';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key, fallback) => fallback || key,
  })),
}));

const initialFormField: FormField = {
  id: 'testId',
  label: 'Test Label',
  type: 'obs',
  questionOptions: {
    rendering: 'text',
  },
};

const renderWithFormFieldProvider = (
  ui: React.ReactElement,
  { formField = initialFormField, selectedConcept = null } = {},
) => {
  return render(
    <FormFieldProvider initialFormField={formField} selectedConcept={selectedConcept}>
      {ui}
    </FormFieldProvider>,
  );
};

describe('Question Component', () => {
  const checkIfQuestionIdExists = jest.fn(() => false);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all required fields', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />);

    expect(screen.getByRole('textbox', { name: /Question ID/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/Question type/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/Rendering type/i)).toBeInTheDocument();
  });

  it('should display the form field id in the question id input', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />);
    const idInput = screen.getByRole('textbox', { name: /Question ID/i }) as HTMLInputElement;
    expect(idInput).toHaveValue('testId');
  });

  it('should update form field when question id changes', async () => {
    const user = userEvent.setup();
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />);
    const idInput = screen.getByRole('textbox', { name: /Question ID/i });

    await user.clear(idInput);
    await user.type(idInput, 'newTestId');

    expect((idInput as HTMLInputElement)).toHaveValue('newTestId');
  });

  it('should validate duplicate question ids', () => {
    const duplicateCheckFn = jest.fn().mockReturnValue(true);

    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={duplicateCheckFn} />);

    duplicateCheckFn.mockClear();

    const idInput = screen.getByRole('textbox', { name: /Question ID/i });
    idInput.focus();
    idInput.blur();

    expect(screen.getByText(/This question ID already exists/i)).toBeInTheDocument();
  });

  it('should convert label to camel case when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, label: 'Test Label For Camel Case' },
    });

    const convertButton = screen.getByText(/Convert label to camel-case/i);
    await user.click(convertButton);

    const idInput = screen.getByRole('textbox', { name: /Question ID/i }) as HTMLInputElement;
    expect(idInput).toHaveValue('testLabelForCamelCase');
  });

  it('should toggle question info visibility', async () => {
    const user = userEvent.setup();
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />);

    expect(screen.queryByLabelText(/Additional Question Info/i)).not.toBeInTheDocument();

    const yesRadio = screen.getByLabelText(/Yes/i);
    await user.click(yesRadio);

    expect(screen.getByLabelText(/Additional Question Info/i)).toBeInTheDocument();

    const noRadio = screen.getByLabelText(/No/i);
    await user.click(noRadio);

    expect(screen.queryByLabelText(/Additional Question Info/i)).not.toBeInTheDocument();
  });

  it('should update question info when input changes', async () => {
    const user = userEvent.setup();
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, questionInfo: 'Initial info' },
    });

    const questionInfoInput = screen.getByLabelText(/Additional Question Info/i);
    await user.clear(questionInfoInput);
    await user.type(questionInfoInput, 'New question info');

    expect((questionInfoInput as HTMLInputElement).value).toBe('New question info');
  });

  it('should toggle question required status', async () => {
    const user = userEvent.setup();
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />);

    const optionalRadio = screen.getByLabelText(/Optional/i);
    const requiredRadio = screen.getByLabelText(/Required/i);

    expect(optionalRadio).toBeChecked();
    expect(requiredRadio).not.toBeChecked();

    await user.click(requiredRadio);

    expect(requiredRadio).toBeChecked();
    expect(optionalRadio).not.toBeChecked();

    await user.click(optionalRadio);

    expect(optionalRadio).toBeChecked();
    expect(requiredRadio).not.toBeChecked();
  });

  it('should show appropriate rendering types for the selected question type', async () => {
    const user = userEvent.setup();
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, type: 'encounterDatetime' },
    });

    const renderingTypeSelect = screen.getByLabelText(/Rendering type/i);

    expect(renderingTypeSelect).toBeInTheDocument();

    expect(screen.getByLabelText(/Question type/i)).toHaveValue('encounterDatetime');
  });

  it('should handle initial state with questionInfo properly', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, questionInfo: 'Initial question info' },
    });

    expect(screen.getByLabelText(/Additional Question Info/i)).toBeInTheDocument();
    expect((screen.getByLabelText(/Additional Question Info/i) as HTMLInputElement).value).toBe(
      'Initial question info',
    );
  });

  it('should not show label and required inputs when rendering type is markdown', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: {
        ...initialFormField,
        questionOptions: {
          rendering: 'markdown',
        },
      },
    });
    expect(screen.queryByLabelText(/^Label$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Is this question a required or optional field/i)).not.toBeInTheDocument();
  });
});
