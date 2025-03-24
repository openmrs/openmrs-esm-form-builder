import { cleanFormFieldForType } from '../../question-utils';
import type { FormField } from '@openmrs/esm-form-engine-lib';

describe('cleanFormFieldForType', () => {
  it('should remove irrelevant top-level and nested properties when changing the question type', () => {
    const formField: FormField = {
      id: 'testQuestion',
      label: 'Test Question',
      type: 'obs',
      questionOptions: {
        rendering: 'radio',
        concept: '12345',
        answers: [
          { concept: '111', label: 'Yes' },
          { concept: '222', label: 'No' },
        ],
      },
      required: true,
    };

    // Change type from 'obs' to 'control' and update rendering to 'markdown'
    const newType = 'control';
    const cleaned = cleanFormFieldForType(
      { ...formField, type: newType, questionOptions: { rendering: 'markdown' } },
      newType,
    );

    // Assert that the type is updated.
    expect(cleaned.type).toBe('control');

    // Assert that id remains.
    expect(cleaned.id).toBe('testQuestion');

    // In our design, label is required for all question types, so it should remain.
    expect(cleaned.label).toBe('Test Question');

    // Irrelevant nested properties should be removed.
    expect(cleaned.questionOptions).toHaveProperty('rendering', 'markdown');
    expect(cleaned.questionOptions).not.toHaveProperty('concept');
    expect(cleaned.questionOptions).not.toHaveProperty('answers');
  });
});
