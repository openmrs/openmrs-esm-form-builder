import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import ProgramStateTypeQuestion from './program-state-type-question.component';
import { FormFieldProvider } from '../../../../form-field-context';
import { usePrograms, useProgramWorkStates } from '@hooks/useProgramStates';
import type { FormField, ProgramState } from '@openmrs/esm-form-engine-lib';
import type { Program } from '@types';

const mockSetFormField = jest.fn();
const formField: FormField = {
  id: '1',
  type: 'programState',
  questionOptions: {
    rendering: 'text',
  },
};

jest.mock('../../../../form-field-context', () => ({
  ...jest.requireActual('../../../../form-field-context'),
  useFormField: () => ({ formField, setFormField: mockSetFormField }),
}));

const mockUsePrograms = jest.mocked(usePrograms);
const mockUseProgramWorkflowStates = jest.mocked(useProgramWorkStates);
jest.mock('@hooks/useProgramStates', () => ({
  ...jest.requireActual('@hooks/useProgramStates'),
  usePrograms: jest.fn(),
  useProgramWorkStates: jest.fn(),
}));

const programOneWorkflowOneStates: Array<ProgramState> = [
  {
    uuid: '1111',
    concept: { display: 'Program 1 State 1', uuid: '1111' },
    programWorkflow: { display: 'Program 1 Workflow 1', uuid: '111' },
  },
  {
    uuid: '1112',
    concept: { display: 'Program 1 State 2', uuid: '1112' },
    programWorkflow: { display: 'Program 1 Workflow 1', uuid: '111' },
  },
];

const programs: Array<Program> = [
  {
    uuid: '1',
    name: 'Program 1',
    allWorkflows: [
      {
        uuid: '11',
        concept: { display: 'Program 1 Workflow 1', uuid: '111' },
        states: programOneWorkflowOneStates,
      },
      {
        uuid: '12',
        concept: { display: 'Program 1 Workflow 2', uuid: '112' },
        states: [],
      },
    ],
  },
  {
    uuid: '2',
    name: 'Program 2',
    allWorkflows: [
      {
        uuid: '21',
        concept: { display: 'Program 2 Workflow 1', uuid: '211' },
        states: [],
      },
    ],
  },
];

describe('ProgramStateTypeQuestion', () => {
  it('renders without crashing', async () => {
    mockUsePrograms.mockReturnValue({ programs: programs, programsLookupError: null, isLoadingPrograms: false });
    mockUseProgramWorkflowStates.mockReturnValue({
      programStates: [],
      programStatesLookupError: null,
      isLoadingProgramStates: null,
      mutateProgramStates: jest.fn(),
    });
    renderComponent();

    expect(screen.getByRole('combobox', { name: /^program$/i })).toBeInTheDocument();
  });

  it('displays spinner when programs are loading', () => {
    mockUsePrograms.mockReturnValue({ programs: [], programsLookupError: null, isLoadingPrograms: true });
    mockUseProgramWorkflowStates.mockReturnValue({
      programStates: [],
      programStatesLookupError: null,
      isLoadingProgramStates: null,
      mutateProgramStates: jest.fn(),
    });
    renderComponent();

    expect(screen.queryByRole('combobox', { name: /^program$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /^program workflow$/i })).not.toBeInTheDocument();
  });

  it('lets user select a program and displays the workflows based on selected program, and states based on selected workflow', async () => {
    mockUsePrograms.mockReturnValue({ programs: programs, programsLookupError: null, isLoadingPrograms: false });
    mockUseProgramWorkflowStates.mockReturnValue({
      programStates: programOneWorkflowOneStates,
      programStatesLookupError: null,
      isLoadingProgramStates: null,
      mutateProgramStates: jest.fn(),
    });
    const user = userEvent.setup();
    renderComponent();

    expect(screen.getByRole('combobox', { name: /^program$/i })).toBeInTheDocument();
    const selectProgramsButton = screen.getByRole('button', {
      name: /open/i,
    });
    expect(selectProgramsButton).toBeInTheDocument();
    await user.click(selectProgramsButton);

    const programOneSelectOption = screen.getByRole('option', {
      name: /program 1/i,
    });
    expect(programOneSelectOption).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: /program 2/i,
      }),
    ).toBeInTheDocument();

    await user.click(programOneSelectOption);
    expect(screen.getByRole('combobox', { name: /^program$/i })).toHaveDisplayValue(/program 1/i);

    const programWorkflowInput = screen.getByRole('combobox', {
      name: /program workflow/i,
    });
    expect(programWorkflowInput).toBeInTheDocument();

    const menuButtons = screen.getAllByRole('button', { name: /open/i });
    expect(menuButtons).toHaveLength(2);

    const programWorkflowMenuButton = menuButtons[1];
    expect(programWorkflowMenuButton).toHaveRole('button');
    await user.click(programWorkflowMenuButton);

    const programWorkflowSelectionOption = screen.getByRole('option', { name: /program 1 workflow 1/i });
    expect(programWorkflowSelectionOption).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /program 1 workflow 2/i })).toBeInTheDocument();

    await user.click(programWorkflowSelectionOption);
    expect(screen.getByRole('combobox', { name: /^program workflow$/i })).toHaveDisplayValue(/program 1 workflow 1/i);
    expect(screen.getByText(/program state/i)).toBeInTheDocument();

    const programStateMenu = screen.getByRole('combobox', {
      name: /program state/i,
    });
    expect(programStateMenu).toBeInTheDocument();
    await user.click(programStateMenu);

    const programStateSelection = screen.getByRole('option', { name: /program 1 state 1/i });
    expect(programStateSelection).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /program 1 state 2/i })).toBeInTheDocument();
  });

  it('renders the selected program, workflow and state in edit mode', async () => {
    mockUsePrograms.mockReturnValue({ programs: programs, programsLookupError: null, isLoadingPrograms: false });
    mockUseProgramWorkflowStates.mockReturnValue({
      programStates: programOneWorkflowOneStates,
      programStatesLookupError: null,
      isLoadingProgramStates: null,
      mutateProgramStates: jest.fn(),
    });
    formField.questionOptions = {
      rendering: 'select',
      programUuid: programs[0].uuid,
      workflowUuid: programs[0].allWorkflows[0].uuid,
      answers: [{ value: programOneWorkflowOneStates[0].uuid, label: programOneWorkflowOneStates[0].concept.display }],
    };
    renderComponent();

    expect(screen.getByRole('combobox', { name: /^program$/i })).toHaveDisplayValue(/program 1/i);
    expect(
      screen.getByRole('combobox', {
        name: /program workflow/i,
      }),
    ).toHaveDisplayValue(/program 1 workflow 1/i);
    expect(
      screen.getByText(/total items selected: 1,to clear selection, press delete or backspace/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/program 1 state 1/i)).toBeInTheDocument();
  });
});

function renderComponent() {
  render(
    <FormFieldProvider initialFormField={formField}>
      <ProgramStateTypeQuestion />
    </FormFieldProvider>,
  );
}
