import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ObsTypeQuestion from './obs-type-question.component';
import { useConceptId } from '@hooks/useConceptId';
import { useConceptLookup } from '@hooks/useConceptLookup';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { Concept } from '@types';

const mockSetFormField = jest.fn();

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

const initialFormField: FormField = {
  id: '1',
  type: 'obs',
  questionOptions: {
    rendering: 'text',
  },
};

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
  it('renders without crashing', () => {
    mockUseConceptLookup.mockReturnValue({ concepts: [], conceptLookupError: null, isLoadingConcepts: false });
    mockUseConceptId.mockReturnValue({
      concept: null,
      conceptName: null,
      conceptNameLookupError: null,
      isLoadingConcept: false,
    });
    render(<ObsTypeQuestion formField={initialFormField} setFormField={mockSetFormField} />);
    expect(screen.getByRole('searchbox', { name: /search for a backing concept/i })).toBeInTheDocument();
  });

  it('renders the concept details after searching for a concept and displays the concept mappings and answers', async () => {
    mockUseConceptLookup.mockReturnValue({ concepts: concepts, conceptLookupError: null, isLoadingConcepts: false });
    mockUseConceptId.mockReturnValue({
      concept: null,
      conceptName: null,
      conceptNameLookupError: null,
      isLoadingConcept: false,
    });
    const user = userEvent.setup();
    render(<ObsTypeQuestion formField={initialFormField} setFormField={mockSetFormField} />);

    const searchInput = screen.getByRole('searchbox', { name: /search for a backing concept/i });
    await user.click(searchInput);
    await user.type(searchInput, 'Concept 1');

    const conceptMenuItem = await screen.findByRole('menuitem', {
      name: /concept 1/i,
    });
    expect(conceptMenuItem).toBeInTheDocument();

    await user.click(conceptMenuItem);

    expect(mockSetFormField).toHaveBeenCalledWith({
      ...initialFormField,
      questionOptions: { ...initialFormField.questionOptions, concept: '123' },
    });
    expect(
      screen.getByRole('cell', {
        name: /ciel:1606/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', {
        name: /same\-as/i,
      }),
    ).toBeInTheDocument();

    const answersMenu = screen.getByRole('combobox', {
      name: /select answers to display/i,
    });
    expect(answersMenu).toBeInTheDocument();

    await user.click(answersMenu);
    expect(screen.getByText(/answer 1/i)).toBeInTheDocument();
    expect(screen.getByText(/answer 2/i)).toBeInTheDocument();
  });

  it('displays an error with a link to ocl when concept query gives empty results', async () => {
    mockUseConceptLookup.mockReturnValue({ concepts: [], conceptLookupError: null, isLoadingConcepts: false });
    mockUseConceptId.mockReturnValue({
      concept: null,
      conceptName: null,
      conceptNameLookupError: null,
      isLoadingConcept: false,
    });
    const user = userEvent.setup();
    render(<ObsTypeQuestion formField={initialFormField} setFormField={mockSetFormField} />);

    const searchInput = screen.getByRole('searchbox', { name: /search for a backing concept/i });
    await user.click(searchInput);
    await user.type(searchInput, 'Does not exist');

    expect(screen.getByText(/no concepts were found that match/i)).toBeInTheDocument();
    expect(screen.getByText(/can't find a concept\?/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /search in ocl/i,
      }),
    ).toBeInTheDocument();
  });

  it('shows loading spinner when concept is loading', async () => {
    mockUseConceptLookup.mockReturnValue({ concepts: concepts, conceptLookupError: null, isLoadingConcepts: true });
    mockUseConceptId.mockReturnValue({
      concept: null,
      conceptName: null,
      conceptNameLookupError: null,
      isLoadingConcept: false,
    });
    const user = userEvent.setup();
    render(<ObsTypeQuestion formField={initialFormField} setFormField={mockSetFormField} />);

    const searchInput = screen.getByRole('searchbox', { name: /search for a backing concept/i });
    await user.click(searchInput);
    await user.type(searchInput, 'Does not exist');
    expect(screen.getByText(/searching\.\.\./i)).toBeInTheDocument();
  });

  it('displays an error message if the searched concept cannot be found', async () => {
    mockUseConceptLookup.mockReturnValue({ concepts: [], conceptLookupError: Error(), isLoadingConcepts: false });
    mockUseConceptId.mockReturnValue({
      concept: null,
      conceptName: null,
      conceptNameLookupError: null,
      isLoadingConcept: false,
    });
    render(<ObsTypeQuestion formField={initialFormField} setFormField={mockSetFormField} />);

    expect(screen.getByText(/error fetching concepts/i)).toBeInTheDocument();
    expect(screen.getByText(/please try again\./i)).toBeInTheDocument();
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
    render(<ObsTypeQuestion formField={initialFormField} setFormField={mockSetFormField} />);

    const searchInput = screen.getByRole('searchbox', { name: /search for a backing concept/i });
    await user.click(searchInput);
    await user.type(searchInput, 'Concept 2');
    const conceptMenuItem = await screen.findByRole('menuitem', {
      name: /concept 2/i,
    });
    expect(conceptMenuItem).toBeInTheDocument();

    await user.click(conceptMenuItem);
    expect(mockSetFormField).toHaveBeenCalledWith({
      ...initialFormField,
      datePickerFormat: 'calendar',
      questionOptions: { ...initialFormField.questionOptions, concept: '456' },
    });
  });

  it('loads the concept details along with the selected answer when editing a question', async () => {
    initialFormField.questionOptions = {
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
    const user = userEvent.setup();
    render(<ObsTypeQuestion formField={initialFormField} setFormField={mockSetFormField} />);

    expect(
      screen.getByRole('searchbox', {
        name: /search for a backing concept/i,
      }),
    ).toHaveValue('Concept 1');
    expect(screen.getByText(/mappings/i)).toBeInTheDocument();
    expect(
      screen.getByRole('cell', {
        name: /ciel:1606/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', {
        name: /same\-as/i,
      }),
    ).toBeInTheDocument();

    const answersMenu = screen.getByRole('combobox', {
      name: /select answers to display/i,
    });
    expect(answersMenu).toBeInTheDocument();

    await user.click(answersMenu);
    expect(
      screen.getByRole('option', {
        name: /answer 1/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: /answer 2/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByTitle(/answer 1/i)).toBeInTheDocument();
  });

  it('shows loading spinner when loading the concept when editing the question', async () => {
    mockUseConceptLookup.mockReturnValue({ concepts: concepts, conceptLookupError: null, isLoadingConcepts: true });
    mockUseConceptId.mockReturnValue({
      concept: null,
      conceptName: null,
      conceptNameLookupError: null,
      isLoadingConcept: true,
    });
    const user = userEvent.setup();
    render(<ObsTypeQuestion formField={initialFormField} setFormField={mockSetFormField} />);
    expect(
      screen.queryByRole('searchbox', {
        name: /search for a backing concept/i,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
  });

  it('shows error if concept in question cannot be not when trying to edit', async () => {
    mockUseConceptLookup.mockReturnValue({ concepts: [], conceptLookupError: null, isLoadingConcepts: false });
    mockUseConceptId.mockReturnValue({
      concept: null,
      conceptName: null,
      conceptNameLookupError: Error(),
      isLoadingConcept: false,
    });
    initialFormField.questionOptions = {
      rendering: 'select',
      concept: concepts[0].uuid,
      answers: [{ label: 'Answer 1', concept: '1' }],
    };
    render(<ObsTypeQuestion formField={initialFormField} setFormField={mockSetFormField} />);

    expect(screen.getByText(/couldn't resolve concept name/i)).toBeInTheDocument();
    expect(
      screen.getByText(/the linked concept '\{\{conceptname\}\}' does not exist in your dictionary/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/answer 1/i)).toBeInTheDocument();
  });
});
