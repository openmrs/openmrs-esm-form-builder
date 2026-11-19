// Reads from and types into the schema editor, so the behaviour tests don't depend on which editor library it uses.
import { act, screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { undo } from '@codemirror/commands';
import { forEachDiagnostic } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';

function getView() {
  return EditorView.findFromDOM(screen.getByRole('textbox', { name: /schema editor/i }));
}

export function getEditorText() {
  return getView().state.doc.toString();
}

/** Replaces the whole text, the way pasting over a selection would. */
export function setEditorText(text: string) {
  const view = getView();
  act(() => view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text }, userEvent: 'input.paste' }));
}

/** Types `text` at `offset` characters into the document. */
export async function typeInEditor(user: UserEvent, offset: number, text: string) {
  const view = getView();
  await user.click(screen.getByRole('textbox', { name: /schema editor/i }));
  act(() => view.dispatch({ selection: { anchor: offset } }));
  await user.keyboard(text);
}

export function getCursorOffset() {
  return getView().state.selection.main.head;
}

export function undoInEditor() {
  const view = getView();
  act(() => {
    undo(view);
  });
}

/** The one-based lines the editor marks as having an error, once the linter has applied them. */
export async function getErrorMarkerLines() {
  // The linter applies its results in a promise callback.
  await act(() => Promise.resolve());
  const { state } = getView();
  const lines = new Set<number>();
  forEachDiagnostic(state, (diagnostic, from) => {
    if (diagnostic.severity === 'error') {
      lines.add(state.doc.lineAt(from).number);
    }
  });
  return [...lines].sort((a, b) => a - b);
}
