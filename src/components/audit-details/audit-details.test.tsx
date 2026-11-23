import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import AuditDetails from './audit-details.component';

const form = {
  uuid: '2ddde996-b1c3-37f1-a53e-378dd1a4f6b5',
  name: 'Test Form 1',
  description: 'A test form',
  version: '1.0',
  encounterType: {
    uuid: 'dd528487-82a5-4082-9c72-ed246bd49591',
    name: 'Consultation',
    display: 'Consultation',
  },
  published: false,
  retired: false,
  auditInfo: {
    creator: { display: 'admin' },
    dateCreated: '2026-10-06T10:00:00.000+0000',
    changedBy: null,
    dateChanged: null,
  },
};

describe('AuditDetails', () => {
  it('renders the encounter type uuid when the form has an encounter type', () => {
    render(<AuditDetails form={form} />);

    const encounterTypeRow = screen.getByRole('row', { name: /encounter type/i });
    expect(encounterTypeRow).toHaveTextContent('dd528487-82a5-4082-9c72-ed246bd49591');
    expect(within(encounterTypeRow).getByRole('button', { name: /copy to clipboard/i })).toBeInTheDocument();
  });

  it('renders a placeholder when the form has no encounter type', () => {
    render(<AuditDetails form={{ ...form, encounterType: null }} />);

    const encounterTypeRow = screen.getByRole('row', { name: /encounter type/i });
    expect(encounterTypeRow).toHaveTextContent(/none/i);
    expect(within(encounterTypeRow).queryByRole('button', { name: /copy to clipboard/i })).not.toBeInTheDocument();
  });

  it('renders an unknown editor when the form was changed without a recorded user', () => {
    render(
      <AuditDetails
        form={{ ...form, auditInfo: { ...form.auditInfo, dateChanged: '2026-10-06T11:00:00.000+0000' } }}
      />,
    );

    expect(screen.getByRole('row', { name: /last edited by/i })).toHaveTextContent(/unknown on/i);
  });
});
