import React from 'react';
import { render, screen } from '@testing-library/react';
import SelectAnswers from './select-answers.component';
import { useConceptId } from '@hooks/useConceptId';
import { useConceptLookup } from '@hooks/useConceptLookup';
import { FormFieldProvider } from '../../../../form-field-context';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { Concept } from '@types';
import userEvent from '@testing-library/user-event';

const formField: FormField = {
  id: '1',
  type: 'obs',
  questionOptions: {
    rendering: 'select',
  },
};
const concept: Concept = {
  uuid: '123',
  display: 'Concept 1',
  datatype: { uuid: '456', name: 'Coded' },
  mappings: [{ display: 'CIEL:1606', conceptMapType: { display: 'SAME-AS' } }],
  answers: [
    { uuid: '1', display: 'Answer 1' },
    { uuid: '2', display: 'Answer 2' },
  ],
};

const concepts: Array<Concept> = [
  concept,
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

describe('Select answers component', () => {
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
    expect(screen.getByText(/select answers to display/i)).toBeInTheDocument();
    expect(screen.getByText(/search for a concept to add as an answer/i)).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', {
        name: /search for a backing concept/i,
      }),
    ).toBeInTheDocument();
  });

  it('lets user select answers provided by concept', async () => {
    const user = userEvent.setup();
    renderComponent();
    const answersMenu = screen.getByRole('combobox', {
      name: /select answers to display/i,
    });
    expect(answersMenu).toBeInTheDocument();

    await user.click(answersMenu);
    const answerOption1 = screen.getByRole('option', { name: /answer 1/i });
    expect(answerOption1).toBeInTheDocument();
    expect(screen.getByText(/answer 2/i)).toBeInTheDocument();
    await user.click(answerOption1);

    expect(screen.getByTitle(/answer 1/i)).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', {
        name: /select answers to display total items selected: 1,to clear selection, press delete or backspace/i,
      }),
    ).toBeInTheDocument();
  });

  it('lets users add additional answers if concept is of datatype coded', async () => {
    const user = userEvent.setup();
    renderComponent();

    const searchInput = screen.getByRole('searchbox', { name: /search for a backing concept/i });
    await user.click(searchInput);
    await user.type(searchInput, 'Concept 1');
    expect(
      screen.getByRole('searchbox', {
        name: /search for a backing concept/i,
      }),
    ).toHaveDisplayValue(/concept 1/i);
    const additionalAnswerOption1 = screen.getByRole('menuitem', {
      name: /concept 1/i,
    });
    expect(additionalAnswerOption1).toBeInTheDocument();
    await user.click(additionalAnswerOption1);
    expect(screen.getByText(/concept 1/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /x/i,
      }),
    ).toBeInTheDocument();
  });
});

function renderComponent() {
  render(
    <FormFieldProvider initialFormField={formField} selectedConcept={concept}>
      <SelectAnswers />
    </FormFieldProvider>,
  );
}
