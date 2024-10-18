import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import flattenDeep from 'lodash-es/flattenDeep';
import {
  Button,
  ComboBox,
  Form,
  FormLabel,
  InlineLoading,
  InlineNotification,
  Layer,
  ModalBody,
  ModalFooter,
  ModalHeader,
  MultiSelect,
  RadioButton,
  RadioButtonGroup,
  Search,
  Select,
  SelectItem,
  SelectSkeleton,
  Stack,
  Tag,
  TextInput,
  Tile,
} from '@carbon/react';
import { ArrowUpRight } from '@carbon/react/icons';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import type { ProgramState, RenderType } from '@openmrs/esm-form-engine-lib';

import type { ConfigObject } from '../../config-schema';
import type {
  DatePickerType,
  Concept,
  ConceptMapping,
  PatientIdentifierType,
  PersonAttributeType,
  Program,
  ProgramWorkflow,
  Question,
  QuestionType,
  Schema,
  DatePickerTypeOption,
} from '../../types';
import { useConceptLookup } from '../../hooks/useConceptLookup';
import { useConceptName } from '../../hooks/useConceptName';
import { usePatientIdentifierLookup } from '../../hooks/usePatientIdentifierLookup';
import { usePatientIdentifierName } from '../../hooks/usePatientIdentifierName';
import { usePatientIdentifierTypes } from '../../hooks/usePatientIdentifierTypes';
import { usePersonAttributeLookup } from '../../hooks/usePersonAttributeLookup';
import { usePersonAttributeName } from '../../hooks/usePersonAttributeName';
import { usePersonAttributeTypes } from '../../hooks/usePersonAttributeTypes';
import { usePrograms, useProgramWorkStates } from '../../hooks/useProgramStates';
import { getDatePickerType } from './add-question.modal';
import styles from './question-modal.scss';

interface EditQuestionModalProps {
  closeModal: () => void;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  questionIndex: number;
  questionToEdit: Question;
  schema: Schema;
  sectionIndex: number;
}

interface Item {
  id: string;
  text: string;
}

interface ProgramStateData {
  selectedItems: Array<ProgramState>;
}

