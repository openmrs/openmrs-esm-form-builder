import React, { useState } from 'react';
import { useTranslation, type TFunction } from 'react-i18next';
import flattenDeep from 'lodash-es/flattenDeep';
import {
  Button,
  ComboBox,
  Form,
  FormGroup,
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
import { showSnackbar, useConfig, useDebounce } from '@openmrs/esm-framework';
import type { ProgramState, RenderType } from '@openmrs/esm-form-engine-lib';

import type { ConfigObject } from '../../config-schema';
import type {
  Answer,
  Concept,
  ConceptMapping,
  PersonAttributeType,
  PatientIdentifierType,
  Schema,
  QuestionType,
  Program,
  ProgramWorkflow,
  DatePickerType,
  DatePickerTypeOption,
} from '../../types';
import { useConceptLookup } from '../../hooks/useConceptLookup';
import { usePatientIdentifierTypes } from '../../hooks/usePatientIdentifierTypes';
import { usePersonAttributeTypes } from '../../hooks/usePersonAttributeTypes';
import { useProgramWorkStates, usePrograms } from '../../hooks/useProgramStates';
import MarkdownQuestion from './markdown-question.component';
import styles from './question-modal.scss';

interface AddQuestionModalProps {
  closeModal: () => void;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  questionIndex: number;
  resetIndices: () => void;
  schema: Schema;
  sectionIndex: number;
}

interface Item {
  text: string;
}
interface ProgramStateData {
  selectedItems: Array<ProgramState>;
}

interface RequiredLabelProps {
  isRequired: boolean;
  text: string;
  t: TFunction;
}

export const getDatePickerType = (concept: Concept): DatePickerType | null => {
  const conceptDataType = concept.datatype.name;
  switch (conceptDataType) {
    case 'Datetime':
      return 'both';
    case 'Date':
      return 'calendar';
    case 'Time':
      return 'timer';
    default:
      console.warn(`Unsupported datatype for date fields: ${conceptDataType}`);
      return null;
  }
};

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  closeModal,
  onSchemaChange,
  pageIndex,
  schema,
  sectionIndex,
}) => {
  const { t } = useTranslation();
  const { fieldTypes, questionTypes } = useConfig<ConfigObject>();
  const [answers, setAnswers] = useState<Array<Answer>>([]);
  const [conceptMappings, setConceptMappings] = useState<Array<ConceptMapping>>([]);
  const [conceptToLookup, setConceptToLookup] = useState('');
  const [conceptAnsToLookup, setConceptAnsToLookup] = useState('');
  const debouncedAnsConceptToLookup = useDebounce(conceptAnsToLookup);
  const debouncedConceptToLookup = useDebounce(conceptToLookup);
  const [datePickerType, setDatePickerType] = useState<DatePickerType>('both');
  const [renderingType, setRenderingType] = useState<RenderType | null>(null);
  const [isQuestionRequired, setIsQuestionRequired] = useState(false);
  const [max, setMax] = useState('');
  const [min, setMin] = useState('');
  const [questionId, setQuestionId] = useState('');
  const [questionLabel, setQuestionLabel] = useState('');
  const [questionValue, setQuestionValue] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType | null>(null);
  const [rows, setRows] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<
    Array<{
      id: string;
      text: string;
    }>
  >([]);
  const [addedAnswers, setAddedAnswers] = useState<
    Array<{
      id: string;
      text: string;
    }>
  >([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [selectedAnsConcept, setSelectedAnsConcept] = useState<Concept | null>(null);
  const [selectedPersonAttributeType, setSelectedPersonAttributeType] = useState<PersonAttributeType | null>(null);
  const { concepts, conceptLookupError, isLoadingConcepts } = useConceptLookup(debouncedConceptToLookup);
  const {
    concepts: ansConcepts,
    conceptLookupError: conceptAnsLookupError,
    isLoadingConcepts: isLoadingAnsConcepts,
  } = useConceptLookup(debouncedAnsConceptToLookup);
  const { personAttributeTypes, personAttributeTypeLookupError } = usePersonAttributeTypes();
  const [selectedPatientIdetifierType, setSelectedPatientIdetifierType] = useState<PatientIdentifierType>(null);
  const { patientIdentifierTypes, patientIdentifierTypeLookupError } = usePatientIdentifierTypes();
  const [addObsComment, setAddObsComment] = useState(false);
  const [addInlineDate, setAddInlineDate] = useState(false);
  const [selectedProgramState, setSelectedProgramState] = useState<Array<ProgramState>>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program>(null);
  const [programWorkflow, setProgramWorkflow] = useState<ProgramWorkflow>(null);
  const { programs, programsLookupError, isLoadingPrograms } = usePrograms();
  const { programStates, programStatesLookupError, isLoadingProgramStates, mutateProgramStates } = useProgramWorkStates(
    programWorkflow?.uuid,
  );
  const [programWorkflows, setProgramWorkflows] = useState<Array<ProgramWorkflow>>([]);
  const [toggleLabelTrue, setToggleLabelTrue] = useState('');
  const [toggleLabelFalse, setToggleLabelFalse] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<
    Array<{
      concept: string;
      label: string;
    }>
  >([]);
  const renderTypeOptions = {
    encounterDatetime: ['date'],
    encounterLocation: ['ui-select-extended'],
    encounterProvider: ['ui-select-extended'],
    encounterRole: ['ui-select-extended'],
    obsGroup: ['group', 'repeating'],
    personAttribute: ['ui-select-extended', 'select', 'text'],
    testOrder: ['group', 'repeating'],
    patientIdentifier: ['text'],
    programState: ['select'],
  };

  // Maps the data type of a concept to a date picker type.
  const datePickerTypeOptions: Record<string, Array<DatePickerTypeOption>> = {
    datetime: [{ value: 'both', label: t('calendarAndTimer', 'Calendar and timer'), defaultChecked: true }],
    date: [{ value: 'calendar', label: t('calendarOnly', 'Calendar only'), defaultChecked: false }],
    time: [{ value: 'timer', label: t('timerOnly', 'Timer only'), defaultChecked: false }],
  };

  const handleConceptChange = (event: React.ChangeEvent<HTMLInputElement>) => setConceptToLookup(event.target.value);
  const handleAnsConceptChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setConceptAnsToLookup(event.target.value);

  const handleOrdersChange = (event: React.ChangeEvent<HTMLInputElement>) => setConceptToLookup(event.target.value);
  const handleConceptSelect = (concept: Concept) => {
    const updatedDatePickerType = getDatePickerType(concept);
    if (updatedDatePickerType) setDatePickerType(updatedDatePickerType);
    setConceptToLookup('');
    setSelectedConcept(concept);
    setAnswers(
      concept?.answers?.map((answer) => ({
        concept: answer?.uuid,
        label: answer?.display,
      })),
    );
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
  };

  const handleOrdersSelect = (concept: Concept) => {
    const updatedDatePickerType = getDatePickerType(concept);
    if (updatedDatePickerType) setDatePickerType(updatedDatePickerType);
    setConceptToLookup('');
    setSelectedConcept(concept);
    setSelectedOrders([
      ...selectedOrders,
      {
        concept: concept.uuid,
        label: concept.display,
      },
    ]);
  };

  const handleDeleteAnswer = (id) => {
    setAddedAnswers((prevAnswers) => prevAnswers.filter((answer) => answer.id !== id));
  };
  const handleSaveMoreAnswers = () => {
    const newAnswers = addedAnswers.filter(
      (newAnswer) => !selectedAnswers.some((prevAnswer) => prevAnswer.id === newAnswer.id),
    );

    const updatedAnswers = [...selectedAnswers, ...newAnswers];
    setSelectedAnswers(updatedAnswers);
    setAddedAnswers([]);
    return updatedAnswers;
  };

  const handleConceptAnsSelect = (concept: Concept) => {
    setConceptAnsToLookup('');
    setSelectedAnsConcept(concept);
    const newAnswer = { id: concept.uuid, text: concept.display };
    const answerExistsInSelected = selectedAnswers.some((answer) => answer.id === newAnswer.id);
    const answerExistsInAdded = addedAnswers.some((answer) => answer.id === newAnswer.id);
    if (!answerExistsInSelected && !answerExistsInAdded) {
      setAddedAnswers((prevAnswers) => [...prevAnswers, newAnswer]);
    }
  };

  const handlePersonAttributeTypeChange = ({ selectedItem }: { selectedItem: PersonAttributeType }) => {
    setSelectedPersonAttributeType(selectedItem);
  };

  const handlePatientIdentifierTypeChange = ({ selectedItem }: { selectedItem: PatientIdentifierType }) => {
    setSelectedPatientIdetifierType(selectedItem);
  };
  const questionIdExists = (idToTest: string) => {
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
  const handleCreateQuestion = () => {
    const updatedAnswers = handleSaveMoreAnswers();
    createQuestion(updatedAnswers);
    closeModal();
  };

  const createQuestion = (updatedAnswers) => {
    try {
      const questionIndex = schema.pages[pageIndex]?.sections?.[sectionIndex]?.questions?.length ?? 0;
      const computedQuestionId = `question${questionIndex + 1}Section${sectionIndex + 1}Page-${pageIndex + 1}`;

      const newQuestion = {
        ...(questionLabel && { label: questionLabel }),
        ...(renderingType === 'markdown' && { value: questionValue }),
        type: questionType ? questionType : 'control',
        required: isQuestionRequired,
        id: questionId ?? computedQuestionId,
        ...((renderingType === 'date' || renderingType === 'datetime') &&
          datePickerType && { datePickerFormat: datePickerType }),
        questionOptions: {
          rendering: renderingType,
          ...(min && { min }),
          ...(max && { max }),
          ...(selectedConcept && { concept: selectedConcept?.uuid }),
          ...(conceptMappings.length && { conceptMappings }),
          ...(updatedAnswers.length && {
            answers: updatedAnswers.map((answer) => ({
              concept: answer.id,
              label: answer.text,
            })),
          }),
          ...(addObsComment && {
            showComment: addObsComment,
          }),
          ...(addInlineDate && {
            showDate: addInlineDate,
          }),
          ...(questionType === 'personAttribute' && { attributeType: selectedPersonAttributeType.uuid }),
          ...(questionType === 'patientIdentifier' && { identifierType: selectedPatientIdetifierType.uuid }),
          ...(questionType === 'obs' &&
            renderingType === 'number' &&
            selectedConcept?.allowDecimal === false && { disallowDecimals: true }),
          ...(questionType === 'programState' && {
            answers: selectedProgramState.map((answer) => ({
              value: answer.uuid,
              label: answer.concept.display,
            })),
            programUuid: selectedProgram.uuid,
            workflowUuid: programWorkflow.uuid,
          }),
          ...(renderingType === 'toggle' && {
            toggleOptions: {
              labelTrue: toggleLabelTrue,
              labelFalse: toggleLabelFalse,
            },
          }),
          ...(questionType === 'testOrder' && {
            orderType: 'testOrder',
            orderSettingUuid: 'INPATIENT',
            selectableOrders: selectedOrders,
          }),
        },
        validators: [],
      };

      schema.pages[pageIndex]?.sections?.[sectionIndex]?.questions?.push(newQuestion);

      onSchemaChange({ ...schema });

      setQuestionLabel('');
      setQuestionId('');
      setIsQuestionRequired(false);
      setQuestionType(null);
      setRenderingType(null);
      setSelectedConcept(null);
      setConceptMappings([]);
      setAnswers([]);
      setSelectedAnswers([]);
      setAddObsComment(false);
      setAddInlineDate(false);
      setSelectedOrders([]);

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('questionCreated', 'New question created'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorCreatingQuestion', 'Error creating question'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }
  };

  const convertLabelToCamelCase = () => {
    const camelCasedLabel = questionLabel
      ?.toLowerCase()
      ?.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
    setQuestionId(camelCasedLabel);
  };

  const handleProgramWorkflowChange = (selectedItem: ProgramWorkflow) => {
    setProgramWorkflow(selectedItem);
    void mutateProgramStates();
  };

  const handleProgramChange = (selectedItem: Program) => {
    setSelectedProgram(selectedItem);
    setProgramWorkflows(selectedItem?.allWorkflows);
  };

  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        title={t('createNewQuestion', 'Create a new question')}
        closeModal={closeModal}
      />
      <Form className={styles.form} onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody hasScrollingContent>
          <FormGroup legendText={''}>
            <Stack gap={5}>
              {renderingType === 'markdown' ? (
                <MarkdownQuestion onValueChange={setQuestionValue} />
              ) : (
                <TextInput
                  id="questionLabel"
                  labelText={<RequiredLabel isRequired={isQuestionRequired} text={t('questionLabel', 'Label')} t={t} />}
                  placeholder={t('labelPlaceholder', 'e.g. Type of Anaesthesia')}
                  value={questionLabel}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuestionLabel(event.target.value)}
                />
              )}

              <TextInput
                id="questionId"
                invalid={questionIdExists(questionId)}
                invalidText={t('questionIdExists', 'This question ID already exists in your schema')}
                labelText={
                  <div className={styles.questionIdLabel}>
                    <span>
                      {t(
                        'questionId',
                        'Question ID (prefer using camel-case for IDs). Each field should have a unique ID.',
                      )}
                    </span>
                    {questionLabel ? (
                      <Button kind={'ghost'} onClick={convertLabelToCamelCase} size="sm">
                        {t('convertLabelToCamelCase', 'Convert label to camel-case')}
                      </Button>
                    ) : null}
                  </div>
                }
                value={questionId}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setQuestionId(event.target.value);
                }}
                placeholder={t(
                  'questionIdPlaceholder',
                  'Enter a unique ID e.g. "anaesthesiaType" for a question asking about the type of anaesthesia.',
                )}
                required
              />

              {renderingType !== 'markdown' && (
                <>
                  <RadioButtonGroup
                    defaultSelected="optional"
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
                    value={questionType}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                      setQuestionType(event.target.value as QuestionType)
                    }
                    id="questionType"
                    invalidText={t('typeRequired', 'Type is required')}
                    labelText={t('questionType', 'Question type')}
                    required
                  >
                    {!questionType && <SelectItem text={t('chooseQuestionType', 'Choose a question type')} value="" />}
                    {questionTypes.map((questionType, key) => (
                      <SelectItem text={questionType} value={questionType} key={key} />
                    ))}
                  </Select>
                </>
              )}

              <Select
                value={renderingType}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  setRenderingType(event.target.value as RenderType)
                }
                id="renderingType"
                invalidText={t('validRenderingTypeRequired', 'A valid rendering type value is required')}
                labelText={t('renderingType', 'Rendering type')}
                required
              >
                {!renderingType && <SelectItem text={t('chooseRenderingType', 'Choose a rendering type')} value="" />}
                {questionTypes
                  .filter((questionType) => !['obs', 'control'].includes(questionType))
                  .includes(questionType as Exclude<QuestionType, 'obs' | 'control'>)
                  ? renderTypeOptions[questionType].map((type, key) => (
                      <SelectItem key={`${questionType}-${key}`} text={type} value={type} />
                    ))
                  : questionType === 'obs'
                    ? fieldTypes
                        .filter((type) => type !== 'markdown')
                        .map((type, key) => <SelectItem key={key} text={type} value={type} />)
                    : fieldTypes.map((type, key) => <SelectItem key={key} text={type} value={type} />)}
              </Select>

              {questionType === 'personAttribute' && (
                <div>
                  <FormLabel className={styles.label}>
                    {t('searchForBackingPersonAttributeType', 'Search for a backing person attribute type')}
                  </FormLabel>
                  {personAttributeTypeLookupError ? (
                    <InlineNotification
                      kind="error"
                      lowContrast
                      className={styles.error}
                      title={t('errorFetchingPersonAttributeTypes', 'Error fetching person attribute types')}
                      subtitle={t('pleaseTryAgain', 'Please try again.')}
                    />
                  ) : null}
                  <ComboBox
                    helperText={t(
                      'personAttributeTypeHelperText',
                      'Person attribute type fields must be linked to a person attribute type',
                    )}
                    id="personAttributeTypeLookup"
                    items={personAttributeTypes}
                    itemToString={(item: PersonAttributeType) => item?.display}
                    onChange={handlePersonAttributeTypeChange}
                    placeholder={t('choosePersonAttributeType', 'Choose a person attribute type')}
                    selectedItem={selectedPersonAttributeType}
                  />
                </div>
              )}

              {questionType === 'patientIdentifier' && (
                <div>
                  <FormLabel className={styles.label}>
                    {t('searchForBackingPatientIdentifierType', 'Search for a backing patient identifier type')}
                  </FormLabel>
                  {patientIdentifierTypeLookupError ? (
                    <InlineNotification
                      kind="error"
                      lowContrast
                      className={styles.error}
                      title={t('errorFetchingPatientIdentifierTypes', 'Error fetching patient identifier types')}
                      subtitle={t('pleaseTryAgain', 'Please try again.')}
                    />
                  ) : null}
                  <ComboBox
                    helperText={t(
                      'patientIdentifierTypeHelperText',
                      'Patient identifier type fields must be linked to a patient identifier type',
                    )}
                    id="patientIdentifierTypeLookup"
                    items={patientIdentifierTypes}
                    itemToString={(item: PatientIdentifierType) => item?.display}
                    onChange={handlePatientIdentifierTypeChange}
                    placeholder={t('choosePatientIdentifierType', 'Choose a patient identifier type')}
                    selectedItem={selectedPatientIdetifierType}
                  />
                </div>
              )}

              {questionType === 'obs' ? (
                <>
                  {renderingType === 'number' ? (
                    <>
                      <TextInput
                        id="min"
                        labelText="Min"
                        value={min || ''}
                        invalid={parseFloat(min) > parseFloat(max)}
                        invalidText={
                          parseFloat(min) > parseFloat(max)
                            ? t('invalidMinMax', 'Min value cannot be greater than max')
                            : ''
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
                          parseFloat(min) > parseFloat(max)
                            ? t('invalidMinMax', 'Min value cannot be greater than max')
                            : ''
                        }
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setMax(event.target.value)}
                        required
                      />
                    </>
                  ) : renderingType === 'textarea' ? (
                    <TextInput
                      id="textAreaRows"
                      labelText={t('rows', 'Rows')}
                      value={rows || ''}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setRows(event.target.value)}
                      required
                    />
                  ) : renderingType === 'toggle' ? (
                    <div>
                      <TextInput
                        id="labelTrue"
                        labelText={t('labelTrue', 'Label true')}
                        value={t(toggleLabelTrue || '')}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setToggleLabelTrue(event.target.value)
                        }
                        placeholder={t('on', 'On')}
                        required
                      />
                      <TextInput
                        id="labelFalse"
                        labelText={t('labelFalse', 'Label false')}
                        value={t(toggleLabelFalse || '')}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setToggleLabelFalse(event.target.value)
                        }
                        placeholder={t('off', 'Off')}
                        required
                      />
                    </div>
                  ) : null}

                  {renderingType !== 'ui-select-extended' && (
                    <div>
                      <FormLabel className={styles.label}>
                        {t('searchForBackingConcept', 'Search for a backing concept')}
                      </FormLabel>
                      {conceptLookupError ? (
                        <InlineNotification
                          kind="error"
                          lowContrast
                          className={styles.error}
                          title={t('errorFetchingConcepts', 'Error fetching concepts')}
                          subtitle={t('pleaseTryAgain', 'Please try again.')}
                        />
                      ) : null}
                      <Search
                        id="conceptLookup"
                        onClear={() => {
                          setSelectedConcept(null);
                          setDatePickerType('both');
                          setAnswers([]);
                          setConceptMappings([]);
                        }}
                        onChange={handleConceptChange}
                        placeholder={t('searchConcept', 'Search using a concept name or UUID')}
                        required
                        size="md"
                        value={(() => {
                          if (conceptToLookup) {
                            return conceptToLookup;
                          }
                          if (selectedConcept) {
                            return selectedConcept.display;
                          }
                          return '';
                        })()}
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
                                <strong>"{debouncedConceptToLookup}".</strong>
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
                    </div>
                  )}

                  {selectedConcept?.allowDecimal === false && (
                    <InlineNotification
                      kind="info"
                      lowContrast
                      title={t('decimalsNotAllowed', 'This concept does not allow decimals')}
                    />
                  )}

                  {conceptMappings?.length ? (
                    <FormGroup>
                      <FormLabel className={styles.label}>{t('mappings', 'Mappings')}</FormLabel>
                      <table className={styles.tableStriped}>
                        <thead>
                          <tr>
                            <th>{t('relationship', 'Relationship')}</th>
                            <th>{t('source', 'Source')}</th>
                            <th>{t('code', 'Code')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {conceptMappings.map((mapping, index) => (
                            <tr key={`mapping-${index}`}>
                              <td>{mapping.relationship}</td>
                              <td>{mapping.type}</td>
                              <td>{mapping.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </FormGroup>
                  ) : null}

                  {answers?.length ? (
                    <MultiSelect
                      className={styles.multiSelect}
                      direction="top"
                      id="selectAnswers"
                      itemToString={(item: Item) => item.text}
                      items={answers.map((answer) => ({
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
                  {selectedAnswers.length ? (
                    <div>
                      {selectedAnswers.map((answer) => (
                        <Tag className={styles.tag} key={answer.id} type={'blue'}>
                          {answer.text}
                        </Tag>
                      ))}
                    </div>
                  ) : null}
                  {selectedConcept && selectedConcept.datatype?.name === 'Coded' ? (
                    <div>
                      <FormLabel className={styles.label}>
                        {t('searchForAnswerConcept', 'Search for a concept to add as an answer')}
                      </FormLabel>
                      {conceptAnsLookupError ? (
                        <InlineNotification
                          kind="error"
                          lowContrast
                          className={styles.error}
                          title={t('errorFetchingConcepts', 'Error fetching concepts')}
                          subtitle={t('pleaseTryAgain', 'Please try again.')}
                        />
                      ) : null}
                      <Search
                        id="conceptAnsLookup"
                        onClear={() => {
                          setSelectedAnsConcept(null);
                        }}
                        onChange={handleAnsConceptChange}
                        placeholder={t('searchConcept', 'Search using a concept name or UUID')}
                        required
                        size="md"
                        value={(() => {
                          if (conceptAnsToLookup) {
                            return conceptAnsToLookup;
                          }
                          if (selectedAnsConcept) {
                            return selectedAnsConcept.display;
                          }
                          return '';
                        })()}
                      />
                      {addedAnswers.length > 0 ? (
                        <div>
                          {addedAnswers.map((answer) => (
                            <Tag className={styles.tag} key={answer.id} type={'blue'}>
                              {answer.text}
                              <button
                                className={styles.conceptAnswerButton}
                                onClick={() => handleDeleteAnswer(answer.id)}
                              >
                                X
                              </button>
                            </Tag>
                          ))}
                        </div>
                      ) : null}

                      {(() => {
                        if (!conceptAnsToLookup) return null;
                        if (isLoadingAnsConcepts)
                          return (
                            <InlineLoading
                              className={styles.loader}
                              description={t('searching', 'Searching') + '...'}
                            />
                          );
                        if (ansConcepts?.length && !isLoadingAnsConcepts) {
                          return (
                            <ul className={styles.conceptList}>
                              {ansConcepts?.map((concept, index) => (
                                <li
                                  role="menuitem"
                                  className={styles.concept}
                                  key={index}
                                  onClick={() => handleConceptAnsSelect(concept)}
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
                                <strong>"{debouncedAnsConceptToLookup}".</strong>
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
                    </div>
                  ) : null}

                  <Stack gap={5}>
                    <RadioButtonGroup
                      defaultSelected="no"
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
                      defaultSelected="no"
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
              ) : null}

              {renderingType === 'date' || renderingType === 'datetime' ? (
                <RadioButtonGroup
                  name="datePickerType"
                  legendText={t('datePickerType', 'The type of date picker to show ')}
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

              {questionType === 'programState' && (
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
                      itemToString={(item: ProgramWorkflow) => item?.concept?.display}
                      onChange={({ selectedItem }: { selectedItem: ProgramWorkflow }) =>
                        handleProgramWorkflowChange(selectedItem)
                      }
                      placeholder={t('addProgramWorkflow', 'Add program workflow')}
                      selectedItem={programWorkflow}
                      titleText={t('programWorkflow', 'Program workflow')}
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
                          itemToString={(item: ProgramState) => (item ? item?.concept?.display : '')}
                          selectionFeedback="top-after-reopen"
                          onChange={(data: ProgramStateData) => setSelectedProgramState(data.selectedItems)}
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
              )}

              {questionType === 'testOrder' && (
                <Stack gap={5}>
                  <div>
                    <FormLabel className={styles.label}>
                      {t('searchForBackingConcept', 'Search for a backing concept')}
                    </FormLabel>
                    {conceptLookupError ? (
                      <InlineNotification
                        kind="error"
                        lowContrast
                        className={styles.error}
                        title={t('errorFetchingConcepts', 'Error fetching concepts')}
                        subtitle={t('pleaseTryAgain', 'Please try again.')}
                      />
                    ) : null}
                    <Search
                      id="conceptLookup"
                      onClear={() => {
                        setSelectedConcept(null);
                        setDatePickerType('both');
                        setAnswers([]);
                        setConceptMappings([]);
                      }}
                      onChange={handleOrdersChange}
                      placeholder={t('searchConcept', 'Search using a concept name or UUID')}
                      required
                      size="md"
                      value={(() => {
                        if (conceptToLookup) {
                          return conceptToLookup;
                        }
                        if (selectedConcept) {
                          return selectedConcept.display;
                        }
                        return '';
                      })()}
                    />
                    {(() => {
                      if (!conceptToLookup) return null;
                      if (isLoadingConcepts)
                        return (
                          <InlineLoading className={styles.loader} description={t('searching', 'Searching') + '...'} />
                        );
                      if (concepts?.length && !isLoadingConcepts) {
                        return (
                          <ul className={styles.conceptList}>
                            {concepts?.map((concept, index) => (
                              <li
                                role="menuitem"
                                className={styles.concept}
                                key={index}
                                onClick={() => handleOrdersSelect(concept)}
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
                              <strong>"{debouncedConceptToLookup}".</strong>
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
                    {selectedOrders.length ? (
                      <div>
                        {selectedOrders.map((answer) => (
                          <Tag className={styles.tag} key={answer.concept} type={'blue'}>
                            {answer.label}
                          </Tag>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Stack>
              )}
            </Stack>
          </FormGroup>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button onClick={closeModal} kind="secondary">
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          disabled={
            !questionId ||
            questionIdExists(questionId) ||
            !renderingType ||
            (questionType === 'patientIdentifier' && !selectedPatientIdetifierType)
          }
          onClick={handleCreateQuestion}
        >
          <span>{t('save', 'Save')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

function RequiredLabel({ isRequired, text, t }: RequiredLabelProps) {
  return (
    <>
      <span>{text}</span>
      {isRequired && (
        <span title={t('required', 'Required')} className={styles.required}>
          *
        </span>
      )}
    </>
  );
}

export default AddQuestionModal;
