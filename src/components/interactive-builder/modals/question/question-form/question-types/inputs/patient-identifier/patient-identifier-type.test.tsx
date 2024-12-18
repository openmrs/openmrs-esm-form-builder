import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientIdentifierTypeQuestion from './patient-identifier-type-question.component';
import { usePatientIdentifierTypes } from '@hooks/usePatientIdentifierTypes';
import userEvent from '@testing-library/user-event';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { PatientIdentifierType } from '@types';

const mockSetFormField = jest.fn();

const mockUsePatientIdentifierTypes = jest.mocked(usePatientIdentifierTypes);
jest.mock('@hooks/usePatientIdentifierTypes', () => ({
  ...jest.requireActual('@hooks/usePatientIdentifierTypes'),
  usePatientIdentifierTypes: jest.fn((value: string) => value),
}));

const initialFormField: FormField = {
  id: '1',
  type: 'patientIdentifier',
  questionOptions: {
    rendering: 'text',
  },
};

const patientIdentifierTypes: Array<PatientIdentifierType> = [
  { display: 'Type 1', description: 'Example description', name: 'Type 1', uuid: '1' },
  { display: 'Type 2', description: 'Another example description', name: 'Type 2', uuid: '2' },
];

describe('PatientIdentifierTypeQuestion', () => {
  it('renders without crashing and displays the patient idenitifier types', async () => {
    mockUsePatientIdentifierTypes.mockReturnValue({
      patientIdentifierTypes: patientIdentifierTypes,
      patientIdentifierTypeLookupError: null,
      isLoadingPatientIdentifierTypes: false,
    });
    const user = userEvent.setup();
    render(<PatientIdentifierTypeQuestion formField={initialFormField} setFormField={mockSetFormField} />);

    expect(screen.getByText(/search for a backing patient identifier type/i)).toBeInTheDocument();
    expect(
      screen.getByText(/patient identifier type fields must be linked to a patient identifier type/i),
    ).toBeInTheDocument();
    const menuBox = screen.getByRole('combobox');
    expect(menuBox).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /open/i,
      }),
    ).toBeInTheDocument();
    await user.click(menuBox);
    expect(
      screen.getByRole('listbox', {
        name: /choose an item/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/type 1/i)).toBeInTheDocument();
    expect(screen.getByText(/type 2/i)).toBeInTheDocument();
  });

  it('shows spinner when loading the patient identifier types', () => {
    mockUsePatientIdentifierTypes.mockReturnValue({
      patientIdentifierTypes: [],
      patientIdentifierTypeLookupError: null,
      isLoadingPatientIdentifierTypes: true,
    });
    render(<PatientIdentifierTypeQuestion formField={initialFormField} setFormField={mockSetFormField} />);

    expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: /open/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/patient identifier type fields must be linked to a patient identifier type/i),
    ).not.toBeInTheDocument();
  });

  it('displays an error if patient idenitifier types cannot be loaded', () => {
    mockUsePatientIdentifierTypes.mockReturnValue({
      patientIdentifierTypes: [],
      patientIdentifierTypeLookupError: Error(),
      isLoadingPatientIdentifierTypes: false,
    });
    render(<PatientIdentifierTypeQuestion formField={initialFormField} setFormField={mockSetFormField} />);

    expect(screen.getByText(/error fetching patient identifier types/i)).toBeInTheDocument();
    expect(screen.getByText(/please try again\./i)).toBeInTheDocument();
  });

  it('shows the selected identifier type', async () => {
    mockUsePatientIdentifierTypes.mockReturnValue({
      patientIdentifierTypes: patientIdentifierTypes,
      patientIdentifierTypeLookupError: null,
      isLoadingPatientIdentifierTypes: false,
    });
    initialFormField.questionOptions.identifierType = patientIdentifierTypes[0].uuid;
    render(<PatientIdentifierTypeQuestion formField={initialFormField} setFormField={mockSetFormField} />);
    expect(
      screen.getByRole('button', {
        name: /clear selected item/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveDisplayValue(/type 1/i);
  });
});
