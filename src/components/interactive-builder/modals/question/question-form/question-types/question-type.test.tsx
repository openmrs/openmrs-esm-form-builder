import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormFieldProvider } from '../../form-field-context';
import QuestionTypeComponent from './question-type.component';
import type { FormField } from '@openmrs/esm-form-engine-lib';

const mockSetFormField = jest.fn();
const formField: FormField = {
  type: 'obs',
  questionOptions: { rendering: 'text' },
  id: '1',
};

jest.mock('../../form-field-context', () => ({
  ...jest.requireActual('../../form-field-context'),
  useFormField: () => ({ formField, setFormField: mockSetFormField }),
}));

describe('RenderingType Component', () => {
  it('renders the obs component for question type obs', () => {
    renderQuestionTypeComponent();

    const obsComponent = screen.getByRole('searchbox', { name: /search for a backing concept/i });

    expect(obsComponent).toBeInTheDocument();
  });

  it('renders the patient identifier component for question type patientIdentifier', () => {
    formField.type = 'patientIdentifier';
    renderQuestionTypeComponent();

    const patientIdentifierComponent = screen.getByText(/search for a backing patient identifier type/i);

    expect(patientIdentifierComponent).toBeInTheDocument();
  });

  it('renders the program state component for question type programState', () => {
    formField.type = 'programState';
    renderQuestionTypeComponent();

    const programStateComponent = screen.getByText(/select a program/i);

    expect(programStateComponent).toBeInTheDocument();
  });

  it('renders the test order component for question type testOrder', () => {
    formField.type = 'testOrder';
    renderQuestionTypeComponent();

    const testOrderComponent = screen.getByText(/selectable orders/i);

    expect(testOrderComponent).toBeInTheDocument();
  });

  it('prints error to console if component cannot be found for type', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    formField.type = 'control';
    renderQuestionTypeComponent();

    expect(consoleErrorSpy).toHaveBeenCalledWith(`No component found for questiontype: ${formField.type}`);
    consoleErrorSpy.mockRestore();
  });
});

function renderQuestionTypeComponent() {
  render(
    <FormFieldProvider initialFormField={formField}>
      <QuestionTypeComponent />
    </FormFieldProvider>,
  );
}
