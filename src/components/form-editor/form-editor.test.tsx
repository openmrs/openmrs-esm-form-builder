import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { showModal, useConfig } from '@openmrs/esm-framework';
import type { Schema } from '@types';
import FormEditor from './form-editor.component';

type BuilderProps = { schema: Schema; onSchemaChange: (schema: Schema) => void };

const state = vi.hoisted(() => ({
  formUuid: 'form-a',
  form: null as { uuid: string; name: string; published: boolean } | null,
  clobdata: undefined as Schema | undefined,
  builder: null as BuilderProps | null,
}));

vi.mock('react-router-dom', () => ({ useParams: () => ({ formUuid: state.formUuid }) }));
vi.mock('@hooks/useForm', () => ({ useForm: () => ({ form: state.form, isLoadingForm: false, mutate: vi.fn() }) }));
vi.mock('@hooks/useClobdata', () => ({
  useClobdata: () => ({ clobdata: state.clobdata, isLoadingClobdata: false }),
}));
vi.mock('@hooks/getLanguageOptionsFromSession', () => ({
  useLanguageOptions: () => [{ code: 'en', label: 'English' }],
}));
vi.mock('../interactive-builder/interactive-builder.component', () => ({
  default: (props: BuilderProps) => {
    state.builder = props;
    return null;
  },
}));
vi.mock('../schema-editor/schema-editor.component', () => ({ default: () => null }));
vi.mock('../form-renderer/form-renderer.component', () => ({ default: () => null }));
vi.mock('../translation-builder/translation-builder.component', () => ({ default: () => null }));
vi.mock('../audit-details/audit-details.component', () => ({ default: () => null }));
vi.mock('../action-buttons/action-buttons.component', () => ({ default: () => null }));
vi.mock('../header/header.component', () => ({ default: () => null }));

const mockShowModal = vi.mocked(showModal);

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
    localStorage.clear();
    state.formUuid = 'form-a';
    state.form = { uuid: 'form-a', name: 'Form A', published: true };
    state.clobdata = undefined;
    state.builder = null;
    vi.mocked(useConfig).mockReturnValue({ blockRenderingWithErrors: false, dataTypeToRenderingMap: {} });
  });

  it('keeps edits in progress when only the form metadata changes', async () => {
    state.clobdata = { name: 'Form A', pages: [{ label: 'Original', sections: [] }] } as unknown as Schema;
    const view = render(<FormEditor />);
    await waitFor(() => expect(state.builder?.schema?.pages[0].label).toBe('Original'));

    act(() => {
      state.builder.onSchemaChange({
        ...state.builder.schema,
        pages: [{ ...state.builder.schema.pages[0], label: 'Edited' }],
      });
    });
    await waitFor(() => expect(state.builder.schema.pages[0].label).toBe('Edited'));

    state.form = { ...state.form, published: false };
    view.rerender(<FormEditor />);

    await waitFor(() => expect(state.builder.schema.pages[0].label).toBe('Edited'));
    expect(state.clobdata.pages[0].label).toBe('Original');
  });

  it('offers each form its own draft when moving between edit routes', async () => {
    localStorage.setItem('formJSON:form-a', JSON.stringify({ name: 'Draft A', pages: [] }));
    localStorage.setItem('formJSON:form-b', JSON.stringify({ name: 'Draft B', pages: [] }));

    const view = render(<FormEditor />);
    await waitFor(() => expect(mockShowModal).toHaveBeenCalledTimes(1));
    expect(mockShowModal).toHaveBeenLastCalledWith(
      'restore-draft-schema-modal',
      expect.objectContaining({ draftKey: 'formJSON:form-a' }),
    );

    state.formUuid = 'form-b';
    state.form = { uuid: 'form-b', name: 'Form B', published: false };
    view.rerender(<FormEditor />);

    await waitFor(() => expect(mockShowModal).toHaveBeenCalledTimes(2));
    expect(mockShowModal).toHaveBeenLastCalledWith(
      'restore-draft-schema-modal',
      expect.objectContaining({ draftKey: 'formJSON:form-b' }),
    );
  });

  it('does not offer a draft for a form that has none', async () => {
    localStorage.setItem('formJSON:form-b', JSON.stringify({ name: 'Draft B', pages: [] }));

    render(<FormEditor />);

    await waitFor(() => expect(state.builder).not.toBeNull());
    expect(mockShowModal).not.toHaveBeenCalled();
  });
  it('offers a draft saved under the old shared key when it belongs to this form', async () => {
    localStorage.setItem('formJSON', JSON.stringify({ name: 'Old draft', uuid: 'form-a', pages: [] }));

    render(<FormEditor />);

    await waitFor(() => expect(mockShowModal).toHaveBeenCalledTimes(1));
    expect(localStorage.getItem('formJSON:form-a')).toContain('Old draft');
    expect(localStorage.getItem('formJSON')).toBeNull();
  });

  it('ignores a draft under the old shared key that belongs to another form', async () => {
    localStorage.setItem('formJSON', JSON.stringify({ name: 'Other draft', uuid: 'form-z', pages: [] }));

    render(<FormEditor />);

    await waitFor(() => expect(state.builder).not.toBeNull());
    expect(mockShowModal).not.toHaveBeenCalled();
    expect(localStorage.getItem('formJSON')).toContain('Other draft');
  });
});
