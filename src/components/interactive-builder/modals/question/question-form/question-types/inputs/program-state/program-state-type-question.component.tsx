import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectSkeleton, Stack, ComboBox, InlineNotification, MultiSelect, Tag, FormLabel } from '@carbon/react';
import { usePrograms, useProgramWorkStates } from '@hooks/useProgramStates';
import { useFormField } from '../../../../form-field-context';
import type { ProgramWorkflow, Program } from '@types';
import type { ProgramState } from '@openmrs/esm-form-engine-lib';
import styles from './program-state-type-question.scss';

interface ProgramStateData {
  selectedItems: Array<ProgramState>;
}

const ProgramStateTypeQuestion: React.FC = () => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();
  const { programs, programsLookupError, isLoadingPrograms } = usePrograms();
  const [selectedProgram, setSelectedProgram] = useState<Program>();
  const [selectedProgramWorkflow, setSelectedProgramWorkflow] = useState<ProgramWorkflow>();
  const [programWorkflows, setProgramWorkflows] = useState<Array<ProgramWorkflow>>([]);
  const { programStates, programStatesLookupError, isLoadingProgramStates, mutateProgramStates } = useProgramWorkStates(
    selectedProgramWorkflow?.uuid,
  );

  const selectedProgramStates = useMemo(() => {
    if (!formField.questionOptions?.answers || !programStates.length) {
      return [];
    }

    const answerUuids = new Set(formField.questionOptions.answers.map((answer) => answer.value));
    return programStates.filter((programState) => answerUuids.has(programState.uuid));
  }, [formField.questionOptions?.answers, programStates]);

  const handleProgramChange = useCallback(
    (selectedItem: Program) => {
      setSelectedProgram(selectedItem);
      setSelectedProgramWorkflow(null);
      setProgramWorkflows(selectedItem?.allWorkflows ?? []);
      setFormField((prevField) => {
        if (selectedItem) {
          return {
            ...prevField,
            questionOptions: {
              ...prevField.questionOptions,
              programUuid: selectedItem.uuid,
            },
          };
        }
        const newQuestionOptions = { ...prevField.questionOptions };
        delete newQuestionOptions.programUuid;
        delete newQuestionOptions.workflowUuid;
        delete newQuestionOptions.answers;

        return {
          ...prevField,
          questionOptions: newQuestionOptions,
        };
      });
    },
    [setFormField],
  );

  const handleProgramWorkflowChange = useCallback(
    (selectedItem: ProgramWorkflow | null) => {
      setSelectedProgramWorkflow(selectedItem);
      void mutateProgramStates();

      setFormField((prevField) => {
        if (selectedItem) {
          return {
            ...prevField,
            questionOptions: {
              ...prevField.questionOptions,
              workflowUuid: selectedItem.uuid,
            },
          };
        }
        const newQuestionOptions = { ...prevField.questionOptions };
        delete newQuestionOptions.workflowUuid;
        delete newQuestionOptions.answers;

        return {
          ...prevField,
          questionOptions: newQuestionOptions,
        };
      });
    },
    [mutateProgramStates, setFormField],
  );

  const selectProgramStates = useCallback(
    (data: ProgramStateData) => {
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

  // Initialize selected program and workflow from formField
  useEffect(() => {
    const selectedProgramResult = programs.find((program) => program.uuid === formField.questionOptions?.programUuid);
    if (selectedProgramResult) {
      setSelectedProgram(selectedProgramResult);
      setProgramWorkflows(selectedProgramResult.allWorkflows);

      if (formField.questionOptions.workflowUuid) {
        const selectedProgramWorkflowResult = selectedProgramResult.allWorkflows.find(
          (workflow) => workflow.uuid === formField.questionOptions?.workflowUuid,
        );
        if (selectedProgramWorkflowResult) {
          setSelectedProgramWorkflow(selectedProgramWorkflowResult);
        }
      }
    }
  }, [formField.questionOptions?.programUuid, formField.questionOptions?.workflowUuid, programs]);

  const convertItemsToString = useCallback((item: ProgramState) => {
    return item.concept.display;
  }, []);

  return (
    <Stack gap={5}>
      <FormLabel className={styles.label}>{t('selectProgram', 'Select a program')}</FormLabel>
      {programsLookupError && (
        <InlineNotification
          kind="error"
          lowContrast
          className={styles.error}
          title={t('errorFetchingPrograms', 'Error fetching programs')}
          subtitle={t('pleaseTryAgain', 'Please try again.')}
        />
      )}
      {isLoadingPrograms ? (
        <SelectSkeleton />
      ) : (
        programs.length > 0 && (
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
        )
      )}

      {selectedProgram && (
        <ComboBox
          id="programWorkflowLookup"
          items={programWorkflows}
          itemToString={(item: ProgramWorkflow) => item?.concept?.display}
          onChange={({ selectedItem }: { selectedItem: ProgramWorkflow }) => handleProgramWorkflowChange(selectedItem)}
          placeholder={t('addProgramWorkflow', 'Add program workflow')}
          selectedItem={selectedProgramWorkflow}
          titleText={t('programWorkflow', 'Program workflow')}
          initialSelectedItem={programWorkflows.find(
            (programWorkflow) => programWorkflow?.uuid === formField.questionOptions?.workflowUuid,
          )}
        />
      )}
      {selectedProgramWorkflow && (
        <div>
          {programStatesLookupError && (
            <InlineNotification
              kind="error"
              lowContrast
              className={styles.error}
              title={t('errorFetchingProgramState', 'Error fetching program state')}
              subtitle={t('pleaseTryAgain', 'Please try again.')}
            />
          )}
          {isLoadingProgramStates ? (
            <SelectSkeleton />
          ) : (
            programStates?.length > 0 && (
              <MultiSelect
                titleText={t('programState', 'Program state')}
                id="programState"
                items={programStates}
                itemToString={convertItemsToString}
                selectionFeedback="top-after-reopen"
                onChange={selectProgramStates}
                selectedItems={selectedProgramStates}
              />
            )
          )}
          {selectedProgramStates?.map((answer) => (
            <div key={answer.uuid}>
              <Tag className={styles.tag} type="blue">
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
