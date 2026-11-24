import React, { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStandardFormSchema } from '@hooks/useStandardFormSchema';
import SchemaEditor from './schema-editor.component';
import {
  getCursorOffset,
  getEditorText,
  getErrorMarkerLines,
  setEditorText,
  typeInEditor,
  undoInEditor,
} from './schema-editor.test-helpers';

vi.mock('@hooks/useStandardFormSchema');

const mockUseStandardFormSchema = vi.mocked(useStandardFormSchema);

const referenceSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    encounter: { type: 'string' },
    pages: { type: 'array' },
    processor: { type: 'string' },
    version: { type: 'string' },
  },
};

const validSchema = JSON.stringify(
  { name: 'Nutrition', encounter: 'Consultation', pages: [], processor: 'EncounterFormProcessor', version: '1' },
  null,
  2,
);

// Breaks the reference schema on lines 2, 4 and 6.
const schemaWithErrors = JSON.stringify(
  { name: 42, encounter: 'Consultation', pages: 'none', processor: 'EncounterFormProcessor', version: 1 },
  null,
  2,
);

type SchemaErrors = React.ComponentProps<typeof SchemaEditor>['errors'];

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

// Wires the editor to real state the way the form editor does, including turning validation on from
// "Render changes", so edits and validation round-trip through props.
function StatefulSchemaEditor({ initialSchema, outsideSchema }: { initialSchema: string; outsideSchema?: string }) {
  const [stringifiedSchema, setStringifiedSchema] = useState(initialSchema);
  const [errors, setErrors] = useState<SchemaErrors>([]);
  const [validationOn, setValidationOn] = useState(false);

  return (
    <>
      <button onClick={() => setValidationOn(true)}>Render changes</button>
      {/* Replaces the schema without typing in the editor, the way an edit in the interactive builder does */}
      <button onClick={() => setStringifiedSchema(outsideSchema)}>Change outside the editor</button>
      <SchemaEditor
        errors={errors}
        onSchemaChange={setStringifiedSchema}
        setErrors={setErrors}
        setValidationOn={setValidationOn}
        stringifiedSchema={stringifiedSchema}
        validationOn={validationOn}
      />
      <output data-testid="schema">{stringifiedSchema}</output>
      {/* The form editor draws the red outline while this is above 0 */}
      <output data-testid="error-count">{errors.length}</output>
    </>
  );
}

function clickNextError() {
  fireEvent.click(screen.getByRole('button', { name: 'Next error' }));
}

