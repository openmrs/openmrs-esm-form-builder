import { describe, it, expect } from 'vitest';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import { withoutOrphanedQuestions } from './nested-questions';

const questions: Array<FormField> = [{ id: 'childQuestion', type: 'obs', questionOptions: { rendering: 'text' } }];

describe('withoutOrphanedQuestions', () => {
  it('drops nested questions from a question type that cannot group them', () => {
    const formField: FormField = { id: 'q', type: 'obs', questionOptions: { rendering: 'text' }, questions };

    const saved = withoutOrphanedQuestions(formField);

    expect(saved).not.toHaveProperty('questions');
    expect(saved).toEqual({ id: 'q', type: 'obs', questionOptions: { rendering: 'text' } });
  });

  it.each(['obsGroup', 'testOrder'])('keeps nested questions for %s', (type) => {
    const formField: FormField = { id: 'q', type, questionOptions: { rendering: 'group' }, questions };

    expect(withoutOrphanedQuestions(formField)).toBe(formField);
  });

  it('leaves a question without nested questions unchanged', () => {
    const formField: FormField = { id: 'q', type: 'obs', questionOptions: { rendering: 'text' } };

    expect(withoutOrphanedQuestions(formField)).toEqual(formField);
  });
});
