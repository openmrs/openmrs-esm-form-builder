import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectSkeleton, Stack, ComboBox, InlineNotification, MultiSelect, Tag } from '@carbon/react';
import { usePrograms, useProgramWorkStates } from '../../../../../../hooks/useProgramStates';
import type { ProgramWorkflow, Program, ComponentProps } from '../../../../../../types';
import type { ProgramState } from '@openmrs/esm-form-engine-lib';
import styles from './program-state-type-question.scss';

interface ProgramStateData {
  selectedItems: Array<ProgramState>;
}

const ProgramStateTypeQuestion: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const { t } = useTranslation();
  const [selectedProgramState, setSelectedProgramState] = useState<Array<ProgramState>>();
  const [selectedProgram, setSelectedProgram] = useState<Program>(null);
  const [programWorkflow, setProgramWorkflow] = useState<ProgramWorkflow>(null);
  const { programs, programsLookupError, isLoadingPrograms } = usePrograms();
  const { programStates, programStatesLookupError, isLoadingProgramStates, mutateProgramStates } = useProgramWorkStates(
    programWorkflow?.uuid,
  );
  const [programWorkflows, setProgramWorkflows] = useState<Array<ProgramWorkflow>>([]);

  const handleProgramChange = useCallback(
    (selectedItem: Program) => {
      setSelectedProgram(selectedItem);
      setProgramWorkflows(selectedItem?.allWorkflows);
      setFormField({ ...formField, questionOptions: { ...formField.questionOptions, programUuid: selectedItem.uuid } });
    },
    [formField, setFormField],
  );

  const handleProgramWorkflowChange = useCallback(
    (selectedItem: ProgramWorkflow) => {
      setProgramWorkflow(selectedItem);
      void mutateProgramStates();
      setFormField({
        ...formField,
        questionOptions: { ...formField.questionOptions, workflowUuid: selectedItem.uuid },
      });
    },
    [formField, mutateProgramStates, setFormField],
  );

  const selectProgramStates = useCallback(
    (data: ProgramStateData) => {
      setSelectedProgramState(data.selectedItems);
      setFormField({
        ...formField,
        questionOptions: {
          ...formField.questionOptions,
          answers: data.selectedItems.map((answer) => ({
            value: answer.uuid,
            label: answer.concept.display,
          })),
        },
      });
    },
    [formField, setFormField],
  );

  const convertItemsToString = useCallback((item: ProgramState) => {
    return item.concept.display;
  }, []);

  useEffect(() => {
    setSelectedProgramState(
      programStates.filter((programState) =>
        formField.questionOptions?.answers?.some((answer) => answer.value === programState.uuid),
      ),
    );
  }, [formField.questionOptions?.answers, programStates]);

  return (
    <Stack gap={5}>
      {isLoadingPrograms && <SelectSkeleton />}
      {programsLookupError && (
        <InlineNotification
          kind="error"
          lowContrast
          className={styles.error}
          title={t('errorFetchingPrograms', 'Error fetching programs')}
          subtitle={t('pleaseTryAgain', 'Please try again.')}
        />
      )}
      {programs && (
        <ComboBox
          id="programLookup"
          items={programs}
          itemToString={(item: Program) => item?.name}
          onChange={({ selectedItem }: { selectedItem: Program }) => {
            handleProgramChange(selectedItem);
          }}
          placeholder={t('addProgram', 'Add program')}
          selectedItem={selectedProgram}
          titleText={t('program', 'Program')}
          initialSelectedItem={programs.find((program) => program?.uuid === formField.questionOptions?.programUuid)}
        />
      )}

      {selectedProgram && (
        <ComboBox
          id="programWorkflowLookup"
          items={programWorkflows}
          itemToString={(item: ProgramWorkflow) => item?.concept?.display}
          onChange={({ selectedItem }: { selectedItem: ProgramWorkflow }) => handleProgramWorkflowChange(selectedItem)}
          placeholder={t('addProgramWorkflow', 'Add program workflow')}
          selectedItem={programWorkflow}
          titleText={t('programWorkflow', 'Program workflow')}
          initialSelectedItem={programWorkflows.find(
            (programWorkflow) => programWorkflow?.uuid === formField.questionOptions?.workflowUuid,
          )}
        />
      )}
      {programWorkflow && (
        <div>
          {isLoadingProgramStates && <SelectSkeleton />}
          {programStatesLookupError && (
            <InlineNotification
              kind="error"
              lowContrast
              className={styles.error}
              title={t('errorFetchingProgramState', 'Error fetching program state')}
              subtitle={t('pleaseTryAgain', 'Please try again.')}
            />
          )}
          {programStates?.length > 0 && (
            <MultiSelect
              titleText={t('programState', 'Program state')}
              id="programState"
              items={programStates}
              itemToString={convertItemsToString}
              selectionFeedback="top-after-reopen"
              onChange={selectProgramStates}
              selectedItems={selectedProgramState}
            />
          )}
          {selectedProgramState?.map((answer) => (
            <div>
              <Tag className={styles.tag} key={answer?.uuid} type={'blue'}>
                {answer?.concept?.display}
              </Tag>
            </div>
          ))}
        </div>
      )}
    </Stack>
  );
};

export default ProgramStateTypeQuestion;
