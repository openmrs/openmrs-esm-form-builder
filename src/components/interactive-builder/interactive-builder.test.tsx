import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { showModal } from '@openmrs/esm-framework';
import { type FormSchema } from '@openmrs/esm-form-engine-lib';
import { type Schema } from '../../types';
import { SelectionProvider } from '../../context/selection-context';
import InteractiveBuilder from './interactive-builder.component';

const mockShowModal = jest.mocked(showModal);

describe('InteractiveBuilder', () => {
  it('renders the interactive builder', async () => {
    const user = userEvent.setup();
    renderInteractiveBuilder();

    const startBuildingButton = screen.getByRole('button', { name: /start building/i });
    expect(startBuildingButton).toBeInTheDocument();
    await user.click(startBuildingButton);

    expect(mockShowModal).toHaveBeenCalledTimes(1);
    expect(mockShowModal).toHaveBeenCalledWith('new-form-modal', {
      closeModal: expect.any(Function),
      schema: {},
      onSchemaChange: expect.any(Function),
    });
  });

  it('populates the interactive builder with the provided schema', () => {
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

    renderInteractiveBuilder({ schema: dummySchema });
    expect(screen.getByRole('link', { name: /form builder documentation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add page/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: dummySchema.name })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: dummySchema.pages[0].label })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: dummySchema.pages[0].sections[0].label })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: dummySchema.pages[0].sections[1].label })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /delete page/i })[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add section/i })).toBeInTheDocument();
  });
});

function renderInteractiveBuilder(props = {}) {
  const defaultProps = {
    isLoading: false,
    onSchemaChange: jest.fn(),
    schema: {} as Schema,
    validationResponse: [],
  };

  render(
    <SelectionProvider>
      <InteractiveBuilder {...defaultProps} {...props} />
    </SelectionProvider>,
  );
}
