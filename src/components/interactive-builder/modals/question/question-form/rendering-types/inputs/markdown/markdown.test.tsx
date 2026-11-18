import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarkdownQuestion from './markdown.component';
import { FormFieldProvider, useFormField } from '../../../../form-field-context';
import type { FormField } from '@openmrs/esm-form-engine-lib';

const formField: FormField = {
  type: 'control',
  questionOptions: { rendering: 'markdown' },
  id: 'markdownQuestion',
};

const SavedValue: React.FC = () => {
  const { formField } = useFormField();
  return <pre data-testid="saved-value">{JSON.stringify(formField.value)}</pre>;
};

describe('MarkdownQuestion', () => {
  it('shows the existing markdown in the editor', () => {
    renderMarkdownQuestion('## Heading');

    expect(screen.getByRole('textbox', { name: /markdown content/i })).toHaveValue('## Heading');
  });

  it('shows a value stored as an array of lines as separate paragraphs', () => {
    renderMarkdownQuestion(['## Heading', 'Some **bold** text']);

    expect(screen.getByRole('textbox', { name: /markdown content/i })).toHaveValue('## Heading\n\nSome **bold** text');
    expect(screen.getByTestId('saved-value')).toHaveTextContent(JSON.stringify(['## Heading', 'Some **bold** text']));
  });

  it('writes the typed markdown back to the question as a string', async () => {
    const user = userEvent.setup();
    renderMarkdownQuestion('');

    await user.type(screen.getByRole('textbox', { name: /markdown content/i }), 'Some **bold** text');

    expect(screen.getByTestId('saved-value')).toHaveTextContent(JSON.stringify('Some **bold** text'));
  });

  it('switches between the editor and the preview without losing the value', async () => {
    const user = userEvent.setup();
    renderMarkdownQuestion('Some **bold** text');

    await user.click(screen.getByRole('tab', { name: /preview/i }));

    expect(screen.queryByRole('textbox', { name: /markdown content/i })).not.toBeInTheDocument();
    expect(screen.getByText('Some **bold** text')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /write/i }));

    expect(screen.getByRole('textbox', { name: /markdown content/i })).toHaveValue('Some **bold** text');
    expect(screen.getByTestId('saved-value')).toHaveTextContent(JSON.stringify('Some **bold** text'));
  });

  it('tells the user when there is nothing to preview', async () => {
    const user = userEvent.setup();
    renderMarkdownQuestion('');

    await user.click(screen.getByRole('tab', { name: /preview/i }));

    expect(screen.getByText(/nothing to preview/i)).toBeInTheDocument();
  });
});

function renderMarkdownQuestion(value: string | Array<string>) {
  render(
    <FormFieldProvider initialFormField={{ ...formField, value }}>
      <MarkdownQuestion />
      <SavedValue />
    </FormFieldProvider>,
  );
}
