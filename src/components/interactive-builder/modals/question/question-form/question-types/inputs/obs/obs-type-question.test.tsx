import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ObsTypeQuestion from './obs-type-question.component';
import { FormFieldProvider } from '../../../../form-field-context';
import { useConceptId } from '@hooks/useConceptId';
import { useConceptLookup } from '@hooks/useConceptLookup';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { Concept } from '@types';

const mockSetFormField = jest.fn();
const setConcept = jest.fn();
const formField: FormField = {
  id: '1',
  type: 'obs',
  questionOptions: {
    rendering: 'text',
  },
};

jest.mock('../../../../form-field-context', () => ({
  ...jest.requireActual('../../../../form-field-context'),
  useFormField: () => ({ formField, setFormField: mockSetFormField, setConcept }),
}));

const concepts: Array<Concept> = [
  {
    uuid: '123',
    display: 'Concept 1',
    datatype: { uuid: '456', name: 'Coded' },
    mappings: [{ display: 'CIEL:1606', conceptMapType: { display: 'SAME-AS' } }],
    answers: [
      { uuid: '1', display: 'Answer 1' },
      { uuid: '2', display: 'Answer 2' },
    ],
  },
  {
    uuid: '456',
    display: 'Concept 2',
    datatype: { uuid: '456', name: 'Date' },
    mappings: [{ display: 'CIEL:1656', conceptMapType: { display: 'SAME-AS' } }],
  },
];

const mockUseConceptLookup = jest.mocked(useConceptLookup);
jest.mock('@hooks/useConceptLookup', () => ({
  ...jest.requireActual('@hooks/useConceptLookup'),
  useConceptLookup: jest.fn(),
}));

const mockUseConceptId = jest.mocked(useConceptId);
jest.mock('@hooks/useConceptId', () => ({
  ...jest.requireActual('@hooks/useConceptId'),
  useConceptId: jest.fn(),
}));

describe('ObsTypeQuestion', () => {
  it('renders', () => {
    mockUseConceptLookup.mockReturnValue({ concepts: [], conceptLookupError: null, isLoadingConcepts: false });
    mockUseConceptId.mockReturnValue({
      concept: null,
      conceptName: null,
      conceptNameLookupError: null,
      isLoadingConcept: false,
    });
    renderComponent();
    expect(screen.getByRole('searchbox', { name: /search for a backing concept/i })).toBeInTheDocument();
  });

  it('renders the concept details after searching for a concept and displays the concept mappings', async () => {
    mockUseConceptLookup.mockReturnValue({ concepts: concepts, conceptLookupError: null, isLoadingConcepts: false });
    mockUseConceptId.mockReturnValue({
      concept: null,
      conceptName: null,
      conceptNameLookupError: null,
      isLoadingConcept: false,
    });
    const user = userEvent.setup();
    renderComponent();

    const searchInput = screen.getByRole('searchbox', { name: /search for a backing concept/i });
    await user.click(searchInput);
    await user.type(searchInput, 'Concept 1');

    const conceptMenuItem = await screen.findByRole('menuitem', {
      name: /concept 1/i,
    });
    expect(conceptMenuItem).toBeInTheDocument();

    await user.click(conceptMenuItem);
    expect(searchInput).toHaveDisplayValue(/concept 1/i);
  });

  it('sets the date picker format to the concept date picker type', async () => {
    mockUseConceptLookup.mockReturnValue({ concepts: concepts, conceptLookupError: null, isLoadingConcepts: false });
    mockUseConceptId.mockReturnValue({
      concept: null,
      conceptName: null,
      conceptNameLookupError: null,
      isLoadingConcept: false,
    });
    const user = userEvent.setup();
    renderComponent();

    const searchInput = screen.getByRole('searchbox', { name: /search for a backing concept/i });
    await user.click(searchInput);
    await user.type(searchInput, 'Concept 2');

    const conceptMenuItem = await screen.findByRole('menuitem', {
      name: /concept 2/i,
    });
    await user.click(conceptMenuItem);

    // Gets all calls made to our mock function, the arguments from the first call and the first argument of the first call
    const updateFn = mockSetFormField.mock.calls[0][0];

    // Execute the update function with the previous state
    const resultState = updateFn(formField);

    // Check that the result has the expected values
    expect(resultState).toEqual({
      ...formField,
      datePickerFormat: 'calendar',
      questionOptions: {
        ...formField.questionOptions,
        concept: '456',
      },
    });
  });

  it('loads the selected concept details', async () => {
    formField.questionOptions = {
      rendering: 'select',
      concept: concepts[0].uuid,
      answers: [{ label: 'Answer 1', concept: '1' }],
    };
    mockUseConceptLookup.mockReturnValue({ concepts: [], conceptLookupError: null, isLoadingConcepts: false });
    mockUseConceptId.mockReturnValue({
      concept: concepts[0],
      conceptName: concepts[0].display,
      isLoadingConcept: false,
      conceptNameLookupError: null,
    });
    renderComponent();

    expect(
      screen.getByRole('searchbox', {
        name: /search for a backing concept/i,
      }),
    ).toHaveValue('Concept 1');
  });
});

function renderComponent() {
  render(
    <FormFieldProvider initialFormField={formField}>
      <ObsTypeQuestion />
    </FormFieldProvider>,
  );
}
