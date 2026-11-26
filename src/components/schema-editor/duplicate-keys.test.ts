import { describe, expect, it } from 'vitest';
import { json } from '@codemirror/lang-json';
import { EditorState } from '@codemirror/state';
import { findDuplicateKeys } from './duplicate-keys';

function duplicatesIn(text: string) {
  const state = EditorState.create({ doc: text, extensions: [json()] });
  return findDuplicateKeys(state).map(({ from, name, lineOfLast }) => ({
    line: state.doc.lineAt(from).number,
    name,
    lineOfLast,
  }));
}

describe('findDuplicateKeys', () => {
  it('flags the earlier of two properties with the same name, which JSON.parse drops', () => {
    const text = [
      '{',
      '  "questionOptions": {',
      '    "rendering": "dennis",',
      '    "rendering": "checkbox"',
      '  }',
      '}',
    ];

    expect(duplicatesIn(text.join('\n'))).toEqual([{ line: 3, name: 'rendering', lineOfLast: 4 }]);
    expect(JSON.parse(text.join('\n')).questionOptions.rendering).toBe('checkbox');
  });

  it('flags every occurrence but the last', () => {
    const text = ['{', '  "id": "a",', '  "id": "b",', '  "label": "Weight",', '  "id": "c"', '}'].join('\n');

    expect(duplicatesIn(text)).toEqual([
      { line: 2, name: 'id', lineOfLast: 5 },
      { line: 3, name: 'id', lineOfLast: 5 },
    ]);
  });

  it('does not flag the same name in different objects', () => {
    const text = JSON.stringify(
      { label: 'Page', sections: [{ label: 'Section' }, { label: 'Other section' }], questionOptions: { label: 'x' } },
      null,
      2,
    );

    expect(duplicatesIn(text)).toEqual([]);
  });

  it('finds duplicates in objects inside arrays', () => {
    const text = [
      '{',
      '  "questions": [',
      '    { "id": "a" },',
      '    { "id": "b", "type": "obs", "id": "c" }',
      '  ]',
      '}',
    ];

    expect(duplicatesIn(text.join('\n'))).toEqual([{ line: 4, name: 'id', lineOfLast: 4 }]);
  });

  it('treats names with escapes as the key they spell', () => {
    expect(duplicatesIn('{\n  "a\\u0062": 1,\n  "ab": 2\n}')).toEqual([{ line: 2, name: 'ab', lineOfLast: 3 }]);
  });

  it('finds nothing in an empty document', () => {
    expect(duplicatesIn('')).toEqual([]);
  });
});
