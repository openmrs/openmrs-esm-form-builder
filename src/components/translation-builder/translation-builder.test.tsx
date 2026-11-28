import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { showModal } from '@openmrs/esm-framework';
import { type FormSchema } from '@openmrs/esm-form-engine-lib';
import { type Schema } from '../../types';
import TranslationBuilder from './translation-builder.component';
import EditTranslationModal from './edit-translation.modal';

const mockShowModal = jest.mocked(showModal);

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('TranslationBuilder', () => {
  it('renders the translation builder', async () => {
    const user = userEvent.setup();
    renderTranslationBuilder();
    expect(screen.getByText(/No translatable strings found/i)).toBeInTheDocument();
  });
  it('updates schema when a translation value changes', async () => {
    const user = userEvent.setup();
    const dummySchema: FormSchema = {
      encounterType: '',
      name: 'Sample Form',
      processor: 'EncounterFormProcessor',
      referencedForms: [],
      uuid: '',
      version: '1.0',
      pages: [
        {
          label: 'First Page',
          sections: [
            {
              label: 'A Section',
              isExpanded: 'true',
              questions: [
                {
                  id: 'sampleQuestion',
                  label: 'A Question of type obs that renders a text input',
                  type: 'obs',
                  questionOptions: {
                    rendering: 'text',
                    concept: 'a-system-defined-concept-uuid',
                  },
                },
              ],
            },
            {
              label: 'Another Section',
              isExpanded: 'true',
              questions: [
                {
                  id: 'anotherSampleQuestion',
                  label: 'Another Question of type obs whose answers get rendered as radio inputs',
                  type: 'obs',
                  questionOptions: {
                    rendering: 'radio',
                    concept: 'system-defined-concept-uuid',
                    answers: [
                      {
                        concept: 'another-system-defined-concept-uuid',
                        label: 'Choice 1',
                        conceptMappings: [],
                      },
                      {
                        concept: 'yet-another-system-defined-concept-uuid',
                        label: 'Choice 2',
                        conceptMappings: [],
                      },
                      {
                        concept: 'yet-one-more-system-defined-concept-uuid',
                        label: 'Choice 3',
                        conceptMappings: [],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    mockShowModal.mockImplementation((_, props) => {
      render(
        <EditTranslationModal
          onClose={jest.fn()}
          originalKey="sampleQuestion"
          initialValue="A Question of type obs that renders a text input"
          onSave={jest.fn()}
          {...props}
        />,
      );
      return () => {};
    });

    renderTranslationBuilder({ formSchema: dummySchema });
    expect(screen.getAllByText(/First Page/i)).toHaveLength(2);
    expect(screen.getAllByText(/A Question of type obs that renders a text input/i)).toHaveLength(2);

    const editBtns = screen.getAllByRole('button', { name: /edit string/i });
    await user.click(editBtns[0]);

    expect(mockShowModal).toHaveBeenCalledTimes(1);
    const input = screen.getByLabelText(/translated value/i);

    await user.clear(input);
    await user.type(input, 'Updated Question');

    const saveBtn = await screen.findByRole('button', { name: /save/i });
    await user.click(saveBtn);
  });
});

function renderTranslationBuilder(props = {}) {
  const defaultProps = {
    formSchema: {} as Schema,
    onUpdateSchema: jest.fn(),
  };

  const mergedProps = { ...defaultProps, ...props };

  return {
    ...render(<TranslationBuilder {...mergedProps} />),
    onUpdateSchema: mergedProps.onUpdateSchema,
  };
}
