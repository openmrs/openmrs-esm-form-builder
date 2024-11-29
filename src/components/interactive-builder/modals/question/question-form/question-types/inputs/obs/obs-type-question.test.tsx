import React from 'react';
import { render, screen } from '@testing-library/react';
import ObsTypeQuestion from './obs-type-question.component';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import userEvent from '@testing-library/user-event';

const mockSetFormField = jest.fn();

jest.mock('@openmrs/esm-framework', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  useDebounce: jest.fn((value) => value),
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@hooks/useConceptLookup', () => ({
  ...jest.requireActual('@hooks/useConceptLookup'),
  useConceptLookup: jest.fn(() => ({
    concepts: [
      {
        uuid: '123',
        display: 'Concept 1',
        datatype: { uuid: '456', name: 'Coded' },
        mappings: [{ display: 'CIEL:1606', conceptMapType: { display: 'SAME-AS' } }],
        answers: [{ uuid: '1', display: 'Answer 1' }],
      },
      {
        uuid: '456',
        display: 'Concept 2',
        datatype: { uuid: '456', name: 'Date' },
        mappings: [{ display: 'CIEL:1656', conceptMapType: { display: 'SAME-AS' } }],
      },
    ],
    conceptLookupError: null,
    isLoadingConcepts: false,
  })),
}));

jest.mock('@hooks/useConceptId', () => ({
  useConceptId: jest.fn(() => ({
    concept: '123',
    conceptName: 'Concept 1',
    conceptNameLookupError: null,
    isLoadingConcept: false,
  })),
}));

const formField: FormField = {
  type: 'obs',
  questionOptions: {
    rendering: 'select',
    concept: '123',
    answers: [
      { id: '111', text: 'Answer 1' },
      { id: '222', text: 'Answer 2' },
    ],
  },
  id: '1',
};

describe('ObsTypeQuestion', () => {
  it('renders without crashing', () => {
    render(<ObsTypeQuestion formField={formField} setFormField={mockSetFormField} />);
    expect(screen.getByRole('searchbox', { name: /search for a backing concept/i })).toBeInTheDocument();
  });

  it('allows user to search for and select a concept and displays the concept mappings', async () => {
    render(<ObsTypeQuestion formField={formField} setFormField={mockSetFormField} />);
    const user = userEvent.setup();
    const searchInput = screen.getByRole('searchbox', { name: /search for a backing concept/i });
    await user.click(searchInput);
    await user.type(searchInput, 'Concept 1');
    const conceptMenuItem = await screen.findByRole('menuitem', {
      name: /concept 1/i,
    });
    expect(conceptMenuItem).toBeInTheDocument();
    await user.click(conceptMenuItem);
    expect(mockSetFormField).toHaveBeenCalledWith({
      ...formField,
      questionOptions: { ...formField.questionOptions, concept: '123' },
    });
    expect(
      screen.getByRole('cell', {
        name: /ciel:1606/i,
      }),
    ).toBeInTheDocument();
    const answersMenu = screen.getByRole('combobox', {
      name: /select answers to display/i,
    });
    expect(answersMenu).toBeInTheDocument();
    await user.click(answersMenu);
    const answerMenuItem = await screen.findByRole('menuitem', {
      name: /answer 1/i,
    });
    await user.click(answerMenuItem);
    expect(mockSetFormField).toHaveBeenCalledWith({
      ...formField,
      questionOptions: { ...formField.questionOptions, answers: [{ id: '111', text: 'Answer 1' }] },
    });
  });

  it('sets the date picker format to the concept date picker type', async () => {
    render(<ObsTypeQuestion formField={formField} setFormField={mockSetFormField} />);
    const user = userEvent.setup();
    const searchInput = screen.getByRole('searchbox', { name: /search for a backing concept/i });
    await user.click(searchInput);
    await user.type(searchInput, 'Concept 2');
    const conceptMenuItem = await screen.findByRole('menuitem', {
      name: /concept 2/i,
    });
    await user.click(conceptMenuItem);
    expect(mockSetFormField).toHaveBeenCalledWith({
      ...formField,
      datePickerFormat: 'calendar',
      questionOptions: { ...formField.questionOptions, concept: '456' },
    });
  });

  it('shows the selected concept when editing a question', () => {
    render(<ObsTypeQuestion formField={formField} setFormField={mockSetFormField} />);
    expect(
      screen.getByRole('searchbox', {
        name: /search for a backing concept/i,
      }),
    ).toHaveValue('Concept 1');
  });
});
