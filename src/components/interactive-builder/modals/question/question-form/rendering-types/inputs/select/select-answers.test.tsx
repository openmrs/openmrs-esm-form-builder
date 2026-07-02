import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
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
    datatype: { uuid: '457', name: 'Date' },
    mappings: [{ display: 'CIEL:1656', conceptMapType: { display: 'SAME-AS' } }],
  },
];

const mockUseConceptLookup = vi.mocked(useConceptLookup);
vi.mock('@hooks/useConceptLookup', async () => ({
  ...((await vi.importActual('@hooks/useConceptLookup')) as object),
  useConceptLookup: vi.fn(),
}));
const mockUseConceptId = vi.mocked(useConceptId);
vi.mock('@hooks/useConceptId', async () => ({
  ...((await vi.importActual('@hooks/useConceptId')) as object),
  useConceptId: vi.fn(),
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

  it('shows answers provided by concept as selected initially', async () => {
    const user = userEvent.setup();
    renderComponent();
    const answersMenu = screen.getByRole('combobox', {
      name: /select answers to display/i,
    });
    expect(answersMenu).toBeInTheDocument();

    await user.click(answersMenu);
    const answerOption1 = screen.getByRole('checkbox', {
      name: /answer 1/i,
    });
    const answerOption2 = screen.getByRole('checkbox', {
      name: /answer 2/i,
    });
    expect(answerOption1).toBeChecked();
    expect(answerOption2).toBeChecked();
  });

  it('keeps a cleared selection cleared instead of re-selecting every answer', async () => {
    const user = userEvent.setup();
    renderComponent();
    const answersMenu = screen.getByRole('combobox', {
      name: /select answers to display/i,
    });

    await user.click(answersMenu);
    await user.click(screen.getByRole('checkbox', { name: /answer 1/i }));
    await user.click(screen.getByRole('checkbox', { name: /answer 2/i }));

    expect(screen.getByRole('checkbox', { name: /answer 1/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /answer 2/i })).not.toBeChecked();
  });

  it('renders the answers menu when a saved custom answer exists and the concept has no answers', () => {
    render(
      <FormFieldProvider
        initialFormField={{
          ...formField,
          questionOptions: {
            rendering: 'select',
            answers: [{ concept: '999', label: 'Custom answer' }],
          },
        }}
        selectedConcept={{ ...concept, answers: [] }}>
        <SelectAnswers />
      </FormFieldProvider>,
    );

    const answersMenu = screen.getByRole('combobox', {
      name: /select answers to display/i,
    });
    expect(answersMenu).toBeInTheDocument();
  });

  it('lets users add additional answers if concept is of datatype coded', async () => {
    const user = userEvent.setup();
    renderComponent();

    const searchInput = screen.getByRole('searchbox', { name: /search for a backing concept/i });
    await user.click(searchInput);
    await user.type(searchInput, 'Concept 2');
    expect(
      screen.getByRole('searchbox', {
        name: /search for a backing concept/i,
      }),
    ).toHaveDisplayValue(/concept 2/i);
    const additionalAnswerOption1 = screen.getByRole('menuitem', {
      name: /concept 2/i,
    });
    expect(
      screen.getByRole('button', {
        name: /clear search input/i,
      }),
    ).toBeInTheDocument();
    expect(additionalAnswerOption1).toBeInTheDocument();
    await user.click(additionalAnswerOption1);

    expect(screen.getByText(/concept 2/i)).toBeInTheDocument();

    screen.getByRole('button', {
      name: /clear search input/i,
    });
  });
});

function renderComponent() {
  render(
    <FormFieldProvider initialFormField={formField} selectedConcept={concept}>
      <SelectAnswers />
    </FormFieldProvider>,
  );
}
