// Covers the editing features that come from CodeMirror itself. The editor-agnostic behaviour is in
// schema-editor.test.tsx.
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { acceptCompletion, currentCompletions, startCompletion } from '@codemirror/autocomplete';
import { foldAll, foldedRanges } from '@codemirror/language';
import { forEachDiagnostic } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import { useStandardFormSchema } from '@hooks/useStandardFormSchema';
import SchemaEditor from './schema-editor.component';

vi.mock('@hooks/useStandardFormSchema');

const mockUseStandardFormSchema = vi.mocked(useStandardFormSchema);

const referenceSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Name of the form' },
    encounter: {
      oneOf: [{ type: 'string' }, { type: 'object', properties: { uuid: { type: 'string' } } }],
      description: 'The encounter',
    },
    pages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                questions: { type: 'array', items: { $ref: '#/definitions/formField' } },
              },
            },
          },
        },
      },
    },
  },
  definitions: {
    formField: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        type: { type: 'string' },
        questionOptions: { $ref: '#/definitions/questionOptions', description: 'Options specific to the question' },
        questions: { type: 'array', items: { $ref: '#/definitions/formField' } },
      },
    },
    questionOptions: {
      type: 'object',
      properties: {
        rendering: { $ref: '#/definitions/renderType' },
      },
    },
    renderType: { type: 'string', enum: ['number', 'radio', 'text'] },
  },
};

/** A question inside a page and section, with `content` on line 9. */
function questionSchema(content: string) {
  return [
    '{',
    '  "pages": [',
    '    {',
    '      "sections": [',
    '        {',
    '          "questions": [',
    '            {',
    '              "label": "Weight",',
    `              ${content}`,
    '            }',
    '          ]',
    '        }',
    '      ]',
    '    }',
    '  ]',
    '}',
  ].join('\n');
}

const modifier = /Mac/.test(navigator.platform) ? { metaKey: true } : { ctrlKey: true };

function getContent() {
  return screen.getByRole('textbox', { name: 'Schema editor' });
}

function getView() {
  return EditorView.findFromDOM(getContent());
}

async function getCompletionsAt(line: number, column: number) {
  const view = getView();
  act(() => view.dispatch({ selection: { anchor: view.state.doc.line(line).from + column } }));

  act(() => {
    startCompletion(view);
  });

  // The completion sources run asynchronously.
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
  return currentCompletions(view.state);
}

async function acceptFirstCompletion() {
  // CodeMirror ignores completion commands for 75 ms after the list opens, so keys pressed before it shows don't pick.
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
  act(() => {
    acceptCompletion(getView());
  });
}

function renderSchemaEditor(stringifiedSchema: string) {
  const props = {
    errors: [],
    onSchemaChange: vi.fn(),
    setErrors: vi.fn(),
    setValidationOn: vi.fn(),
    validationOn: false,
  };

  const utils = render(
    <>
      <SchemaEditor {...props} stringifiedSchema={stringifiedSchema} />
      <button>After the editor</button>
    </>,
  );

  return { ...utils, props };
}

