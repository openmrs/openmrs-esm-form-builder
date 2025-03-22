import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Question from './question.component';
import { FormFieldProvider } from '../../form-field-context';
import { useTranslation } from 'react-i18next';
import RenderTypeComponent from '../rendering-types/rendering-type.component';
import QuestionTypeComponent from '../question-types/question-type.component';
import RequiredLabel from '../common/required-label/required-label.component';
import type { FormField } from '@openmrs/esm-form-engine-lib';

jest.mock('../rendering-types/rendering-type.component', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="render-type-component" />),
}));

jest.mock('../question-types/question-type.component', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="question-type-component" />),
}));

jest.mock('../common/required-label/required-label.component', () => ({
  __esModule: true,
  default: jest.fn(({ isRequired, text }) => (
    <div data-testid="required-label">
      {text} {isRequired ? '(Required)' : ''}
    </div>
  )),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key, fallback) => fallback || key,
  })),
}));

jest.mock('./question.scss', () => ({
  questionIdLabel: 'mock-question-id-label',
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
  { formField = initialFormField, checkIfQuestionIdExists = jest.fn(() => false) } = {},
) => {
  return render(
    <FormFieldProvider initialFormField={formField} selectedConcept={null}>
      {React.cloneElement(ui, { checkIfQuestionIdExists })}
    </FormFieldProvider>,
  );
};

describe('Question Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={jest.fn()} />);
    expect(screen.getByRole('textbox', { name: /Question ID/i })).toBeInTheDocument();
  });

  it('should display the form field id in the question id input', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={jest.fn()} />);
    const idInput = screen.getByRole('textbox', { name: /Question ID/i }) as HTMLInputElement;
    expect(idInput).toHaveValue('testId');
  });

  it('should update form field when question id changes', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={jest.fn()} />);
    const idInput = screen.getByRole('textbox', { name: /Question ID/i });

    fireEvent.change(idInput, { target: { value: 'newTestId' } });

    expect(idInput as HTMLInputElement).toHaveValue('newTestId');
  });

  // it('should validate duplicate question ids', () => {
  //   const checkIfQuestionIdExists = jest.fn(() => true);
  //   renderWithFormFieldProvider(<Question checkIfQuestionIdExists={checkIfQuestionIdExists} />, {
  //     formField: { ...initialFormField, id: 'duplicateId' },
  //   });

  //   expect(checkIfQuestionIdExists).toHaveBeenCalledWith('duplicateId');
  //   expect(screen.getByText(/This question ID already exists/i)).toBeInTheDocument();
  // });

  it('should convert label to camel case when button is clicked', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={jest.fn()} />, {
      formField: { ...initialFormField, label: 'Test Label For Camel Case' },
    });

    const convertButton = screen.getByText(/Convert label to camel-case/i);
    fireEvent.click(convertButton);

    const idInput = screen.getByRole('textbox', { name: /Question ID/i }) as HTMLInputElement;
    expect(idInput).toHaveValue('testLabelForCamelCase');
  });

  it('should toggle question info visibility', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={jest.fn()} />);

    expect(screen.queryByLabelText(/Additional Question Info/i)).not.toBeInTheDocument();

    const yesRadio = screen.getByLabelText(/Yes/i);
    fireEvent.click(yesRadio);

    expect(screen.getByLabelText(/Additional Question Info/i)).toBeInTheDocument();

    const noRadio = screen.getByLabelText(/No/i);
    fireEvent.click(noRadio);

    expect(screen.queryByLabelText(/Additional Question Info/i)).not.toBeInTheDocument();
  });

  it('should update question info when input changes', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={jest.fn()} />);

    const yesRadio = screen.getByLabelText(/Yes/i);
    fireEvent.click(yesRadio);

    const questionInfoInput = screen.getByLabelText(/Additional Question Info/i);
    fireEvent.change(questionInfoInput, { target: { value: 'New question info' } });

    expect((questionInfoInput as HTMLInputElement).value).toBe('New question info');
  });

  it('should toggle question required status', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={jest.fn()} />);

    const requiredRadio = screen.getByLabelText(/Required/i);
    fireEvent.click(requiredRadio);

    // TODO: check if it gets the updated prop

    const optionalRadio = screen.getByLabelText(/Optional/i);
    fireEvent.click(optionalRadio);

    // TODO: check if it gets the updated prop
  });

  it('should render RenderTypeComponent when rendering type is selected', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={jest.fn()} />, {
      formField: { ...initialFormField, questionOptions: { rendering: 'text' } },
    });

    expect(screen.getByTestId('render-type-component')).toBeInTheDocument();
    expect(RenderTypeComponent).toHaveBeenCalled();
  });

  it('should render QuestionTypeComponent when question type is selected', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={jest.fn()} />, {
      formField: { ...initialFormField, type: 'obs' },
    });

    expect(screen.getByTestId('question-type-component')).toBeInTheDocument();
    expect(QuestionTypeComponent).toHaveBeenCalled();
  });

  // it('should not show label and required inputs when rendering type is markdown', () => {
  //   renderWithFormFieldProvider(<Question checkIfQuestionIdExists={jest.fn()} />, {
  //     formField: { ...initialFormField, questionOptions: { rendering: 'markdown' } },
  //   });

  //   expect(screen.queryByRole('textbox', { name: /Label/i })).not.toBeInTheDocument();
  //   expect(screen.queryByText(/Is this question a required or optional field?/i)).not.toBeInTheDocument();
  // });

  it('should show appropriate rendering types for the selected question type', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={jest.fn()} />, {
      formField: { ...initialFormField, type: 'encounterDatetime' },
    });

    const renderingTypeSelect = screen.getByLabelText(/Rendering type/i);
    fireEvent.click(renderingTypeSelect);

    // TODO: test the select options.
  });

  it('should handle initial state with questionInfo properly', () => {
    renderWithFormFieldProvider(<Question checkIfQuestionIdExists={jest.fn()} />, {
      formField: { ...initialFormField, questionInfo: 'Initial question info' },
    });

    expect(screen.getByLabelText(/Additional Question Info/i)).toBeInTheDocument();
    expect((screen.getByLabelText(/Additional Question Info/i) as HTMLInputElement).value).toBe(
      'Initial question info',
    );
  });
});