describe('SchemaEditor', () => {
  beforeEach(() => {
    mockUseStandardFormSchema.mockReturnValue({
      schema: referenceSchema,
      schemaProperties: referenceSchema.properties,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the schema text into the editor unchanged and reports nothing until it is edited', () => {
    const { onSchemaChange } = renderSchemaEditor({ stringifiedSchema: validSchema });

    expect(getEditorText()).toBe(validSchema);
    expect(onSchemaChange).not.toHaveBeenCalled();
  });

  it('replaces the editor text when the schema prop changes without reporting it as an edit', () => {
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

    expect(getEditorText()).toBe('{"name": "New"}');
    expect(onSchemaChange).not.toHaveBeenCalled();
  });

  it('reports typed edits back through onSchemaChange and turns validation messages off', async () => {
    const user = userEvent.setup();
    const { onSchemaChange, setValidationOn } = renderSchemaEditor({ stringifiedSchema: '{}' });

    await typeInEditor(user, 1, '"x": 1');

    expect(getEditorText()).toBe('{"x": 1}');
    expect(onSchemaChange).toHaveBeenLastCalledWith('{"x": 1}');
    expect(setValidationOn).toHaveBeenCalledWith(false);
  });

  it('keeps newer edits when the parent passes back an older edit it has not caught up with', () => {
    const { rerender, onSchemaChange, setErrors, setValidationOn } = renderSchemaEditor({ stringifiedSchema: '{}' });
    const renderWith = (stringifiedSchema: string) =>
      rerender(
        <SchemaEditor
          errors={[]}
          onSchemaChange={onSchemaChange}
          setErrors={setErrors}
          setValidationOn={setValidationOn}
          stringifiedSchema={stringifiedSchema}
          validationOn={false}
        />,
      );

    // Two edits arrive before the parent re-renders, then it passes them back one at a time
    setEditorText('{"name": "N"}');
    setEditorText('{"name": "Nu"}');
    renderWith('{"name": "N"}');

    expect(getEditorText()).toBe('{"name": "Nu"}');

    renderWith('{"name": "Nu"}');

    expect(getEditorText()).toBe('{"name": "Nu"}');
    expect(onSchemaChange).toHaveBeenCalledTimes(2);
  });

  it('changes only the edited line when a value is typed mid-document', async () => {
    const user = userEvent.setup();
    render(<StatefulSchemaEditor initialSchema={validSchema} />);

    await typeInEditor(user, validSchema.indexOf('"1"') + 2, '2');

    const before = validSchema.split('\n');
    const after = screen.getByTestId('schema').textContent.split('\n');
    expect(after).toHaveLength(before.length);
    expect(after.filter((line, index) => line !== before[index])).toEqual(['  "version": "12"']);
  });

  it('keeps the cursor and undo history when the parent stores an edit and passes it back down', async () => {
    const user = userEvent.setup();
    render(<StatefulSchemaEditor initialSchema={validSchema} />);
    const offset = validSchema.indexOf('Nutrition') + 'Nutrition'.length;

    await typeInEditor(user, offset, ' Clinic');

    expect(screen.getByTestId('schema')).toHaveTextContent('"name": "Nutrition Clinic"');
    expect(getCursorOffset()).toBe(offset + ' Clinic'.length);

    undoInEditor();

    expect(getEditorText()).toBe(validSchema);
    expect(screen.getByTestId('schema')).toHaveTextContent(validSchema, { normalizeWhitespace: false });
  });

  it('keeps the cursor on the same line and column when the schema is changed outside the editor', async () => {
    const user = userEvent.setup();
    // The outside change makes line 2 longer, so the cursor's character offset moves but its line and column don't
    const outsideSchema = validSchema.replace('"Nutrition"', '"Nutrition and growth"');
    render(<StatefulSchemaEditor initialSchema={validSchema} outsideSchema={outsideSchema} />);
    const versionLine = validSchema.split('\n').findIndex((line) => line.includes('"version"'));
    const column = validSchema.split('\n')[versionLine].indexOf('"version"');
    await typeInEditor(user, validSchema.indexOf('"version"'), ' ');

    fireEvent.click(screen.getByRole('button', { name: 'Change outside the editor' }));

    const outsideLines = outsideSchema.split('\n');
    const lineStart = outsideLines.slice(0, versionLine).join('\n').length + 1;
    expect(getEditorText()).toBe(outsideSchema);
    expect(getCursorOffset()).toBe(lineStart + column + 1);
  });

  it('validates edits after a debounce and marks each error on its line', async () => {
    vi.useFakeTimers();
    render(<StatefulSchemaEditor initialSchema="{}" />);

    setEditorText(schemaWithErrors);
    expect(await getErrorMarkerLines()).toEqual([]);

    act(() => vi.advanceTimersByTime(300));

    expect(await getErrorMarkerLines()).toEqual([2, 4, 6]);
  });

  it('shows each validation error with the line it is marked on once validation is turned on', async () => {
    vi.useFakeTimers();
    render(<StatefulSchemaEditor initialSchema="{}" />);
    setEditorText(schemaWithErrors);
    act(() => vi.advanceTimersByTime(300));

    expect(screen.queryByText(/error on line/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Render changes' }));

    const markedLines = await getErrorMarkerLines();
    const shown = [];
    for (let index = 0; index < markedLines.length; index++) {
      expect(screen.getByText(`${index + 1}/3`)).toBeInTheDocument();
      shown.push(screen.getByText(/error on line/i).textContent);
      clickNextError();
    }

    expect(markedLines).toEqual([2, 4, 6]);
    expect(shown.join('|')).toMatch(/line 2.*\|.*line 4.*\|.*line 6/i);
    expect(screen.getByText('Version must be string')).toBeInTheDocument();
  });

  it('marks an error on the property it is about, not on an earlier line that mentions its name', async () => {
    vi.useFakeTimers();
    render(<StatefulSchemaEditor initialSchema="{}" />);
    const schema = JSON.stringify(
      {
        name: 'Nutrition',
        encounter: 'Bump the version before publishing',
        pages: [],
        processor: 'EncounterFormProcessor',
        version: 2,
      },
      null,
      2,
    );

    setEditorText(schema);
    act(() => vi.advanceTimersByTime(300));
    fireEvent.click(screen.getByRole('button', { name: 'Render changes' }));

    expect(await getErrorMarkerLines()).toEqual([6]);
    expect(screen.getByText(/error on line 6/i)).toBeInTheDocument();
  });

  it('drops the schema errors while the JSON does not parse', async () => {
    vi.useFakeTimers();
    render(<StatefulSchemaEditor initialSchema="{}" />);
    setEditorText(schemaWithErrors);
    act(() => vi.advanceTimersByTime(300));
    fireEvent.click(screen.getByRole('button', { name: 'Render changes' }));
    expect(await getErrorMarkerLines()).toEqual([2, 4, 6]);

    expect(screen.getByTestId('error-count')).toHaveTextContent('3');

    setEditorText(schemaWithErrors.replace('"pages"', '"pages'));
    act(() => vi.advanceTimersByTime(300));

    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
  });

  it('re-checks the errors when the schema is changed outside the editor', async () => {
    vi.useFakeTimers();
    render(<StatefulSchemaEditor initialSchema="{}" outsideSchema={validSchema} />);
    setEditorText(schemaWithErrors);
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByTestId('error-count')).toHaveTextContent('3');

    fireEvent.click(screen.getByRole('button', { name: 'Change outside the editor' }));
    act(() => vi.advanceTimersByTime(300));

    expect(getEditorText()).toBe(validSchema);
    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
    expect(await getErrorMarkerLines()).toEqual([]);
  });

  it('starts the error list over when a change outside the editor leaves fewer errors', async () => {
    vi.useFakeTimers();
    const schemaWithTwoErrors = JSON.stringify(
      { name: 42, encounter: 'Consultation', pages: 'none', processor: 'EncounterFormProcessor', version: '1' },
      null,
      2,
    );
    render(<StatefulSchemaEditor initialSchema="{}" outsideSchema={schemaWithTwoErrors} />);
    setEditorText(schemaWithErrors);
    act(() => vi.advanceTimersByTime(300));
    fireEvent.click(screen.getByRole('button', { name: 'Render changes' }));
    clickNextError();
    clickNextError();
    expect(screen.getByText('3/3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Change outside the editor' }));
    act(() => vi.advanceTimersByTime(300));

    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByText(/error on line 2/i)).toBeInTheDocument();
  });

  it('does not check a schema changed outside the editor while no errors are showing', () => {
    vi.useFakeTimers();
    render(<StatefulSchemaEditor initialSchema={validSchema} outsideSchema={schemaWithErrors} />);

    fireEvent.click(screen.getByRole('button', { name: 'Change outside the editor' }));
    act(() => vi.advanceTimersByTime(300));

    expect(getEditorText()).toBe(schemaWithErrors);
    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
  });

  it('clears the error marks and messages once an edit fixes the schema', async () => {
    vi.useFakeTimers();
    render(<StatefulSchemaEditor initialSchema="{}" />);
    setEditorText(schemaWithErrors);
    act(() => vi.advanceTimersByTime(300));
    fireEvent.click(screen.getByRole('button', { name: 'Render changes' }));

    setEditorText(validSchema);
    act(() => vi.advanceTimersByTime(300));
    fireEvent.click(screen.getByRole('button', { name: 'Render changes' }));

    expect(await getErrorMarkerLines()).toEqual([]);
    expect(screen.queryByText(/error on line/i)).not.toBeInTheDocument();
  });

  it('moves the cursor to the error the notification shows', async () => {
    vi.useFakeTimers();
    render(<StatefulSchemaEditor initialSchema="{}" />);
    setEditorText(schemaWithErrors);
    act(() => vi.advanceTimersByTime(300));
    fireEvent.click(screen.getByRole('button', { name: 'Render changes' }));
    await getErrorMarkerLines();
    const lineStart = (line: number) =>
      schemaWithErrors
        .split('\n')
        .slice(0, line - 1)
        .join('\n').length + 1;

    fireEvent.click(screen.getByRole('button', { name: 'Next error' }));
    expect(getCursorOffset()).toBe(lineStart(4));

    fireEvent.click(screen.getByRole('button', { name: 'Next error' }));
    expect(getCursorOffset()).toBe(lineStart(6));

    fireEvent.click(screen.getByRole('button', { name: 'Previous error' }));
    expect(getCursorOffset()).toBe(lineStart(4));
    expect(screen.getByText('2/3')).toBeInTheDocument();
  });

  it('moves the cursor to the error and focuses the editor when the line is clicked', async () => {
    vi.useFakeTimers();
    render(<StatefulSchemaEditor initialSchema="{}" />);
    setEditorText(schemaWithErrors);
    act(() => vi.advanceTimersByTime(300));
    fireEvent.click(screen.getByRole('button', { name: 'Render changes' }));
    await getErrorMarkerLines();

    fireEvent.click(screen.getByRole('button', { name: /error on line 2/i }));

    expect(getCursorOffset()).toBe(schemaWithErrors.indexOf('\n') + 1);
    expect(screen.getByRole('textbox', { name: /schema editor/i })).toHaveFocus();
  });

  it('disables the previous and next error buttons at the first and last error', async () => {
    vi.useFakeTimers();
    render(<StatefulSchemaEditor initialSchema="{}" />);
    setEditorText(schemaWithErrors);
    act(() => vi.advanceTimersByTime(300));
    fireEvent.click(screen.getByRole('button', { name: 'Render changes' }));
    await getErrorMarkerLines();

    expect(screen.getByRole('button', { name: 'Previous error' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next error' })).toBeEnabled();

    clickNextError();
    clickNextError();

    expect(screen.getByRole('button', { name: 'Previous error' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next error' })).toBeDisabled();
  });

  it('tabs from the notification straight to the error buttons', async () => {
    vi.useFakeTimers();
    render(<StatefulSchemaEditor initialSchema="{}" />);
    setEditorText(schemaWithErrors);
    act(() => vi.advanceTimersByTime(300));
    fireEvent.click(screen.getByRole('button', { name: 'Render changes' }));
    await getErrorMarkerLines();
    vi.useRealTimers();
    const user = userEvent.setup();

    act(() => screen.getByRole('button', { name: /close/i }).focus());
    await user.tab();

    expect(screen.getByRole('button', { name: 'Next error' })).toHaveFocus();
  });

  it('moves focus to the other error button when one reaches the first or last error', async () => {
    vi.useFakeTimers();
    render(<StatefulSchemaEditor initialSchema="{}" />);
    setEditorText(schemaWithErrors);
    act(() => vi.advanceTimersByTime(300));
    fireEvent.click(screen.getByRole('button', { name: 'Render changes' }));
    await getErrorMarkerLines();

    clickNextError();
    clickNextError();
    expect(screen.getByRole('button', { name: 'Previous error' })).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'Previous error' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous error' }));
    expect(screen.getByRole('button', { name: 'Next error' })).toHaveFocus();
  });
});
