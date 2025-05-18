import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Question from './question.component';
import { FormFieldProvider } from '../../form-field-context';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import { renderingTypes } from '@constants';

const initialFormField: FormField = {
  id: 'testId',
  label: 'Test Label',
  type: 'obs',
  questionOptions: {
    rendering: 'text',
  },
};

const checkIfQuestionIdExists = jest.fn(() => false);

const renderWithFormFieldProvider = (
  component: React.ReactElement,
  { formField = initialFormField, selectedConcept = null } = {},
) => {
  return render(
    <FormFieldProvider initialFormField={formField} selectedConcept={selectedConcept}>
      {component}
    </FormFieldProvider>,
  );
};

describe('Question Component', () => {
  it('should render all required fields', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />);

    expect(screen.getByRole('textbox', { name: /question id/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/question type/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/rendering type/i)).toBeInTheDocument();
  });

  it('should display the form field id in the question id input', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />);
    const idInput = screen.getByRole('textbox', { name: /question id/i }) as HTMLInputElement;
    expect(idInput).toHaveValue('testId');
  });

  it('should update form field when question id changes', async () => {
    const user = userEvent.setup();
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />);
    const idInput = screen.getByRole('textbox', { name: /question id/i });

    await user.clear(idInput);
    await user.type(idInput, 'newTestId');

    expect(idInput).toHaveValue('newTestId');
  });

  it('should validate duplicate question ids', () => {
    const duplicateCheckFn = jest.fn().mockReturnValue(true);

    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={duplicateCheckFn} />);

    duplicateCheckFn.mockClear();

    const idInput = screen.getByRole('textbox', { name: /question id/i });
    idInput.focus();
    idInput.blur();

    expect(screen.getByText(/this question id already exists/i)).toBeInTheDocument();
  });

  it('should convert label to camel case when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, label: 'Test Label For Camel Case' },
    });

    const convertButton = screen.getByText(/convert label to camel-case/i);
    await user.click(convertButton);

    const idInput = screen.getByRole('textbox', { name: /question id/i }) as HTMLInputElement;
    expect(idInput).toHaveValue('testLabelForCamelCase');
  });

  it('should toggle question info visibility', async () => {
    const user = userEvent.setup();
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />);

    expect(screen.queryByLabelText(/additional question info/i)).not.toBeInTheDocument();

    const yesRadio = screen.getByLabelText(/Yes/i);
    await user.click(yesRadio);

    expect(screen.getByLabelText(/additional question info/i)).toBeInTheDocument();

    const noRadio = screen.getByLabelText(/No/i);
    await user.click(noRadio);

    expect(screen.queryByLabelText(/additional question info/i)).not.toBeInTheDocument();
  });

  it('should update question info when input changes', async () => {
    const user = userEvent.setup();
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, questionInfo: 'Initial info' },
    });

    const questionInfoInput = screen.getByLabelText(/additional question info/i);
    await user.clear(questionInfoInput);
    await user.type(questionInfoInput, 'New question info');

    expect(questionInfoInput).toHaveValue('New question info');
  });

  it('should toggle question required status', async () => {
    const user = userEvent.setup();
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />);

    const optionalRadio = screen.getByLabelText(/optional/i);
    const requiredRadio = screen.getByLabelText(/required/i);

    expect(optionalRadio).toBeChecked();
    expect(requiredRadio).not.toBeChecked();

    await user.click(requiredRadio);

    expect(requiredRadio).toBeChecked();
    expect(optionalRadio).not.toBeChecked();

    await user.click(optionalRadio);

    expect(optionalRadio).toBeChecked();
    expect(requiredRadio).not.toBeChecked();
  });

  it('should show only date and datetime rendering types for encounterDatetime question type', async () => {
    const user = userEvent.setup();
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, type: 'encounterDatetime' },
    });

    const renderingTypeSelect = screen.getByLabelText(/rendering type/i);
    expect(renderingTypeSelect).toBeInTheDocument();
    expect(screen.getByLabelText(/question type/i)).toHaveValue('encounterDatetime');

    const options = (within(renderingTypeSelect).getAllByRole('option') as HTMLOptionElement[]).filter(
      (option) => option.value && option.value !== '',
    );

    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('date');
    expect(options[1]).toHaveTextContent('datetime');
  });

  it('should show only text and markdown rendering types for control question type', async () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, type: 'control' },
    });

    const renderingTypeSelect = screen.getByLabelText(/rendering type/i);
    expect(renderingTypeSelect).toBeInTheDocument();
    expect(screen.getByLabelText(/question type/i)).toHaveValue('control');

    const options = (within(renderingTypeSelect).getAllByRole('option') as HTMLOptionElement[]).filter(
      (option) => option.value && option.value !== '',
    );

    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('text');
    expect(options[1]).toHaveTextContent('markdown');
  });

  it('should show only ui-select-extended rendering type for encounterLocation question type', async () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, type: 'encounterLocation' },
    });

    const renderingTypeSelect = screen.getByLabelText(/rendering type/i);
    expect(renderingTypeSelect).toBeInTheDocument();
    expect(screen.getByLabelText(/question type/i)).toHaveValue('encounterLocation');

    const options = (within(renderingTypeSelect).getAllByRole('option') as HTMLOptionElement[]).filter(
      (option) => option.value && option.value !== '',
    );

    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('ui-select-extended');
  });

  it('should show only ui-select-extended rendering type for encounterProvider question type', async () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, type: 'encounterProvider' },
    });

    const renderingTypeSelect = screen.getByLabelText(/rendering type/i);
    expect(renderingTypeSelect).toBeInTheDocument();
    expect(screen.getByLabelText(/question type/i)).toHaveValue('encounterProvider');

    const options = (within(renderingTypeSelect).getAllByRole('option') as HTMLOptionElement[]).filter(
      (option) => option.value && option.value !== '',
    );

    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('ui-select-extended');
  });

  it('should show only ui-select-extended rendering type for encounterRole question type', async () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, type: 'encounterRole' },
    });

    const renderingTypeSelect = screen.getByLabelText(/rendering type/i);
    expect(renderingTypeSelect).toBeInTheDocument();
    expect(screen.getByLabelText(/question type/i)).toHaveValue('encounterRole');

    const options = (within(renderingTypeSelect).getAllByRole('option') as HTMLOptionElement[]).filter(
      (option) => option.value && option.value !== '',
    );

    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('ui-select-extended');
  });

  it('should show only group and repeating rendering types for obsGroup question type', async () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, type: 'obsGroup' },
    });

    const renderingTypeSelect = screen.getByLabelText(/rendering type/i);
    expect(renderingTypeSelect).toBeInTheDocument();
    expect(screen.getByLabelText(/question type/i)).toHaveValue('obsGroup');

    const options = (within(renderingTypeSelect).getAllByRole('option') as HTMLOptionElement[]).filter(
      (option) => option.value && option.value !== '',
    );

    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('group');
    expect(options[1]).toHaveTextContent('repeating');
  });

  it('should show only group and repeating rendering types for testOrder question type', async () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, type: 'testOrder' },
    });

    const renderingTypeSelect = screen.getByLabelText(/rendering type/i);
    expect(renderingTypeSelect).toBeInTheDocument();
    expect(screen.getByLabelText(/question type/i)).toHaveValue('testOrder');

    const options = (within(renderingTypeSelect).getAllByRole('option') as HTMLOptionElement[]).filter(
      (option) => option.value && option.value !== '',
    );

    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('group');
    expect(options[1]).toHaveTextContent('repeating');
  });

  it('should show only text rendering type for patientIdentifier question type', async () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, type: 'patientIdentifier' },
    });

    const renderingTypeSelect = screen.getByLabelText(/rendering type/i);
    expect(renderingTypeSelect).toBeInTheDocument();
    expect(screen.getByLabelText(/question type/i)).toHaveValue('patientIdentifier');

    const options = (within(renderingTypeSelect).getAllByRole('option') as HTMLOptionElement[]).filter(
      (option) => option.value && option.value !== '',
    );

    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('text');
  });

  it('should show only select rendering type for programState question type', async () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, type: 'programState' },
    });

    const renderingTypeSelect = screen.getByLabelText(/rendering type/i);
    expect(renderingTypeSelect).toBeInTheDocument();
    expect(screen.getByLabelText(/question type/i)).toHaveValue('programState');

    const options = (within(renderingTypeSelect).getAllByRole('option') as HTMLOptionElement[]).filter(
      (option) => option.value && option.value !== '',
    );

    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('select');
  });

  it('should show all rendering types for obs question type', async () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, type: 'obs' },
    });

    const renderingTypeSelect = screen.getByLabelText(/rendering type/i);
    expect(renderingTypeSelect).toBeInTheDocument();
    expect(screen.getByLabelText(/question type/i)).toHaveValue('obs');

    const options = (within(renderingTypeSelect).getAllByRole('option') as HTMLOptionElement[]).filter(
      (option) => option.value && option.value !== '',
    );

    expect(options).toHaveLength(renderingTypes.length);

    const optionTexts = options.map((option) => option.textContent);

    renderingTypes.forEach((renderType) => {
      expect(optionTexts).toContain(renderType);
    });
  });

  it('should load question info from the form field object', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
      formField: { ...initialFormField, questionInfo: 'Initial question info' },
    });

    expect(screen.getByLabelText(/additional question info/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/additional question info/i)).toHaveValue('Initial question info');
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
    expect(screen.queryByLabelText(/^label$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/is this question a required or optional field/i)).not.toBeInTheDocument();
  });
});
