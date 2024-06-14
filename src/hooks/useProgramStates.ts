import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type ProgramWorkflowState } from '@openmrs/openmrs-form-engine-lib';
import { type Program, type ProgramWorkflow } from '../types';

export function usePrograms() {
  const customRepresentation = 'custom:(uuid,name,retired,allWorkflows)';
  const url = `${restBaseUrl}/program?v=${customRepresentation}`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<Program> } }, Error>(url, openmrsFetch);

  return {
    programs: data ? data?.data?.results : [],
    programsLookupError: error,
    isLoadingPrograms: isLoading,
  };
}

export function useProgramWorkStates(workflowUuid: string) {
  const customRepresentation = 'custom:(uuid,retired,states,concept:(uuid,display))';
  const url = `${restBaseUrl}/workflow/${workflowUuid}?v=${customRepresentation}`;

  const { data, error, isLoading, mutate } = useSWR<{ data: ProgramWorkflow }, Error>(
    workflowUuid ? url : null,
    openmrsFetch,
  );

  return {
    programStates: data?.data?.states ?? [],
    programStatesLookupError: error,
    isLoadingProgramStates: isLoading,
    mutateProgramStates: mutate,
  };
}

export function useProgramState(stateUuid: string) {
  const customRepresentation = 'custom:(uuid,retired,states,concept:(uuid,display))';
  const url = `${restBaseUrl}/workflow/${stateUuid}?v=${customRepresentation}`;

  const { data, error, isLoading, mutate } = useSWR<{ data: ProgramWorkflowState }, Error>(
    stateUuid ? url : null,
    openmrsFetch,
  );

  return {
    programWorkflow: data?.data ?? null,
    programWorkflowLookupError: error,
    isLoadingProgramWorkflow: isLoading,
    mutateProgramWorkflow: mutate,
  };
}
