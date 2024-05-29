import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import flattenDeep from 'lodash-es/flattenDeep';
import {
  Button,
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
  Stack,
  Tag,
  TextInput,
  Tile,
} from '@carbon/react';
import { ArrowUpRight } from '@carbon/react/icons';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import type { RenderType } from '@openmrs/openmrs-form-engine-lib';

import type { Concept, ConceptMapping, Question, QuestionType, Schema } from '../../types';
import { useConceptLookup } from '../../hooks/useConceptLookup';
import { useConceptName } from '../../hooks/useConceptName';
import styles from './question-modal.scss';

interface EditQuestionModalProps {
  closeModal: () => void;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  questionIndex: number;
  questionToEdit: Question;
  resetIndices: () => void;
  schema: Schema;
  sectionIndex: number;
}

interface Config {
  fieldTypes: Array<RenderType>;
  questionTypes: Array<QuestionType>;
}

interface Item {
  id: string;
  text: string;
}

const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  closeModal,
  onSchemaChange,
  pageIndex,
  questionIndex,
  questionToEdit,
  resetIndices,
  schema,
  sectionIndex,
}) => {
  const { t } = useTranslation();
  const { fieldTypes, questionTypes }: Config = useConfig();

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
  const [fieldType, setFieldType] = useState<RenderType | null>(null);
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

  const { concepts, isLoadingConcepts } = useConceptLookup(conceptToLookup);
  const { conceptName, conceptNameLookupError, isLoadingConceptName } = useConceptName(
    questionToEdit.questionOptions.concept,
  );

  const hasConceptChanged = selectedConcept && questionToEdit?.questionOptions?.concept !== selectedConcept?.uuid;

  const debouncedSearch = useMemo(() => {
    return debounce((searchTerm: string) => setConceptToLookup(searchTerm), 500) as (searchTerm: string) => void;
  }, []);

  const handleConceptChange = (searchTerm: string) => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    }
  };

  const handleConceptSelect = (concept: Concept) => {
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

  const updateQuestion = (questionIndex: number) => {
    let mappedAnswers = [];

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
      mappedAnswers = questionToEdit.questionOptions.answers;
    }

    try {
      const data = {
        label: questionLabel ? questionLabel : questionToEdit.label,
        type: questionType ? questionType : questionToEdit.type,
        required: isQuestionRequired ? isQuestionRequired : /true/.test(questionToEdit?.required?.toString()),
        id: questionId ? questionId : questionToEdit.id,
        questionOptions: {
          rendering: fieldType ? fieldType : questionToEdit.questionOptions.rendering,
          concept: selectedConcept?.uuid ? selectedConcept.uuid : questionToEdit.questionOptions.concept,
          conceptMappings: conceptMappings?.length ? conceptMappings : questionToEdit.questionOptions.conceptMappings,
          answers: mappedAnswers,
        },
      };

      schema.pages[pageIndex].sections[sectionIndex].questions[questionIndex] = data;

      onSchemaChange({ ...schema });
      resetIndices();
      setQuestionLabel('');
      setQuestionId('');
      setIsQuestionRequired(false);
      setQuestionType(null);
      setFieldType(null);
      setSelectedConcept(null);
      setConceptMappings([]);
      setSelectedAnswers([]);

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

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('editQuestion', 'Edit question')} />
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
            ) : fieldType === 'textarea' ? (
              <TextInput
                id="textAreaRows"
                labelText={t('rows', 'Rows')}
                value={rows || ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setRows(event.target.value)}
                required
              />
            ) : null}

            {fieldType !== 'ui-select-extended' && (
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
                      onClear={() => setSelectedConcept(null)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleConceptChange(e.target.value?.trim())}
                      placeholder={t('searchConcept', 'Search using a concept name or UUID')}
                      required
                      size="md"
                      value={selectedConcept?.display}
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
                        <td>{mapping.relationship ?? '--'}</td>
                        <td>{mapping.type ?? '--'}</td>
                        <td>{mapping.value ?? '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </FormGroup>
            ) : null}

            {!hasConceptChanged && questionToEdit?.questionOptions.answers?.length ? (
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

            {!hasConceptChanged && questionToEdit?.questionOptions?.answers?.length && !answersChanged ? (
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
    </div>
  );
};

export default EditQuestionModal;
