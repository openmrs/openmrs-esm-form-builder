// Covers the editing features that come from CodeMirror itself. The editor-agnostic behaviour is in
// schema-editor.test.tsx.
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { currentCompletions, startCompletion } from '@codemirror/autocomplete';
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
    name: { type: 'string' },
    encounter: { type: 'string' },
    pages: { type: 'array' },
  },
};

const modifier = /Mac/.test(navigator.platform) ? { metaKey: true } : { ctrlKey: true };

function getContent() {
  return screen.getByRole('textbox', { name: 'Schema editor' });
}

function getView() {
  return EditorView.findFromDOM(getContent());
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

  it('suggests properties from the reference schema', async () => {
    renderSchemaEditor('{\n  "enc\n}');
    const view = getView();
    act(() => view.dispatch({ selection: { anchor: view.state.doc.line(2).to } }));

    act(() => {
      startCompletion(view);
    });

    await waitFor(() =>
      expect(currentCompletions(view.state).map((completion) => completion.label)).toContain('encounter'),
    );
    expect(currentCompletions(view.state).find((completion) => completion.label === 'encounter')).toMatchObject({
      detail: 'string',
      info: 'Path: encounter',
    });
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
