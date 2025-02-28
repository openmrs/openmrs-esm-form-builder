import { cleanFormFieldForType } from '../../question.modal';
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
        irrelevantOption: 'remove me',
      },
      required: true,
      extraProp: 'should be removed',
    } as any;

    // Change type from 'obs' to 'control'
    const newType = 'control';
    const cleaned = cleanFormFieldForType(formField, newType);

    // Assert that the type is updated.
    expect(cleaned.type).toBe('control');

    // Assert that required properties remain.
    expect(cleaned.id).toBe('testQuestion');
    expect(cleaned.label).toBe('Test Question');

    // Irrelevant top-level properties should be removed.
    expect(cleaned.required).toBeUndefined();
    expect(cleaned).not.toHaveProperty('extraProp');

    // For nested questionOptions, only allowed keys remain for 'control'.
    // Allowed keys for 'control' in questionOptions are: rendering, minLength, and maxLength.
    expect(cleaned.questionOptions).toHaveProperty('rendering', 'radio');
    expect(cleaned.questionOptions).not.toHaveProperty('concept');
    expect(cleaned.questionOptions).not.toHaveProperty('answers');
    expect(cleaned.questionOptions).not.toHaveProperty('irrelevantOption');
  });
});
