import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkspaceLauncher from './workspace-launcher.component';
import { FormFieldProvider } from '../../../../form-field-context';
import type { FormField } from '@openmrs/esm-form-engine-lib';

const mockSetFormField = jest.fn();
const formField: FormField = {
  type: 'obs',
  questionOptions: {
    rendering: 'workspace-launcher' as const,
    buttonLabel: '',
    workspaceName: '',
  },
  id: '1',
};

jest.mock('../../../../form-field-context', () => ({
  ...jest.requireActual('../../../../form-field-context'),
  useFormField: () => ({ formField, setFormField: mockSetFormField }),
}));

describe('WorkspaceLauncher', () => {
  it('renders workspace launcher inputs', () => {
    renderWorkspaceLauncher();
    expect(screen.getByLabelText(/Button Label/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Workspace Name/i)).toBeInTheDocument();
  });

  it('displays placeholder text for both inputs', () => {
    renderWorkspaceLauncher();
    expect(screen.getByPlaceholderText(/Enter text to display on the button/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter the name of the workspace to launch/i)).toBeInTheDocument();
  });

  it('marks both inputs as required', () => {
    renderWorkspaceLauncher();
    const buttonLabelInput = screen.getByLabelText(/Button Label/i);
    const workspaceNameInput = screen.getByLabelText(/Workspace Name/i);

    expect(buttonLabelInput).toBeRequired();
    expect(workspaceNameInput).toBeRequired();
  });

  it('updates button label when input changes', async () => {
    renderWorkspaceLauncher();
    const user = userEvent.setup();
    const buttonLabelInput = screen.getByLabelText(/Button Label/i);
    const newValue = 'Launch Patient Dashboard';

    await user.clear(buttonLabelInput);
    await user.type(buttonLabelInput, newValue);

    expect(mockSetFormField).toHaveBeenCalled();
  });

  it('updates workspace name when input changes', async () => {
    renderWorkspaceLauncher();
    const user = userEvent.setup();
    const workspaceNameInput = screen.getByLabelText(/Workspace Name/i);
    const newValue = 'patient-dashboard';

    await user.clear(workspaceNameInput);
    await user.type(workspaceNameInput, newValue);

    expect(mockSetFormField).toHaveBeenCalled();
  });

  it('handles pasting text correctly', async () => {
    renderWorkspaceLauncher();
    const user = userEvent.setup();
    const workspaceNameInput = screen.getByLabelText(/Workspace Name/i);
    const textToPaste = 'pasted-workspace-name';

    await user.clear(workspaceNameInput);
    await user.paste(textToPaste);

    expect(mockSetFormField).toHaveBeenCalled();
  });
});

function renderWorkspaceLauncher() {
  render(
    <FormFieldProvider initialFormField={formField}>
      <WorkspaceLauncher />
    </FormFieldProvider>,
  );
}
