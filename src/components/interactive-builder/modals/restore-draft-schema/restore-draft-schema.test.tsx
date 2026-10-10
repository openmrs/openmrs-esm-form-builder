import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RestoreDraftSchemaModal from './restore-draft-schema.modal';

describe('RestoreDraftSchemaModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('restores the draft saved under the given key', async () => {
    const user = userEvent.setup();
    const onSchemaChange = vi.fn();
    const closeModal = vi.fn();
    localStorage.setItem('formJSON:form-a', JSON.stringify({ name: 'Form A', pages: [] }));
    localStorage.setItem('formJSON:form-b', JSON.stringify({ name: 'Form B', pages: [] }));

    render(
      <RestoreDraftSchemaModal closeModal={closeModal} draftKey="formJSON:form-b" onSchemaChange={onSchemaChange} />,
    );

    await user.click(screen.getByRole('button', { name: /restore draft/i }));

    expect(onSchemaChange).toHaveBeenCalledWith({ name: 'Form B', pages: [] });
    expect(closeModal).toHaveBeenCalled();
  });

  it('does not change the schema when there is no draft under the key', async () => {
    const user = userEvent.setup();
    const onSchemaChange = vi.fn();

    render(<RestoreDraftSchemaModal closeModal={vi.fn()} draftKey="formJSON:form-c" onSchemaChange={onSchemaChange} />);

    await user.click(screen.getByRole('button', { name: /restore draft/i }));

    expect(onSchemaChange).not.toHaveBeenCalled();
  });
});
