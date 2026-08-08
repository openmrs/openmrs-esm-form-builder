import React from 'react';
import { render, screen } from '@testing-library/react';
import QuestionModal from './question.modal';
import { FormFieldProvider } from './form-field-context';
import { showSnackbar } from '@openmrs/esm-framework';
import type { FormField, RenderType } from '@openmrs/esm-form-engine-lib';
import type { Schema } from '@types';

jest.mock('@openmrs/esm-framework', () => ({
  showSnackbar: jest.fn(),
  useDebounce: jest.fn((val) => val),
}));

jest.mock('@hooks/useConceptLookup', () => ({
  useConceptLookup: jest.fn(() => ({ concepts: [], conceptLookupError: null, isLoadingConcepts: false })),
}));

jest.mock('@hooks/useConceptId', () => ({
  useConceptId: jest.fn(() => ({ concept: null, isLoading: false, error: null })),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => defaultValue || key,
  }),
}));

const mockSchema: Schema = {
  name: 'Test Form',
  encounterType: 'test-encounter',
  pages: [
    {
      label: 'Test Page',
      sections: [
        {
          label: 'Test Section',
          isExpanded: 'true',
          questions: [],
        },
      ],
    },
  ],
  processor: 'EncounterFormProcessor',
  uuid: 'test-uuid',
  referencedForms: [],
};

const obsGroupFormField: FormField = {
  id: 'vitalSigns',
  label: 'Vital Signs',
  type: 'obsGroup',
  questionOptions: {
    rendering: 'group' as RenderType,
    concept: 'test-concept-group',
  },
  questions: [],
};

describe('QuestionModal Component - obsGroup Tests', () => {
  const mockCloseModal = jest.fn();
  const mockOnSchemaChange = jest.fn();
  const mockResetIndices = jest.fn();


  it('should render the question modal with obsGroup type', () => {
    const initialFormField: FormField = {
      ...obsGroupFormField,
      id: 'vitalSigns',
      label: 'Vital Signs',
      type: 'obsGroup',
      questionOptions: {
        rendering: 'group' as RenderType,
        concept: 'test-concept-group',
      },
    };

    render(
      <FormFieldProvider initialFormField={initialFormField}>
        <QuestionModal
          closeModal={mockCloseModal}
          schema={mockSchema}
          pageIndex={0}
          sectionIndex={0}
          questionIndex={0}
          onSchemaChange={mockOnSchemaChange}
          resetIndices={mockResetIndices}
          formField={initialFormField}
        />
      </FormFieldProvider>,
    );

    expect(screen.getByText(/Question type/i)).toBeInTheDocument();
    expect(screen.getByText(/Rendering type/i)).toBeInTheDocument();
  });
});
