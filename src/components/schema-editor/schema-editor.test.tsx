import React, { useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { edit, type Ace } from 'ace-builds';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-textmate';
import { useStandardFormSchema } from '@hooks/useStandardFormSchema';
import SchemaEditor from './schema-editor.component';

// The webpack resolver registers Ace module URLs through file-loader, which only exists in the webpack/rspack
// build. The JSON mode and textmate theme it would load lazily are imported above instead.
vi.mock('ace-builds/webpack-resolver', () => ({}));
vi.mock('@hooks/useStandardFormSchema');

const mockUseStandardFormSchema = vi.mocked(useStandardFormSchema);

const referenceSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    pages: { type: 'array' },
  },
};

type Marker = React.ComponentProps<typeof SchemaEditor>['errors'][number];

// Returns the editor react-ace already attached to the element rather than creating a new one.
function getEditor(): Ace.Editor {
  return edit('schemaEditor');
}

function getErrorMarkers(editor: Ace.Editor) {
  return Object.values(editor.getSession().getMarkers(false)).filter((marker) => marker.clazz === 'error');
}

function renderSchemaEditor(props: Partial<React.ComponentProps<typeof SchemaEditor>> = {}) {
  const onSchemaChange = vi.fn();
  const setErrors = vi.fn();
  const setValidationOn = vi.fn();

  const utils = render(
    <SchemaEditor
      errors={[]}
      onSchemaChange={onSchemaChange}
      setErrors={setErrors}
      setValidationOn={setValidationOn}
      stringifiedSchema=""
      validationOn={false}
      {...props}
    />,
  );

  return { ...utils, onSchemaChange, setErrors, setValidationOn };
}

// Wires the editor to real state, the way the form editor does, so edits and validation round-trip through props.
function StatefulSchemaEditor({
  initialSchema,
  validationOn = false,
}: {
  initialSchema: string;
  validationOn?: boolean;
}) {
  const [stringifiedSchema, setStringifiedSchema] = useState(initialSchema);
  const [errors, setErrors] = useState<Array<Marker>>([]);

  return (
    <>
      <SchemaEditor
        errors={errors}
        onSchemaChange={setStringifiedSchema}
        setErrors={setErrors}
        setValidationOn={() => {}}
        stringifiedSchema={stringifiedSchema}
        validationOn={validationOn}
      />
      <output data-testid="schema">{stringifiedSchema}</output>
    </>
  );
}

describe('SchemaEditor', () => {
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

  it('loads the schema into an Ace JSON editor', () => {
    const schema = JSON.stringify({ name: 'Nutrition', pages: [] }, null, 2);
    renderSchemaEditor({ stringifiedSchema: schema });

    const editor = getEditor();
    expect(editor.getValue()).toBe(schema);
    expect(editor.getOption('mode')).toBe('ace/mode/json');
    expect(editor.getOption('tabSize')).toBe(2);
    expect(editor.getOption('enableBasicAutocompletion')).toBe(true);
    expect(editor.getOption('enableLiveAutocompletion')).toBe(true);
  });

  it('replaces the editor content when the schema prop changes without reporting it as an edit', () => {
    const { rerender, onSchemaChange, setErrors, setValidationOn } = renderSchemaEditor({
      stringifiedSchema: '{"name": "Old"}',
    });

    rerender(
      <SchemaEditor
        errors={[]}
        onSchemaChange={onSchemaChange}
        setErrors={setErrors}
        setValidationOn={setValidationOn}
        stringifiedSchema='{"name": "New"}'
        validationOn={false}
      />,
    );

    expect(getEditor().getValue()).toBe('{"name": "New"}');
    expect(onSchemaChange).not.toHaveBeenCalled();
  });

  it('reports typed edits back through onSchemaChange', async () => {
    const user = userEvent.setup();
    const { onSchemaChange, setValidationOn } = renderSchemaEditor({ stringifiedSchema: '{}' });

    const editor = getEditor();
    editor.navigateFileEnd();
    editor.navigateLeft();
    editor.focus();
    await user.keyboard('"x": 1');

    expect(editor.getValue()).toBe('{"x": 1}');
    expect(onSchemaChange).toHaveBeenLastCalledWith('{"x": 1}');
    expect(setValidationOn).toHaveBeenCalledWith(false);
  });

  it('keeps edits in the editor when the parent stores them and passes them back down', () => {
    render(<StatefulSchemaEditor initialSchema={'{"name": "Nutrition"}'} />);

    act(() => getEditor().setValue('{"name": "Vitals"}', 1));

    expect(screen.getByTestId('schema')).toHaveTextContent('{"name": "Vitals"}');
    expect(getEditor().getValue()).toBe('{"name": "Vitals"}');
  });

  it('validates edits against the reference schema after a debounce and reports error markers', () => {
    vi.useFakeTimers();
    const { setErrors } = renderSchemaEditor({ stringifiedSchema: '{}' });

    act(() => getEditor().setValue('{\n  "name": 42\n}', 1));
    expect(setErrors).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(300));

    expect(setErrors).toHaveBeenLastCalledWith([
      {
        startRow: 1,
        startCol: 0,
        endRow: 1,
        endCol: 1,
        className: 'error',
        text: 'Name must be string',
        type: 'text',
      },
    ]);
  });

  it('clears errors when an edit makes the schema valid', () => {
    vi.useFakeTimers();
    const { setErrors } = renderSchemaEditor({ stringifiedSchema: '{}' });

    act(() => getEditor().setValue('{\n  "name": "Nutrition"\n}', 1));
    act(() => vi.advanceTimersByTime(300));

    expect(setErrors).toHaveBeenLastCalledWith([]);
  });

  it('draws error markers in the editor and removes them once the errors clear', () => {
    vi.useFakeTimers();
    render(<StatefulSchemaEditor initialSchema="{}" />);

    act(() => getEditor().setValue('{\n  "name": 42\n}', 1));
    act(() => vi.advanceTimersByTime(300));

    const markers = getErrorMarkers(getEditor());
    expect(markers).toHaveLength(1);
    expect(markers[0].range.start.row).toBe(1);
    expect(markers[0].type).toBe('text');

    act(() => getEditor().setValue('{\n  "name": "Nutrition"\n}', 1));
    act(() => vi.advanceTimersByTime(300));

    expect(getErrorMarkers(getEditor())).toHaveLength(0);
  });

  it('shows the current validation error with its line number when validation is on', () => {
    const errors: Array<Marker> = [
      { startRow: 1, startCol: 0, endRow: 1, endCol: 1, className: 'error', text: 'Name must be string', type: 'text' },
      { startRow: 3, startCol: 0, endRow: 3, endCol: 1, className: 'error', text: 'Pages must be array', type: 'text' },
    ];
    renderSchemaEditor({ stringifiedSchema: '{}', errors, validationOn: true });

    expect(screen.getByText(/error on line 2/i)).toBeInTheDocument();
    expect(screen.getByText('Name must be string')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(getErrorMarkers(getEditor())).toHaveLength(2);
  });

  it('hides the validation errors when validation is off', () => {
    const errors: Array<Marker> = [
      { startRow: 1, startCol: 0, endRow: 1, endCol: 1, className: 'error', text: 'Name must be string', type: 'text' },
    ];
    renderSchemaEditor({ stringifiedSchema: '{}', errors, validationOn: false });

    expect(screen.queryByText(/error on line/i)).not.toBeInTheDocument();
    expect(getErrorMarkers(getEditor())).toHaveLength(1);
  });
});
