import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('updates button label when input changes', () => {
    renderWorkspaceLauncher();
    const buttonLabelInput = screen.getByLabelText(/Button Label/i);
    const newValue = 'Launch Patient Dashboard';

    fireEvent.change(buttonLabelInput, { target: { value: newValue } });

    expect(mockSetFormField).toHaveBeenCalledWith({
      ...formField,
      questionOptions: {
        ...formField.questionOptions,
        buttonLabel: newValue,
      },
    });
  });

  it('updates workspace name when input changes', () => {
    renderWorkspaceLauncher();
    const workspaceNameInput = screen.getByLabelText(/Workspace Name/i);
    const newValue = 'patient-dashboard';

    fireEvent.change(workspaceNameInput, { target: { value: newValue } });

    expect(mockSetFormField).toHaveBeenCalledWith({
      ...formField,
      questionOptions: {
        ...formField.questionOptions,
        workspaceName: newValue,
      },
    });
  });

  it('handles pasting text correctly', () => {
    renderWorkspaceLauncher();
    const workspaceNameInput = screen.getByLabelText(/Workspace Name/i);
    const textToPaste = 'pasted-workspace-name';

    fireEvent.change(workspaceNameInput, { target: { value: textToPaste } });

    expect(mockSetFormField).toHaveBeenCalledWith({
      ...formField,
      questionOptions: {
        ...formField.questionOptions,
        workspaceName: textToPaste,
      },
    });
  });
});

function renderWorkspaceLauncher() {
  render(
    <FormFieldProvider initialFormField={formField}>
      <WorkspaceLauncher />
    </FormFieldProvider>,
  );
}
