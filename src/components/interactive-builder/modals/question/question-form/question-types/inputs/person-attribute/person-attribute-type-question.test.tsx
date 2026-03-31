import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { PersonAttributeType } from '@types';
import { useFormField } from '../../../../form-field-context';
import { usePersonAttributeTypes } from '@hooks/usePersonAttributeTypes';
import PersonAttributeTypeQuestion from './person-attribute-type-question.component';

const mockSetFormField = jest.fn();
const formField: FormField = {
  id: '1',
  type: 'personAttribute',
  questionOptions: {
    rendering: 'text',
  },
};

jest.mock('../../../../form-field-context');
const mockUseFormField = jest.mocked(useFormField);

jest.mock('@hooks/usePersonAttributeTypes');
const mockUsePersonAttributeTypes = jest.mocked(usePersonAttributeTypes);

const personAttributeTypes: Array<PersonAttributeType> = [
  { uuid: '1', display: 'Email', format: 'java.lang.String', concept: null },
  { uuid: '2', display: 'Phone Number', format: 'java.lang.String', concept: null },
];

describe('PersonAttributeTypeQuestion', () => {
  beforeEach(() => {
    mockUseFormField.mockReturnValue({
      formField,
      setFormField: mockSetFormField,
      concept: null,
      setConcept: jest.fn(),
      isConceptValid: true,
      setIsConceptValid: jest.fn(),
    });
  });

  it('renders without crashing and displays the person attribute types', async () => {
    mockUsePersonAttributeTypes.mockReturnValue({
      personAttributeTypes: personAttributeTypes,
      personAttributeTypeLookupError: null,
      isLoadingPersonAttributeTypes: false,
    });
    const user = userEvent.setup();
    renderComponent();

    expect(screen.getByText(/search for a backing person attribute type/i)).toBeInTheDocument();
    expect(
      screen.getByText(/person attribute type fields must be linked to a person attribute type/i),
    ).toBeInTheDocument();
    const comboBox = screen.getByRole('combobox');
    expect(comboBox).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument();

    await user.click(comboBox);
    expect(screen.getByText(/email/i)).toBeInTheDocument();
    expect(screen.getByText(/phone number/i)).toBeInTheDocument();
  });

  it('shows spinner when loading the person attribute types', () => {
    mockUsePersonAttributeTypes.mockReturnValue({
      personAttributeTypes: [],
      personAttributeTypeLookupError: null,
      isLoadingPersonAttributeTypes: true,
    });
    renderComponent();

    expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /open/i })).not.toBeInTheDocument();
    expect(
      screen.queryByText(/person attribute type fields must be linked to a person attribute type/i),
    ).not.toBeInTheDocument();
  });

  it('displays an error if person attribute types cannot be loaded', () => {
    mockUsePersonAttributeTypes.mockReturnValue({
      personAttributeTypes: [],
      personAttributeTypeLookupError: Error(),
      isLoadingPersonAttributeTypes: false,
    });
    renderComponent();

    expect(screen.getByText(/error fetching person attribute types/i)).toBeInTheDocument();
    expect(screen.getByText(/please try again\./i)).toBeInTheDocument();
  });

  it('shows the selected person attribute type', () => {
    mockUsePersonAttributeTypes.mockReturnValue({
      personAttributeTypes: personAttributeTypes,
      personAttributeTypeLookupError: null,
      isLoadingPersonAttributeTypes: false,
    });
    formField.questionOptions = {
      rendering: 'text',
      attributeType: personAttributeTypes[0].uuid,
    };
    renderComponent();

    expect(screen.getByRole('button', { name: /clear selected item/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveDisplayValue(/email/i);
  });

  it('calls setFormField with the correct attributeType when a person attribute type is selected', async () => {
    mockUsePersonAttributeTypes.mockReturnValue({
      personAttributeTypes: personAttributeTypes,
      personAttributeTypeLookupError: null,
      isLoadingPersonAttributeTypes: false,
    });
    formField.questionOptions = { rendering: 'text' };
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /open/i }));
    await user.click(screen.getByText(/email/i));

    expect(mockSetFormField).toHaveBeenCalledWith(
      expect.objectContaining({
        questionOptions: expect.objectContaining({
          attributeType: '1',
        }),
      }),
    );
  });
});

function renderComponent() {
  render(<PersonAttributeTypeQuestion />);
}
