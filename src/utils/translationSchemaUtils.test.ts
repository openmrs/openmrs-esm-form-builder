import { describe, expect, it } from 'vitest';
import { mergeTranslatedSchema } from './translationSchemaUtils';

const schema = {
  name: 'Test form',
  pages: [
    {
      label: 'Page 1',
      sections: [
        {
          label: 'Section 1',
          questions: [
            {
              id: 'q1',
              label: 'Question 1',
              type: 'obs',
              questionOptions: {
                rendering: 'radio',
                concept: 'concept-uuid',
                answers: [{ concept: 'answer-uuid', label: 'Yes' }],
              },
            },
          ],
        },
      ],
    },
  ],
};

describe('mergeTranslatedSchema', () => {
  it('applies a flat map of translations to page, section, question and answer labels', () => {
    const merged = mergeTranslatedSchema(schema, {
      'Page 1': 'Page un',
      'Section 1': 'Section un',
      'Question 1': 'Question un',
      Yes: 'Oui',
    });

    expect(merged.pages[0].label).toBe('Page un');
    expect(merged.pages[0].sections[0].label).toBe('Section un');
    expect(merged.pages[0].sections[0].questions[0].label).toBe('Question un');
    expect(merged.pages[0].sections[0].questions[0].questionOptions.answers[0].label).toBe('Oui');
    expect(merged).not.toHaveProperty('translations');
    expect(schema.pages[0].label).toBe('Page 1');
  });

  it('returns the schema unchanged when there are no translations for the language', () => {
    expect(mergeTranslatedSchema(schema, undefined)).toBe(schema);
  });
});
