import { describe, expect, it } from 'vitest';
import { findInstanceLine } from './schema-error-line';

const schema = JSON.stringify(
  {
    name: 'Cookbook',
    pages: [
      {
        label: 'showComment (attach a comment to an obs)',
        questions: [{ id: 'hivStatus', questionOptions: { showComment: 'true' } }],
      },
      { label: 'Second page', 'odd-key': 1 },
    ],
  },
  null,
  2,
);

function lineOf(text: string) {
  return schema.split('\n').findIndex((line) => line.includes(text)) + 1;
}

describe('findInstanceLine', () => {
  it('finds a top-level property', () => {
    expect(findInstanceLine(schema, '.name')).toBe(2);
  });

  it('finds a nested property on its own line, not an earlier line that mentions its name', () => {
    expect(findInstanceLine(schema, '.pages[0].questions[0].questionOptions.showComment')).toBe(
      lineOf('"showComment": "true"'),
    );
    expect(lineOf('"showComment": "true"')).toBeGreaterThan(lineOf('showComment (attach'));
  });

  it('finds array elements', () => {
    expect(findInstanceLine(schema, '.pages[1]')).toBe(lineOf('"label": "Second page"') - 1);
  });

  it('finds properties whose names need quoting', () => {
    expect(findInstanceLine(schema, '.pages[1]["odd-key"]')).toBe(lineOf('"odd-key"'));
  });

  it('finds the property that additionalProperties errors name', () => {
    expect(findInstanceLine(schema, '.pages[1]', 'odd-key')).toBe(lineOf('"odd-key"'));
  });

  it('puts errors about the whole schema on the first line', () => {
    expect(findInstanceLine(schema, '')).toBe(1);
  });

  it('stops at the deepest part of the path it can find', () => {
    expect(findInstanceLine(schema, '.pages[5].label')).toBe(lineOf('"pages"'));
    expect(findInstanceLine(schema, '.missing')).toBe(1);
  });
});
