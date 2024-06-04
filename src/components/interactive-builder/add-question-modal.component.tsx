import React, { useState } from 'react';
import { useTranslation, type TFunction } from 'react-i18next';
import flattenDeep from 'lodash-es/flattenDeep';
import {
  Button,
  ComboBox,
  ComposedModal,
  Form,
  FormGroup,
  FormLabel,
  Layer,
  InlineLoading,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  MultiSelect,
  RadioButton,
  RadioButtonGroup,
  Search,
  Select,
  SelectItem,
  Stack,
  Tag,
  TextInput,
  Tile,
} from '@carbon/react';
import { ArrowUpRight } from '@carbon/react/icons';
import { showSnackbar, useConfig, useDebounce } from '@openmrs/esm-framework';
import type { RenderType } from '@openmrs/openmrs-form-engine-lib';

import type { ConfigObject } from '../../config-schema';
import type {
  Answer,
  Concept,
  ConceptMapping,
  PersonAttributeType,
  PatientIdentifierType,
  Schema,
  QuestionType,
} from '../../types';
import { useConceptLookup } from '../../hooks/useConceptLookup';
import { usePatientIdentifierTypes } from '../../hooks/usePatientIdentifierTypes';
import { usePersonAttributeTypes } from '../../hooks/usePersonAttributeTypes';
import styles from './question-modal.scss';

interface AddQuestionModalProps {
  onModalChange: (showModal: boolean) => void;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  questionIndex: number;
  resetIndices: () => void;
  schema: Schema;
  sectionIndex: number;
  showModal: boolean;
}

const DatePickerType = {
  both: 'both',
  calendar: 'calendar',
  timer: 'timer',
} as const;

type DatePickerTypeValue = (typeof DatePickerType)[keyof typeof DatePickerType];

interface Item {
  text: string;
}

interface RequiredLabelProps {
  isRequired: boolean;
  text: string;
  t: TFunction;
}

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  onModalChange,
  onSchemaChange,
  pageIndex,
  questionIndex,
  resetIndices,
  schema,
  sectionIndex,
  showModal,
}) => {
  const { t } = useTranslation();
  const { fieldTypes, questionTypes } = useConfig<ConfigObject>();
  const [answers, setAnswers] = useState<Array<Answer>>([]);
  const [conceptMappings, setConceptMappings] = useState<Array<ConceptMapping>>([]);
  const [conceptToLookup, setConceptToLookup] = useState('');
  const debouncedConceptToLookup = useDebounce(conceptToLookup);
  const [datePickerType, setDatePickerType] = useState<(typeof DatePickerType)[DatePickerTypeValue]>(
    DatePickerType.both,
  );
  const [renderingType, setRenderingType] = useState<RenderType | null>(null);
  const [isQuestionRequired, setIsQuestionRequired] = useState(false);
  const [max, setMax] = useState('');
  const [min, setMin] = useState('');
  const [questionId, setQuestionId] = useState('');
  const [questionLabel, setQuestionLabel] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType | null>(null);
  const [rows, setRows] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<
    Array<{
      id: string;
      text: string;
    }>
  >([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [selectedPersonAttributeType, setSelectedPersonAttributeType] = useState<PersonAttributeType | null>(null);
  const { concepts, conceptLookupError, isLoadingConcepts } = useConceptLookup(debouncedConceptToLookup);
  const { personAttributeTypes, personAttributeTypeLookupError } = usePersonAttributeTypes();
  const [selectedPatientIdetifierType, setSelectedPatientIdetifierType] = useState<PatientIdentifierType>(null);
  const { patientIdentifierTypes, patientIdentifierTypeLookupError } = usePatientIdentifierTypes();
  const [addObsComment, setAddObsComment] = useState(false);
  const [addInlineDate, setAddInlineDate] = useState(false);

  const renderTypeOptions = {
    control: ['text'],
    encounterDatetime: ['date'],
    encounterLocation: ['ui-select-extended'],
    encounterProvider: ['ui-select-extended'],
    encounterRole: ['ui-select-extended'],
    obsGroup: ['group', 'repeating'],
    personAttribute: ['ui-select-extended', 'select', 'text'],
    testOrder: ['group', 'repeating'],
    patientIdentifier: ['text'],
  };

  const handleConceptChange = (event: React.ChangeEvent<HTMLInputElement>) => setConceptToLookup(event.target.value);

  const handleConceptSelect = (concept: Concept) => {
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
    createQuestion();
    onModalChange(false);
  };

  const createQuestion = () => {
    try {
      const computedQuestionId = `question${questionIndex + 1}Section${sectionIndex + 1}Page-${pageIndex + 1}`;

      const newQuestion = {
        label: questionLabel,
        type: questionType,
        required: isQuestionRequired,
        id: questionId ?? computedQuestionId,
        ...(questionType === 'encounterDatetime' && { datePickerType }),
        questionOptions: {
          rendering: renderingType,
          concept: selectedConcept?.uuid,
          ...(conceptMappings.length && { conceptMappings }),
          ...(selectedAnswers.length && {
            answers: selectedAnswers.map((answer) => ({
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
        },
        validators: [],
      };

      schema.pages[pageIndex]?.sections?.[sectionIndex]?.questions?.push(newQuestion);

      onSchemaChange({ ...schema });

      resetIndices();
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

  return (
    <ComposedModal open={showModal} onClose={() => onModalChange(false)} preventCloseOnClickOutside>
      <ModalHeader title={t('createNewQuestion', 'Create a new question')} />
      <Form className={styles.form} onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody hasScrollingContent>
          <FormGroup legendText={''}>
            <Stack gap={5}>
              <TextInput
                id="questionLabel"
                labelText={<RequiredLabel isRequired={isQuestionRequired} text={t('questionLabel', 'Label')} t={t} />}
                placeholder={t('labelPlaceholder', 'e.g. Type of Anaesthesia')}
                value={questionLabel}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuestionLabel(event.target.value)}
                required
              />

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

                {questionTypes.filter((questionType) => questionType !== 'obs').includes(questionType)
                  ? renderTypeOptions[questionType].map((type, key) => (
                      <SelectItem key={`${questionType}-${key}`} text={type} value={type} />
                    ))
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
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setMin(event.target.value)}
                        required
                      />
                      <TextInput
                        id="max"
                        labelText="Max"
                        value={max || ''}
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
                </>
              ) : null}

              {questionType === 'encounterDatetime' ? (
                <RadioButtonGroup
                  defaultSelected="both"
                  name="datePickerType"
                  legendText={t('datePickerType', 'The type of date picker to show ')}
                >
                  <RadioButton
                    id="both"
                    defaultChecked={true}
                    labelText={t('calendarAndTimer', 'Calendar and timer')}
                    onClick={() => setDatePickerType(DatePickerType.both)}
                    value="both"
                  />
                  <RadioButton
                    id="calendar"
                    defaultChecked={false}
                    labelText={t('calendarOnly', 'Calendar only')}
                    onClick={() => setDatePickerType(DatePickerType.calendar)}
                    value="calendar"
                  />
                  <RadioButton
                    id="timer"
                    defaultChecked={false}
                    labelText={t('timerOnly', 'Timer only')}
                    onClick={() => setDatePickerType(DatePickerType.timer)}
                    value="timer"
                  />
                </RadioButtonGroup>
              ) : null}
            </Stack>
          </FormGroup>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button onClick={() => onModalChange(false)} kind="secondary">
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          disabled={
            !questionLabel ||
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
    </ComposedModal>
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