const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  closeModal,
  onSchemaChange,
  pageIndex,
  questionIndex,
  questionToEdit,
  schema,
  sectionIndex,
}) => {
  const { t } = useTranslation();
  const { fieldTypes, questionTypes } = useConfig<ConfigObject>();

  const [answersChanged, setAnswersChanged] = useState(false);
  const [answersFromConcept, setAnswersFromConcept] = useState<
    Array<{
      concept: string;
      label: string;
    }>
  >([]);
  const [conceptMappings, setConceptMappings] = useState<Array<ConceptMapping> | undefined>(
    questionToEdit.questionOptions.conceptMappings,
  );
  const [conceptToLookup, setConceptToLookup] = useState('');
  const [personAttributeTypeToLookup, setPersonAttributeTypeToLookup] = useState('');
  const [patientIdentifierTypeToLookup, setPatientIdentifierTypeToLookup] = useState('');
  const [fieldType, setFieldType] = useState<RenderType | null>(questionToEdit.questionOptions.rendering);
  const [isQuestionRequired, setIsQuestionRequired] = useState(false);
  const [max, setMax] = useState(questionToEdit.questionOptions.max ?? '');
  const [min, setMin] = useState(questionToEdit.questionOptions.min ?? '');
  const [questionId, setQuestionId] = useState('');
  const [questionLabel, setQuestionLabel] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType | null>(null);
  const [datePickerType, setDatePickerType] = useState<DatePickerType | null>(
    questionToEdit.datePickerFormat ?? 'both',
  );
  const [rows, setRows] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<
    Array<{
      id: string;
      text: string;
    }>
  >([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);

  const { concepts, isLoadingConcepts } = useConceptLookup(conceptToLookup);
  const { conceptName, conceptNameLookupError, isLoadingConceptName } = useConceptName(
    questionToEdit.questionOptions.concept,
  );
  const { patientIdentifierTypes } = usePatientIdentifierTypes();
  const { personAttributeTypes } = usePersonAttributeTypes();
  const { patientIdentifierType } = usePatientIdentifierLookup(patientIdentifierTypeToLookup);
  const { personAttributeType } = usePersonAttributeLookup(personAttributeTypeToLookup);
  const [selectedPatientIdentifierType, setSelectedPatientIdentifierType] = useState(patientIdentifierType);
  const [selectedPersonAttributeType, setSelectedPersonAttributeType] = useState(personAttributeType);
  const { patientIdentifierNameLookupError, isLoadingPatientidentifierName } = usePatientIdentifierName(
    questionToEdit.questionOptions.identifierType,
  );
  const { personAttributeNameLookupError, isLoadingPersonAttributeName } = usePersonAttributeName(
    questionToEdit.questionOptions.attributeType,
  );
  const [addObsComment, setAddObsComment] = useState(false);
  const [selectedProgramState, setSelectedProgramState] = useState<Array<ProgramState>>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program>(null);
  const [programWorkflow, setProgramWorkflow] = useState<ProgramWorkflow>(null);
  const { programs, programsLookupError, isLoadingPrograms } = usePrograms();
  const { programStates, programStatesLookupError, isLoadingProgramStates, mutateProgramStates } = useProgramWorkStates(
    programWorkflow?.uuid,
  );
  const [programWorkflows, setProgramWorkflows] = useState<Array<ProgramWorkflow>>([]);

  const hasConceptChanged =
    selectedConcept &&
    questionToEdit?.questionOptions.concept &&
    questionToEdit?.questionOptions?.concept !== selectedConcept?.uuid;
  const [addInlineDate, setAddInlineDate] = useState(false);
  const [toggleLabelTrue, setToggleLabelTrue] = useState('');
  const [toggleLabelFalse, setToggleLabelFalse] = useState('');
  const [formMarkdown, setFormMarkdown] = useState([]);
  const [buttonLabel, setButtonLabel] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');

  // Maps the data type of a concept to a date picker type.
  const datePickerTypeOptions: Record<string, Array<DatePickerTypeOption>> = {
    datetime: [{ value: 'both', label: t('calendarAndTimer', 'Calendar and timer'), defaultChecked: true }],
    date: [{ value: 'calendar', label: t('calendarOnly', 'Calendar only'), defaultChecked: false }],
    time: [{ value: 'timer', label: t('timerOnly', 'Timer only'), defaultChecked: false }],
  };

  const debouncedSearch = useMemo(() => {
    return debounce((searchTerm: string) => setConceptToLookup(searchTerm), 500) as (searchTerm: string) => void;
  }, []);

  const handleConceptChange = (searchTerm: string) => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    }
  };

  const handleIdentifierTypeSelect = (identifierType: PatientIdentifierType) => {
    setPatientIdentifierTypeToLookup('');
    setSelectedPatientIdentifierType(identifierType);
  };

  const handleAttributeTypeSelect = (attributeType: PersonAttributeType) => {
    setPersonAttributeTypeToLookup('');
    setSelectedPersonAttributeType(attributeType);
  };

  const handleConceptSelect = (concept: Concept) => {
    const datePickerType = getDatePickerType(concept);
    if (datePickerType) {
      setDatePickerType(datePickerType);
    }
    setConceptToLookup('');
    setSelectedAnswers([]);
    setSelectedConcept(concept);
    setConceptMappings(
      concept?.mappings?.map((conceptMapping) => {
        const data = conceptMapping.display.split(': ');
        return {
          relationship: conceptMapping.conceptMapType.display,
          type: data[0],
          value: data[1],
        };
      }),
    );
    setAnswersFromConcept(
      concept?.answers?.map((answer) => ({
        concept: answer?.uuid,
        label: answer?.display,
      })) ?? [],
    );
  };

  const questionIdExists = (idToTest: string) => {
    if (questionToEdit?.id === idToTest) {
      return false;
    }

    const nestedIds = schema?.pages?.map((page) => {
      return page?.sections?.map((section) => {
        return section?.questions?.map((question) => {
          return question.id;
        });
      });
    });

    const questionIds: Array<string> = flattenDeep(nestedIds);

    return questionIds.includes(idToTest);
  };

  const handleUpdateQuestion = () => {
    updateQuestion(questionIndex);
  };

  const handleProgramWorkflowChange = (selectedItem: ProgramWorkflow) => {
    setProgramWorkflow(selectedItem);
    void mutateProgramStates();
  };

  const handleProgramChange = (selectedItem: Program) => {
    setSelectedProgram(selectedItem);
    setProgramWorkflows(selectedItem?.allWorkflows);
  };

  const updateQuestion = (questionIndex: number) => {
    let mappedAnswers = [];

    // update changed concept based on details
    if (!hasConceptChanged && selectedAnswers?.length) {
      mappedAnswers = selectedAnswers.map((answer) => ({
        concept: answer.id,
        label: answer.text,
      }));
    } else if (hasConceptChanged && answersFromConcept.length === 0) {
      mappedAnswers = [];
    } else if (hasConceptChanged && answersFromConcept?.length > 0 && selectedAnswers?.length) {
      mappedAnswers = selectedAnswers?.length
        ? selectedAnswers.map((answer) => ({
            concept: answer.id,
            label: answer.text,
          }))
        : questionToEdit.questionOptions.answers;
    } else {
      if (questionToEdit.type === 'programState') {
        mappedAnswers = selectedProgramState.map((answer) => ({
          value: answer.uuid,
          label: answer.concept.display,
        }));
      } else {
        mappedAnswers = questionToEdit.questionOptions.answers;
      }
    }

    try {
      const data = {
        label: questionLabel ? questionLabel : questionToEdit.label,
        type: questionType ? questionType : questionToEdit.type,
        required: isQuestionRequired ? isQuestionRequired : /true/.test(questionToEdit?.required?.toString()),
        id: questionId ? questionId : questionToEdit.id,
        ...(((fieldType && (fieldType === 'date' || fieldType === 'datetime')) ||
          questionToEdit.questionOptions.rendering === 'date' ||
          questionToEdit.questionOptions.rendering === 'datetime') && {
          datePickerFormat: datePickerType,
        }),
        questionOptions: {
          rendering: fieldType ? fieldType : questionToEdit.questionOptions.rendering,
          ...(min && { min }),
          ...(max && { max }),
          ...((selectedConcept || questionToEdit.questionOptions.concept) && {
            concept: selectedConcept ? selectedConcept.uuid : questionToEdit.questionOptions.concept,
            conceptMappings: conceptMappings?.length ? conceptMappings : questionToEdit.questionOptions.conceptMappings,
          }),
          answers: mappedAnswers,
          ...(questionType === 'patientIdentifier' && {
            identifierType: selectedPatientIdentifierType
              ? selectedPatientIdentifierType['uuid']
              : questionToEdit.questionOptions.identifierType,
          }),
          ...(addObsComment && {
            showComment: addObsComment
              ? addObsComment
              : /true/.test(questionToEdit.questionOptions.showComment.toString()),
          }),
          ...(addInlineDate && {
            showDate: addInlineDate ? addInlineDate : /true/.test(questionToEdit.questionOptions.showDate.toString()),
          }),
          attributeType: selectedPersonAttributeType
            ? selectedPersonAttributeType['uuid']
            : questionToEdit.questionOptions.attributeType,
          ...(selectedProgram && { programUuid: selectedProgram.uuid }),
          ...(programWorkflow && { workflowUuid: programWorkflow.uuid }),
          ...(fieldType === 'toggle' && {
            toggleOptions: {
              labelTrue: toggleLabelTrue,
              labelFalse: toggleLabelFalse,
            },
          }),
          ...(fieldType === 'content-switcher' &&
            selectedConcept && {
              answers: selectedConcept.answers.map((answer) => ({
                label: answer.display, // Assuming "display" holds the label text
                concept: answer.uuid, // Assuming "uuid" holds the concept identifier
              })),
            }),
          ...(fieldType === 'workspace-launcher' && {
            buttonLabel: buttonLabel,
            workSpaceName: workspaceName,
          }),
        },

        ...(fieldType === 'markdown' && {
          value: formMarkdown,
        }),
      };

      schema.pages[pageIndex].sections[sectionIndex].questions[questionIndex] = data;

      onSchemaChange({ ...schema });
      setQuestionLabel('');
      setQuestionId('');
      setIsQuestionRequired(false);
      setQuestionType(null);
      setFieldType(null);
      setSelectedConcept(null);
      setConceptMappings([]);
      setSelectedAnswers([]);
      setAddObsComment(false);
      setAddInlineDate(false);

      showSnackbar({
        title: t('questionEdited', 'Question edited'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('questionEditedMessage', 'The question labelled "{{- questionLabel}}" has been edited.', {
          questionLabel: questionToEdit.label,
        }),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorUpdatingQuestion', 'Error updating question'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }

    closeModal();
  };

  useEffect(() => {
    const previousPrograms = programs.find((program) => program.uuid === questionToEdit.questionOptions.programUuid);
    setSelectedProgram(previousPrograms);
  }, [programs, questionToEdit.questionOptions.programUuid]);

  useEffect(() => {
    const previousWorkflow = selectedProgram?.allWorkflows.find(
      (workflow) => workflow.uuid === questionToEdit.questionOptions.workflowUuid,
    );
    setProgramWorkflow(previousWorkflow);
    setProgramWorkflows(selectedProgram?.allWorkflows);
  }, [questionToEdit.questionOptions.workflowUuid, selectedProgram]);

  useEffect(() => {
    const previousStates = programWorkflow?.states.filter((state) =>
      questionToEdit.questionOptions.answers.some((answer) => answer.value === state.uuid),
    );
    setSelectedProgramState(previousStates);
  }, [programWorkflow, questionToEdit.questionOptions.answers]);

  return (
    <>
      <ModalHeader className={styles.modalHeader} closeModal={closeModal} title={t('editQuestion', 'Edit question')} />
      <Form className={styles.form} onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody hasScrollingContent>
          <Stack gap={5}>
            <TextInput
              defaultValue={questionToEdit.label}
              id={questionToEdit.id}
              labelText={t('questionLabel', 'Label')}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuestionLabel(event.target.value)}
              required
            />
            <TextInput
              defaultValue={questionToEdit.id}
              id="questionId"
              invalid={questionIdExists(questionId)}
              invalidText={t('questionIdExists', 'This question ID already exists in your schema')}
              labelText={t(
                'questionId',
                'Question ID (prefer using camel-case for IDs). Each field should have a unique ID.',
              )}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuestionId(event.target.value)}
              placeholder={t(
                'questionIdPlaceholder',
                'Enter a unique ID e.g. "anaesthesiaType" for a question asking about the type of anaesthesia.',
              )}
              required
            />
            <RadioButtonGroup
              defaultSelected={/true/.test(questionToEdit?.required?.toString()) ? 'required' : 'optional'}
              name="isQuestionRequired"
              legendText={t(
                'isQuestionRequiredOrOptional',
                'Is this question a required or optional field? Required fields must be answered before the form can be submitted.',
              )}
            >
              <RadioButton
                id="questionIsNotRequired"
                defaultChecked={true}
                labelText={t('optional', 'Optional')}
                onClick={() => setIsQuestionRequired(false)}
                value="optional"
              />
              <RadioButton
                id="questionIsRequired"
                defaultChecked={false}
                labelText={t('required', 'Required')}
                onClick={() => setIsQuestionRequired(true)}
                value="required"
              />
            </RadioButtonGroup>
            <Select
              defaultValue={questionToEdit.type}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                setQuestionType(event.target.value as QuestionType)
              }
              id={'questionType'}
              invalidText={t('typeRequired', 'Type is required')}
              labelText={t('questionType', 'Question type')}
              required
            >
              {!questionType && <SelectItem text={t('chooseQuestionType', 'Choose a question type')} value="" />}
              {questionTypes.map((questionType, key) => (
                <SelectItem text={questionType} value={questionType} key={key} />
              ))}
            </Select>
            <Select
              defaultValue={questionToEdit.questionOptions.rendering}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setFieldType(event.target.value as RenderType)}
              id="renderingType"
              invalidText={t('validFieldTypeRequired', 'A valid field type value is required')}
              labelText={t('renderingType', 'Rendering type')}
              required
            >
              {!fieldType && <SelectItem text={t('chooseRenderingType', 'Choose a rendering type')} value="" />}
              {fieldTypes.map((fieldType, key) => (
                <SelectItem text={fieldType} value={fieldType} key={key} />
              ))}
            </Select>
            {fieldType === 'number' ? (
              <>
                <TextInput
                  id="min"
                  labelText="Min"
                  value={min || ''}
                  invalid={parseFloat(min) > parseFloat(max)}
                  invalidText={
                    parseFloat(min) > parseFloat(max) ? t('invalidMinMax', 'Min value cannot be greater than max') : ''
                  }
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setMin(event.target.value)}
                  required
                />
                <TextInput
                  id="max"
                  labelText="Max"
                  value={max || ''}
                  invalid={parseFloat(min) > parseFloat(max)}
                  invalidText={
                    parseFloat(min) > parseFloat(max) ? t('invalidMinMax', 'Min value cannot be greater than max') : ''
                  }
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setMax(event.target.value)}
                  required
                />
              </>
            ) : fieldType === 'textarea' ? (
              <TextInput
                id="textAreaRows"
                labelText={t('rows', 'Rows')}
                value={rows || ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setRows(event.target.value)}
                required
              />
            ) : fieldType === 'toggle' ? (
              <div>
                <TextInput
                  id="lableTrue"
                  labelText={t('labelTrue', 'Label true')}
                  value={t(toggleLabelTrue || '')}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setToggleLabelTrue(event.target.value)}
                  placeholder={t('on', 'On')}
                  required
                />
                <TextInput
                  id="lableFalse"
                  labelText={t('labelFalse', 'Label false')}
                  value={t(toggleLabelFalse || '')}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setToggleLabelFalse(event.target.value)}
                  placeholder={t('off', 'Off')}
                  required
                />
              </div>
            ) : null}

            {questionToEdit.type === 'patientIdentifier' && (
              <div>
                <FormLabel className={styles.label}>
                  {t('searchForBackingPatientIdentifierType', 'Search for a backing patient identifier type')}
                </FormLabel>
                {patientIdentifierNameLookupError ? (
                  <InlineNotification
                    kind="error"
                    lowContrast
                    className={styles.error}
                    title={t('errorFetchingPatientIdentifierTypes', 'Error fetching patient identifier types')}
                    subtitle={t('pleaseTryAgain', 'Please try again.')}
                  />
                ) : null}
                {isLoadingPatientidentifierName ? (
                  <InlineLoading className={styles.loader} description={t('loading', 'Loading') + '...'} />
                ) : (
                  <ComboBox
                    id="patientIdentifierTypeLookup"
                    items={patientIdentifierTypes}
                    itemToString={(item: PatientIdentifierType) => item?.display}
                    onChange={({ selectedItem }: { selectedItem: PatientIdentifierType }) => {
                      handleIdentifierTypeSelect(selectedItem);
                    }}
                    placeholder={t('choosePatientIdentifierType', 'Choose a patient identifier type')}
                    initialSelectedItem={patientIdentifierTypes.find(
                      (patientIdentifierType) =>
                        patientIdentifierType?.uuid === questionToEdit.questionOptions?.identifierType,
                    )}
                  />
                )}
              </div>
            )}

            {questionToEdit.type === 'personAttribute' && (
              <div>
                <FormLabel className={styles.label}>
                  {t('searchForBackingPersonAttributeType', 'Search for a backing person attribute type')}
                </FormLabel>
                {personAttributeNameLookupError ? (
                  <InlineNotification
                    kind="error"
                    lowContrast
                    className={styles.error}
                    title={t('errorFetchingPersonAttributeTypes', 'Error fetching person attribute types')}
                    subtitle={t('pleaseTryAgain', 'Please try again.')}
                  />
                ) : null}
                {isLoadingPersonAttributeName ? (
                  <InlineLoading className={styles.loader} description={t('loading', 'Loading') + '...'} />
                ) : (
                  <ComboBox
                    id="personAttributeTypeLookup"
                    items={personAttributeTypes}
                    itemToString={(item: PersonAttributeType) => item?.display}
                    onChange={({ selectedItem }: { selectedItem: PersonAttributeType }) => {
                      handleAttributeTypeSelect(selectedItem);
                    }}
                    placeholder={t('choosePersonAttributeType', 'Choose a person attribute type')}
                    initialSelectedItem={personAttributeTypes.find(
                      (personAttributeType) =>
                        personAttributeType?.uuid === questionToEdit.questionOptions?.attributeType,
                    )}
                  />
                )}
              </div>
            )}

            {questionToEdit.type === 'programState' && (
              <Stack gap={5}>
                {isLoadingPrograms && <SelectSkeleton />}
                {programsLookupError ? (
                  <InlineNotification
                    kind="error"
                    lowContrast
                    className={styles.error}
                    title={t('errorFetchingPrograms', 'Error fetching programs')}
                    subtitle={t('pleaseTryAgain', 'Please try again.')}
                  />
                ) : null}
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
                  />
                )}

                {selectedProgram && (
                  <ComboBox
                    id="programWorkflowLookup"
                    items={programWorkflows}
                    itemToString={(item: ProgramWorkflow) => item?.concept?.display ?? ''}
                    onChange={({ selectedItem }: { selectedItem: ProgramWorkflow }) =>
                      handleProgramWorkflowChange(selectedItem)
                    }
                    placeholder={t('addProgramWorkflow', 'Add program workflow')}
                    selectedItem={programWorkflow}
                    titleText={t('programWorkflow', 'Program workflow')}
                  />
                )}
                {programWorkflow && (
                  <>
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
                        itemToString={(item: ProgramState) => (item ? item?.concept?.display : '')}
                        selectionFeedback="top-after-reopen"
                        onChange={(data: ProgramStateData) => setSelectedProgramState(data.selectedItems)}
                        selectedItems={selectedProgramState}
                      />
                    )}
                    <div>
                      {selectedProgramState?.map((answer) => (
                        <Tag className={styles.tag} key={answer?.uuid} type={'blue'}>
                          {answer?.concept?.display}
                        </Tag>
                      ))}
                    </div>
                  </>
                )}
              </Stack>
            )}

            {fieldType == 'markdown' ? (
              <TextInput
                id="questionMarkdown"
                labelText={t('questionMarkdown', 'Markdown')}
                placeholder={t('questionMarkdownPlaceholder', 'Enter the Markdown for your form...')}
                value={formMarkdown}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setFormMarkdown(event.target.value.split(',').map((item) => item.trim()))
                }
              />
            ) : null}

            {fieldType == 'workspace-launcher' ? (
              <div>
                <TextInput
                  id="buttonLabel"
                  labelText={t('buttonLabel', 'Button Label')}
                  placeholder={t('buttonLabelPlaceholder', 'Enter the button label')}
                  value={buttonLabel}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setButtonLabel(event.target.value)}
                />
                <TextInput
                  id="workspaceName"
                  labelText={t('workspaceName', 'Workspace Label')}
                  placeholder={t('workspaceNamePlaceholder', 'Enter the workspace label')}
                  value={workspaceName}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setWorkspaceName(event.target.value)}
                />
              </div>
            ) : null}

            {fieldType !== 'ui-select-extended' &&
              questionToEdit.type !== 'encounterDatetime' &&
              (questionType === 'obs' || (!questionType && questionToEdit.type === 'obs')) && (
                <>
                  <div>
                    <FormLabel className={styles.label}>
                      {t('searchForBackingConcept', 'Search for a backing concept')}
                    </FormLabel>
                    {conceptNameLookupError ? (
                      <InlineNotification
                        kind="error"
                        lowContrast
                        className={styles.error}
                        title={t('errorFetchingConceptName', "Couldn't resolve concept name")}
                        subtitle={t(
                          'conceptDoesNotExist',
                          `The linked concept '{{conceptName}}' does not exist in your dictionary`,
                          {
                            conceptName: questionToEdit.questionOptions.concept,
                          },
                        )}
                      />
                    ) : null}
                    {isLoadingConceptName ? (
                      <InlineLoading className={styles.loader} description={t('loading', 'Loading') + '...'} />
                    ) : (
                      <>
                        <Search
                          defaultValue={conceptName}
                          id="conceptLookup"
                          onClear={() => {
                            setSelectedConcept(null);
                            setDatePickerType('both');
                          }}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleConceptChange(e.target.value?.trim())
                          }
                          placeholder={t('searchConcept', 'Search using a concept name or UUID')}
                          required
                          size="md"
                          value={selectedConcept?.display}
                        />
                        {(() => {
                          if (!conceptToLookup) return null;
                          if (isLoadingConcepts)
                            return (
                              <InlineLoading
                                className={styles.loader}
                                description={t('searching', 'Searching') + '...'}
                              />
                            );
                          if (concepts?.length && !isLoadingConcepts) {
                            return (
                              <ul className={styles.conceptList}>
                                {concepts?.map((concept, index) => (
                                  <li
                                    role="menuitem"
                                    className={styles.concept}
                                    key={index}
                                    onClick={() => handleConceptSelect(concept)}
                                  >
                                    {concept.display}
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          return (
                            <Layer>
                              <Tile className={styles.emptyResults}>
                                <span>
                                  {t('noMatchingConcepts', 'No concepts were found that match')}{' '}
                                  <strong>"{conceptToLookup}".</strong>
                                </span>
                              </Tile>

                              <div className={styles.oclLauncherBanner}>
                                {
                                  <p className={styles.bodyShort01}>
                                    {t('conceptSearchHelpText', "Can't find a concept?")}
                                  </p>
                                }
                                <a
                                  className={styles.oclLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  href={'https://app.openconceptlab.org/'}
                                >
                                  {t('searchInOCL', 'Search in OCL')}
                                  <ArrowUpRight size={16} />
                                </a>
                              </div>
                            </Layer>
                          );
                        })()}
                      </>
                    )}
                  </div>

                  <Stack gap={5}>
                    {!hasConceptChanged &&
                    questionToEdit?.questionOptions.answers?.length &&
                    questionToEdit.type !== 'programState' ? (
                      <MultiSelect
                        className={styles.multiSelect}
                        direction="top"
                        id="selectAnswers"
                        itemToString={(item: Item) => item.text}
                        initialSelectedItems={questionToEdit?.questionOptions?.answers?.map((answer) => ({
                          id: answer.concept,
                          text: answer.label,
                        }))}
                        items={questionToEdit?.questionOptions?.answers?.map((answer) => ({
                          id: answer.concept,
                          text: answer.label ?? '',
                        }))}
                        onChange={({
                          selectedItems,
                        }: {
                          selectedItems: Array<{
                            id: string;
                            text: string;
                          }>;
                        }) => {
                          setAnswersChanged(true);
                          setSelectedAnswers(selectedItems.sort());
                        }}
                        size="md"
                        titleText={t('selectAnswersToDisplay', 'Select answers to display')}
                      />
                    ) : null}
                    {!hasConceptChanged &&
                    questionToEdit?.questionOptions?.answers?.length &&
                    !answersChanged &&
                    questionToEdit.type !== 'programState' ? (
                      <div>
                        {questionToEdit?.questionOptions?.answers?.map((answer) => (
                          <Tag className={styles.tag} key={answer?.concept} type={'blue'}>
                            {answer?.label}
                          </Tag>
                        ))}
                      </div>
                    ) : null}
                    {hasConceptChanged && answersFromConcept.length ? (
                      <MultiSelect
                        className={styles.multiSelect}
                        direction="top"
                        id="selectAnswers"
                        itemToString={(item: Item) => item.text}
                        items={answersFromConcept.map((answer) => ({
                          id: answer.concept,
                          text: answer.label,
                        }))}
                        onChange={({
                          selectedItems,
                        }: {
                          selectedItems: Array<{
                            id: string;
                            text: string;
                          }>;
                        }) => setSelectedAnswers(selectedItems.sort())}
                        size="md"
                        titleText={t('selectAnswersToDisplay', 'Select answers to display')}
                      />
                    ) : null}
                    {(hasConceptChanged ?? answersChanged) && (
                      <div>
                        {selectedAnswers.map((selectedAnswer) => (
                          <Tag className={styles.tag} key={selectedAnswer.id} type={'blue'}>
                            {selectedAnswer.text}
                          </Tag>
                        ))}
                      </div>
                    )}
                    <RadioButtonGroup
                      defaultSelected={
                        /true/.test(questionToEdit?.questionOptions?.showComment?.toString()) ? 'yes' : 'no'
                      }
                      name="addObsComment"
                      legendText={t('addObsCommentTextBox', 'Add obs comment text box')}
                    >
                      <RadioButton
                        id="obsCommentYes"
                        defaultChecked={true}
                        labelText={t('yes', 'Yes')}
                        onClick={() => setAddObsComment(true)}
                        value="yes"
                      />
                      <RadioButton
                        id="obsCommentNo"
                        defaultChecked={false}
                        labelText={t('no', 'No')}
                        onClick={() => setAddObsComment(false)}
                        value="no"
                      />
                    </RadioButtonGroup>

                    <RadioButtonGroup
                      defaultSelected={
                        /true/.test(questionToEdit?.questionOptions?.showDate?.toString()) ? 'yes' : 'no'
                      }
                      name="addInlineDate"
                      legendText={t('addInlineDate', 'Add inline date')}
                    >
                      <RadioButton
                        id="inlineDateYes"
                        defaultChecked={true}
                        labelText={t('yes', 'Yes')}
                        onClick={() => setAddInlineDate(true)}
                        value="yes"
                      />
                      <RadioButton
                        id="inlineDateNo"
                        defaultChecked={false}
                        labelText={t('no', 'No')}
                        onClick={() => setAddInlineDate(false)}
                        value="no"
                      />
                    </RadioButtonGroup>
                  </Stack>
                </>
              )}

            {fieldType === 'date' || fieldType === 'datetime' ? (
              <RadioButtonGroup
                name="datePickerType"
                legendText={t('datePickerType', 'The type of date picker to show')}
              >
                {/** Filters out the date picker types based on the selected concept's data type.
                     If no concept is selected, all date picker types are shown.
                */}
                {selectedConcept && selectedConcept.datatype
                  ? datePickerTypeOptions[selectedConcept.datatype.name.toLowerCase()].map((type) => (
                      <RadioButton
                        id={type.value}
                        labelText={type.label}
                        onClick={() => setDatePickerType(type.value)}
                        checked={datePickerType === type.value}
                        value={type.value}
                      />
                    ))
                  : Object.values(datePickerTypeOptions)
                      .flat()
                      .map((type) => (
                        <RadioButton
                          id={type.value}
                          checked={datePickerType === type.value}
                          labelText={type.label}
                          onClick={() => setDatePickerType(type.value)}
                          value={type.value}
                        />
                      ))}
              </RadioButtonGroup>
            ) : null}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={closeModal} kind="secondary">
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={handleUpdateQuestion}>
            <span>{t('save', 'Save')}</span>
          </Button>
        </ModalFooter>
      </Form>
    </>
  );
};

export default EditQuestionModal;
