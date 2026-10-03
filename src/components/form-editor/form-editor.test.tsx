import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useConfig } from '@openmrs/esm-framework';
import { handleFormValidation } from '@resources/form-validator.resource';
import type { Schema } from '@types';
import FormEditor from './form-editor.component';

type ActionButtonsProps = {
  schema: Schema | undefined;
  hasUnsavedChanges: boolean;
  onFormValidation: () => Promise<void>;
};
type SchemaEditorProps = { stringifiedSchema: string; onSchemaChange: (schema: string) => void };

const state = vi.hoisted(() => ({
  clobdata: undefined as Schema | undefined,
  actionButtons: null as ActionButtonsProps | null,
  schemaEditor: null as SchemaEditorProps | null,
}));

vi.mock('@resources/form-validator.resource', () => ({ handleFormValidation: vi.fn() }));
vi.mock('react-router-dom', () => ({ useParams: () => ({ formUuid: 'form-a' }) }));
vi.mock('@hooks/useForm', () => ({
  useForm: () => ({
    form: { uuid: 'form-a', name: 'Form A', published: false },
    isLoadingForm: false,
    mutate: vi.fn(),
  }),
}));
vi.mock('@hooks/useClobdata', () => ({
  useClobdata: () => ({ clobdata: state.clobdata, isLoadingClobdata: false }),
}));
vi.mock('@hooks/getLanguageOptionsFromSession', () => ({
  useLanguageOptions: () => [{ code: 'en', label: 'English' }],
}));
vi.mock('../action-buttons/action-buttons.component', () => ({
  default: (props: ActionButtonsProps) => {
    state.actionButtons = props;
    return null;
  },
}));
vi.mock('../schema-editor/schema-editor.component', () => ({
  default: (props: SchemaEditorProps) => {
    state.schemaEditor = props;
    return null;
  },
}));
vi.mock('../interactive-builder/interactive-builder.component', () => ({ default: () => null }));
vi.mock('../form-renderer/form-renderer.component', () => ({ default: () => null }));
vi.mock('../translation-builder/translation-builder.component', () => ({ default: () => null }));
vi.mock('../audit-details/audit-details.component', () => ({ default: () => null }));
vi.mock('../header/header.component', () => ({ default: () => null }));

const savedSchema = { name: 'Form A', pages: [{ label: 'Original', sections: [] }] } as unknown as Schema;

describe('FormEditor', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    state.clobdata = savedSchema;
    state.actionButtons = null;
    state.schemaEditor = null;
    vi.mocked(useConfig).mockReturnValue({ blockRenderingWithErrors: false, dataTypeToRenderingMap: {} });
  });

  it('hands the action buttons the schema as it reads in the editor, rendered or not', async () => {
    render(<FormEditor />);
    await waitFor(() => expect(state.actionButtons?.schema?.pages[0].label).toBe('Original'));
    expect(state.actionButtons.hasUnsavedChanges).toBe(false);

    const edited = { ...savedSchema, pages: [{ label: 'Edited in the JSON editor', sections: [] }] };
    act(() => state.schemaEditor.onSchemaChange(JSON.stringify(edited, null, 2)));

    await waitFor(() => expect(state.actionButtons.schema?.pages[0].label).toBe('Edited in the JSON editor'));
    expect(state.actionButtons.hasUnsavedChanges).toBe(true);
  });

  it('withholds the schema and shows the parse error while the editor text is not valid JSON', async () => {
    render(<FormEditor />);
    await waitFor(() => expect(state.actionButtons?.schema).toBeDefined());

    act(() => state.schemaEditor.onSchemaChange('{ "name": "Form A", '));

    await waitFor(() => expect(state.actionButtons.schema).toBeUndefined());
    expect(screen.getByText(/not valid JSON/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /render changes/i })).toBeDisabled();

    act(() => state.schemaEditor.onSchemaChange(JSON.stringify(savedSchema, null, 2)));

    await waitFor(() => expect(state.actionButtons.schema).toBeDefined());
    expect(screen.queryByText(/not valid JSON/i)).not.toBeInTheDocument();
  });
  it('validates the schema as it reads in the editor, not the last rendered one', async () => {
    vi.mocked(handleFormValidation).mockResolvedValue([[], []]);
    render(<FormEditor />);
    await waitFor(() => expect(state.actionButtons?.schema).toBeDefined());

    const edited = { ...savedSchema, pages: [{ label: 'Edited in the JSON editor', sections: [] }] };
    act(() => state.schemaEditor.onSchemaChange(JSON.stringify(edited, null, 2)));
    await waitFor(() => expect(state.actionButtons.schema?.pages[0].label).toBe('Edited in the JSON editor'));

    await act(() => state.actionButtons.onFormValidation());

    expect(handleFormValidation).toHaveBeenCalledWith(
      expect.objectContaining({ pages: [{ label: 'Edited in the JSON editor', sections: [] }] }),
      expect.anything(),
      expect.anything(),
    );
  });
});