describe('SchemaEditor (CodeMirror)', () => {
  beforeEach(() => {
    mockUseStandardFormSchema.mockReturnValue({
      schema: referenceSchema,
      schemaProperties: referenceSchema.properties,
      error: undefined,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('gives the editor an accessible name', () => {
    renderSchemaEditor('{}');

    expect(getContent()).toHaveAccessibleName('Schema editor');
  });

  it('indents with Tab', () => {
    renderSchemaEditor('{\n"name": "Nutrition"\n}');
    const view = getView();
    act(() => view.dispatch({ selection: { anchor: view.state.doc.line(2).from } }));

    fireEvent.keyDown(getContent(), { key: 'Tab', keyCode: 9 });

    expect(view.state.doc.line(2).text).toBe('  "name": "Nutrition"');
    expect(view.state.tabSize).toBe(2);
  });

  it('lets keyboard users leave the editor with Escape then Tab', () => {
    renderSchemaEditor('{\n"name": "Nutrition"\n}');
    const content = getContent();

    // jsdom doesn't move focus on Tab, so this checks that the editor leaves Tab to the browser, which does.
    // fireEvent returns false when the event's default action was prevented.
    fireEvent.keyDown(content, { key: 'Escape', keyCode: 27 });
    const tabLeftToBrowser = fireEvent.keyDown(content, { key: 'Tab', keyCode: 9 });

    expect(tabLeftToBrowser).toBe(true);
    expect(getView().state.doc.toString()).toBe('{\n"name": "Nutrition"\n}');
  });

  it('flags JSON syntax errors', async () => {
    vi.useFakeTimers();
    renderSchemaEditor('{}');
    const view = getView();

    act(() =>
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: '{\n  "name": "Nutrition"\n  "pages": []\n}' },
      }),
    );
    act(() => vi.advanceTimersByTime(1000));
    await act(() => Promise.resolve());

    const diagnostics = [];
    forEachDiagnostic(view.state, (diagnostic, from) =>
      diagnostics.push({ line: view.state.doc.lineAt(from).number, message: diagnostic.message }),
    );
    expect(diagnostics).toEqual([{ line: 3, message: expect.stringMatching(/JSON/) }]);
  });

  it('warns about a key that a later key with the same name overrides', async () => {
    vi.useFakeTimers();
    renderSchemaEditor('{}');
    const view = getView();

    act(() =>
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: questionSchema('"type": "obs", "type": "control"') },
      }),
    );
    act(() => vi.advanceTimersByTime(1000));
    await act(() => Promise.resolve());

    const diagnostics = [];
    forEachDiagnostic(view.state, (diagnostic, from, to) =>
      diagnostics.push({
        line: view.state.doc.lineAt(from).number,
        text: view.state.sliceDoc(from, to),
        severity: diagnostic.severity,
        message: diagnostic.message,
      }),
    );
    expect(diagnostics).toEqual([
      { line: 9, text: '"type"', severity: 'warning', message: expect.stringMatching(/is set again on line/) },
    ]);
  });

  it('suggests only the keys the reference schema allows in the object at the cursor', async () => {
    renderSchemaEditor(questionSchema('""'));

    const completions = await getCompletionsAt(9, 15);

    expect(completions.map((completion) => completion.label).sort()).toEqual(['questionOptions', 'questions', 'type']);
  });

  it('suggests each key once, with its type and description', async () => {
    renderSchemaEditor('{\n  ""\n}');

    const completions = await getCompletionsAt(2, 3);

    expect(completions.map((completion) => completion.label).sort()).toEqual(['encounter', 'name', 'pages']);
    expect(completions.find((completion) => completion.label === 'encounter')).toMatchObject({
      detail: 'string | object',
      info: 'The encounter',
    });
    expect(completions.find((completion) => completion.label === 'name')).toMatchObject({
      detail: 'string',
      info: 'Name of the form',
    });
  });

  it('follows references in the reference schema', async () => {
    renderSchemaEditor(questionSchema('"questionOptions": { "" }'));

    const completions = await getCompletionsAt(9, 36);

    expect(completions.map((completion) => completion.label)).toEqual(['rendering']);
    expect(completions[0]).toMatchObject({ detail: 'string' });
  });

  it('describes a referenced key with the description written next to the reference', async () => {
    renderSchemaEditor(questionSchema('"questionO"'));

    const completions = await getCompletionsAt(9, 24);

    expect(completions.find((completion) => completion.label === 'questionOptions')).toMatchObject({
      detail: 'object',
      info: 'Options specific to the question',
    });
  });

  it('suggests the values the reference schema lists for a string value', async () => {
    renderSchemaEditor(questionSchema('"questionOptions": { "rendering": "" }'));

    const completions = await getCompletionsAt(9, 49);

    expect(completions.map((completion) => completion.label)).toEqual(['number', 'radio', 'text']);
  });

  it('replaces the text typed so far in a string value with the chosen value', async () => {
    renderSchemaEditor(questionSchema('"questionOptions": { "rendering": "ra" }'));

    const completions = await getCompletionsAt(9, 51);
    expect(completions.map((completion) => completion.label)).toEqual(['radio']);
    await acceptFirstCompletion();

    expect(getView().state.doc.line(9).text.trim()).toBe('"questionOptions": { "rendering": "radio" }');
  });

  it('replaces the whole key when one is chosen with the cursor inside it', async () => {
    renderSchemaEditor('{\n  "nam": "Nutrition"\n}');

    const completions = await getCompletionsAt(2, 4);
    expect(completions.map((completion) => completion.label)).toEqual(['name']);
    await acceptFirstCompletion();

    expect(getView().state.doc.line(2).text).toBe('  "name": "Nutrition"');
  });

  it('quotes a key chosen where no quote has been typed', async () => {
    renderSchemaEditor('{\n  enc\n}');

    const completions = await getCompletionsAt(2, 5);
    expect(completions.map((completion) => completion.label)).toEqual(['encounter']);
    await acceptFirstCompletion();

    expect(getView().state.doc.line(2).text).toBe('  "encounter"');
  });

  it('suggests nothing where the reference schema has no keys or values', async () => {
    renderSchemaEditor('{\n  "name": ""\n}');

    expect(await getCompletionsAt(2, 11)).toEqual([]);
  });

  it('opens search with Mod-F', () => {
    renderSchemaEditor('{\n  "name": "Nutrition"\n}');

    fireEvent.keyDown(getContent(), { key: 'f', keyCode: 70, ...modifier });

    expect(screen.getByRole('textbox', { name: 'Find' })).toBeInTheDocument();
  });

  it('folds objects and arrays', () => {
    renderSchemaEditor('{\n  "pages": [\n    {\n      "label": "First"\n    }\n  ]\n}');
    const view = getView();

    act(() => {
      foldAll(view);
    });

    expect(foldedRanges(view.state).size).toBeGreaterThan(0);
  });

  it('draws indent guides on the lines inside objects and arrays', () => {
    renderSchemaEditor('{\n  "pages": [\n    {\n      "label": "First"\n    }\n  ]\n}');

    // The guides are line decorations, which have no role or text to query by.
    // eslint-disable-next-line testing-library/no-node-access
    const lines = Array.from(getView().contentDOM.querySelectorAll('.cm-line'), (line) => ({
      text: line.textContent.trim(),
      guided: line.classList.contains('cm-indent-markers'),
    }));

    expect(lines.filter(({ guided }) => guided).map(({ text }) => text)).toEqual([
      '"pages": [',
      '{',
      '"label": "First"',
      '}',
      ']',
    ]);
  });

  it('creates the editor once and keeps it across prop changes and edits', async () => {
    const user = userEvent.setup();
    const { rerender, props } = renderSchemaEditor('{}');
    const view = getView();

    await user.click(getContent());
    await user.keyboard('x');
    rerender(
      <>
        <SchemaEditor
          {...props}
          errors={[{ line: 1, message: 'Something is wrong' }]}
          stringifiedSchema='{"name": "Nutrition"}'
          validationOn
        />
        <button>After the editor</button>
      </>,
    );

    expect(getView()).toBe(view);
    expect(view.state.doc.toString()).toBe('{"name": "Nutrition"}');
  });
});
