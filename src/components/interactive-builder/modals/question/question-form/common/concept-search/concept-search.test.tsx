import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useConceptId } from '@hooks/useConceptId';
import { useConceptLookup } from '@hooks/useConceptLookup';
import ConceptSearch from './concept-search.component';
import type { Concept } from '@types';

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
const onSelectConcept = jest.fn();

describe('Concept search component', () => {
  beforeEach(() => {
    mockUseConceptLookup.mockReturnValue({ concepts: concepts, conceptLookupError: null, isLoadingConcepts: false });
    mockUseConceptId.mockReturnValue({
      concept: null,
      conceptName: null,
      conceptNameLookupError: null,
      isLoadingConcept: false,
    });
  });
  it('renders', () => {
    renderComponent();
    expect(screen.getByRole('searchbox', { name: /search for a backing concept/i })).toBeInTheDocument();
  });

  it('allows user to search and select a concept', async () => {
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
    expect(searchInput).toHaveDisplayValue(/concept 1/i);
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
    renderComponent();

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
    renderComponent();

    expect(screen.getByText(/error fetching concepts/i)).toBeInTheDocument();
    expect(screen.getByText(/please try again\./i)).toBeInTheDocument();
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
    renderComponent();

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
});

function renderComponent() {
  render(<ConceptSearch onSelectConcept={onSelectConcept} />);
}
