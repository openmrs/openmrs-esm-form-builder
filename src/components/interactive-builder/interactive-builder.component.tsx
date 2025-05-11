import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCorners,
  pointerWithin,
  rectIntersection,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { Accordion, AccordionItem, Button, IconButton, InlineLoading } from '@carbon/react';
import { Add, TrashCan, Edit } from '@carbon/react/icons';
import { useParams } from 'react-router-dom';
import { showModal, showSnackbar } from '@openmrs/esm-framework';
import DraggableQuestion from './draggable/draggable-question.component';
import EditableValue from './editable/editable-value.component';
import type { DragEndEvent } from '@dnd-kit/core';
import type { FormSchema } from '@openmrs/esm-form-engine-lib';
import type { Schema, Question } from '@types';
import styles from './interactive-builder.scss';

interface ValidationError {
  errorMessage?: string;
  warningMessage?: string;
  field: { label: string; concept: string; id?: string; type?: string };
}

interface InteractiveBuilderProps {
  isLoading: boolean;
  onSchemaChange: (schema: Schema) => void;
  schema: Schema;
  validationResponse: Array<ValidationError>;
}

interface SubQuestionProps {
  question: Question;
  pageIndex: number;
  sectionIndex: number;
  questionIndex: number;
}

const InteractiveBuilder: React.FC<InteractiveBuilderProps> = ({
  isLoading,
  onSchemaChange,
  schema,
  validationResponse,
}) => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10, // Enable sort function when dragging 10px 💡 here!!!.
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(mouseSensor, keyboardSensor);

  const { t } = useTranslation();
  const { formUuid } = useParams<{ formUuid: string }>();
  const isEditingExistingForm = Boolean(formUuid);

  const initializeSchema = useCallback(() => {
    const dummySchema: FormSchema = {
      name: '',
      pages: [],
      processor: 'EncounterFormProcessor',
      encounterType: '',
      referencedForms: [],
      uuid: '',
    };

    if (!schema) {
      onSchemaChange({ ...dummySchema });
    }

    return schema || dummySchema;
  }, [onSchemaChange, schema]);

  const launchNewFormModal = useCallback(() => {
    const schema = initializeSchema();
    const dispose = showModal('new-form-modal', {
      closeModal: () => dispose(),
      schema,
      onSchemaChange,
    });
  }, [onSchemaChange, initializeSchema]);

  const launchAddPageModal = useCallback(() => {
    const dispose = showModal('new-page-modal', {
      closeModal: () => dispose(),
      schema,
      onSchemaChange,
    });
  }, [schema, onSchemaChange]);

  const launchDeletePageModal = useCallback(
    (pageIndex: number) => {
      const dipose = showModal('delete-page-modal', {
        closeModal: () => dipose(),
        onSchemaChange,
        schema,
        pageIndex,
      });
    },
    [onSchemaChange, schema],
  );

  const launchAddSectionModal = useCallback(
    (pageIndex: number) => {
      const dispose = showModal('new-section-modal', {
        closeModal: () => dispose(),
        pageIndex,
        schema,
        onSchemaChange,
      });
    },
    [schema, onSchemaChange],
  );

  const launchEditSectionModal = useCallback(
    (pageIndex: number, sectionIndex: number) => {
      const modalType = 'edit';
      const dispose = showModal('new-section-modal', {
        closeModal: () => dispose(),
        pageIndex,
        sectionIndex,
        schema,
        onSchemaChange,
        modalType,
      });
    },
    [onSchemaChange, schema],
  );

  const launchDeleteSectionModal = useCallback(
    (pageIndex: number, sectionIndex: number) => {
      const dispose = showModal('delete-section-modal', {
        closeModal: () => dispose(),
        pageIndex,
        sectionIndex,
        schema,
        onSchemaChange,
      });
    },
    [onSchemaChange, schema],
  );

  const launchAddFormReferenceModal = useCallback(
    (pageIndex: number) => {
      const dispose = showModal('add-form-reference-modal', {
        closeModal: () => dispose(),
        pageIndex,
        schema,
        onSchemaChange,
      });
    },
    [onSchemaChange, schema],
  );

  const launchAddQuestionModal = useCallback(
    (pageIndex: number, sectionIndex: number) => {
      const dispose = showModal('question-modal', {
        closeModal: () => dispose(),
        onSchemaChange,
        schema,
        pageIndex,
        sectionIndex,
      });
    },
    [onSchemaChange, schema],
  );

  const renameSchema = useCallback(
    (value: string) => {
      try {
        if (value) {
          schema.name = value;
        }

        onSchemaChange({ ...schema });

        showSnackbar({
          title: t('success', 'Success!'),
          kind: 'success',
          isLowContrast: true,
          subtitle: t('formRenamed', 'Form renamed'),
        });
      } catch (error) {
        showSnackbar({
          title: t('errorRenamingForm', 'Error renaming form'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    },
    [onSchemaChange, schema, t],
  );

  const renamePage = useCallback(
    (name: string, pageIndex: number) => {
      try {
        if (name) {
          schema.pages[pageIndex].label = name;
        }

        onSchemaChange({ ...schema });

        showSnackbar({
          title: t('success', 'Success!'),
          kind: 'success',
          isLowContrast: true,
          subtitle: t('pageRenamed', 'Page renamed'),
        });
      } catch (error) {
        if (error instanceof Error) {
          showSnackbar({
            title: t('errorRenamingPage', 'Error renaming page'),
            kind: 'error',
            subtitle: error?.message,
          });
        }
      }
    },
    [onSchemaChange, schema, t],
  );

  const renameSection = useCallback(
    (name: string, pageIndex: number, sectionIndex: number) => {
      try {
        if (name) {
          schema.pages[pageIndex].sections[sectionIndex].label = name;
        }
        onSchemaChange({ ...schema });

        showSnackbar({
          title: t('success', 'Success!'),
          kind: 'success',
          isLowContrast: true,
          subtitle: t('sectionRenamed', 'Section renamed'),
        });
      } catch (error) {
        if (error instanceof Error) {
          showSnackbar({
            title: t('errorRenamingSection', 'Error renaming section'),
            kind: 'error',
            subtitle: error?.message,
          });
        }
      }
    },
    [onSchemaChange, schema, t],
  );

  const duplicateQuestion = useCallback(
    (question: Question, pageId: number, sectionId: number, questionId?: number) => {
      try {
        const questionToDuplicate: Question = JSON.parse(JSON.stringify(question));
        questionToDuplicate.id = questionToDuplicate.id + 'Duplicate';

        if (Number.isInteger(questionId)) {
          schema.pages[pageId].sections[sectionId].questions[questionId].questions.push(questionToDuplicate);
        } else {
          schema.pages[pageId].sections[sectionId].questions.push(questionToDuplicate);
        }

        onSchemaChange({ ...schema });

        showSnackbar({
          title: t('success', 'Success!'),
          kind: 'success',
          isLowContrast: true,
          subtitle: t(
            'questionDuplicated',
            "Question duplicated. Please change the duplicated question's ID to a unique, camelcased value",
          ),
        });
      } catch (error) {
        if (error instanceof Error) {
          showSnackbar({
            title: t('errorDuplicatingQuestion', 'Error duplicating question'),
            kind: 'error',
            subtitle: error?.message,
          });
        }
      }
    },
    [onSchemaChange, schema, t],
  );

  const handleDragStart = (event) => {
    setActiveQuestion(event.active.data.current?.question);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    const activeQuestion = active.data.current;
    const overQuestion = over.data.current;

    if (activeId === overId) return;

    if (activeQuestion.type === 'question' && overQuestion.type === 'obsQuestion') return;

    if (
      activeQuestion.type === 'obsQuestion' &&
      (activeQuestion.question.sectionIndex !== overQuestion.question.sectionIndex ||
        activeQuestion.question.pageIndex !== overQuestion.question.pageIndex ||
        activeQuestion.question.questionIndex !== overQuestion.question.questionIndex)
    )
      return;

    function deleteFromSource(schema, pageIndex, sectionIndex, questionId) {
      if (activeQuestion.type === 'obsQuestion') {
        const newSchema = { ...schema };
        const pages = newSchema.pages;
        const targetQuestion = pages[pageIndex].sections[sectionIndex].questions[activeQuestion.question.questionIndex];

        targetQuestion.questions.splice(activeQuestion.question.subQuestionIndex, 1);

        return newSchema;
      }
      if (activeQuestion.type === 'question') {
        const newSchema = { ...schema };
        const pages = newSchema.pages;
        pages[pageIndex].sections[sectionIndex].questions.splice(activeQuestion.question.questionIndex, 1);
        return newSchema;
      }
    }

    function addToDestination(
      schema: Schema,
      pageIndex: number,
      sectionIndex: number,
      questionId: string | number,
      newQuestion: Question,
    ): Schema {
      if (activeQuestion.type === 'question') {
        const newSchema = { ...schema };
        const questions = newSchema.pages[pageIndex]?.sections[sectionIndex]?.questions;
        const questionIndex = questions.findIndex((q) => q.id === questionId);

        if (questionIndex === -1) {
          console.error('Question with given id not found');
          return schema;
        }

        if (
          activeQuestion.question.pageIndex === overQuestion.question.pageIndex &&
          overQuestion.question.sectionIndex === activeQuestion.question.sectionIndex
        ) {
          if (activeQuestion.question.questionIndex > overQuestion.question.questionIndex) {
            questions.splice(questionIndex, 0, newQuestion);
          } else {
            const overQuestionIndex = questionIndex + 1;
            questions.splice(overQuestionIndex, 0, newQuestion);
          }
        } else {
          questions.splice(questionIndex, 0, newQuestion);
        }

        return newSchema;
      } else if (activeQuestion.type === 'obsQuestion') {
        if (overQuestion.type === 'question') {
          const newSchema = { ...schema };
          const pages = newSchema.pages;
          const targetQuestion = pages[pageIndex].sections[sectionIndex].questions[overQuestion.question.questionIndex];

          // Add the active question
          targetQuestion.questions.unshift(activeQuestion.question.question);
          return newSchema;
        }
        if (overQuestion.type === 'obsQuestion') {
          const newSchema = { ...schema };
          const pages = newSchema.pages;
          pages[pageIndex].sections[sectionIndex].questions[overQuestion.question.questionIndex].questions.splice(
            overQuestion.question.subQuestionIndex,
            0,
            activeQuestion.question.question,
          );
          return newSchema;
        }
      }
    }

    const updatedSchema = deleteFromSource(
      schema,
      activeQuestion.question.pageIndex,
      activeQuestion.question.sectionIndex,
      activeId as string,
    );

    onSchemaChange(updatedSchema);

    const finalSchema = addToDestination(
      updatedSchema,
      overQuestion.question.pageIndex,
      overQuestion.question.sectionIndex,
      overId,
      activeQuestion.question.question,
    );

    onSchemaChange(finalSchema);
    setActiveQuestion(null);
  };

  const getAnswerErrors = (answers: Array<Record<string, string>>) => {
    const answerLabels = answers?.map((answer) => answer.label) || [];
    const errors: Array<ValidationError> = validationResponse.filter((error) =>
      answerLabels?.includes(error.field.label),
    );
    return errors || [];
  };

  const getValidationError = (question: Question) => {
    const errorField: ValidationError = validationResponse.find(
      (error) =>
        error.field.label === question.label && error.field.id === question.id && error.field.type === question.type,
    );
    return errorField?.errorMessage || '';
  };

  const ObsGroupSubQuestions = ({ question, pageIndex, sectionIndex, questionIndex }: SubQuestionProps) => {
    return (
      <div className={styles.obsQuestions}>
        {question.questions.map((qn, qnIndex) => {
          return (
            <DraggableQuestion
              handleDuplicateQuestion={duplicateQuestion}
              key={qn.id}
              onSchemaChange={onSchemaChange}
              pageIndex={pageIndex}
              question={qn}
              questionCount={question.questions.length}
              questionIndex={questionIndex}
              schema={schema}
              sectionIndex={sectionIndex}
              subQuestionIndex={qnIndex}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {isLoading ? <InlineLoading description={t('loadingSchema', 'Loading schema') + '...'} /> : null}

      {schema?.name && (
        <>
          <div className={styles.header}>
            <div className={styles.explainer}>
              <p>{t('welcomeHeading', 'Welcome to the Interactive Schema builder')}</p>
              <p>
                {t(
                  'welcomeExplainer',
                  'Add pages, sections and questions to your form. The Preview tab automatically updates as you build your form. For a detailed explanation of what constitutes an OpenMRS form schema, please read through the ',
                )}{' '}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={'https://openmrs.atlassian.net/wiki/spaces/projects/pages/68747273/React+Form+Engine'}
                >
                  {t('formBuilderDocs', 'form builder documentation')}.
                </a>
              </p>
            </div>
            <Button
              kind="ghost"
              renderIcon={Add}
              onClick={launchAddPageModal}
              iconDescription={t('addPage', 'Add Page')}
            >
              {t('addPage', 'Add Page')}
            </Button>
          </div>
          <div className={styles.editorContainer}>
            <EditableValue
              elementType="schema"
              id="formNameInput"
              value={schema?.name}
              onSave={(name) => renameSchema(name)}
            />
          </div>
        </>
      )}

      {!isEditingExistingForm && !schema?.name && (
        <div className={styles.header}>
          <p className={styles.explainer}>
            {t(
              'interactiveBuilderHelperText',
              'The Interactive Builder lets you build your form schema without writing JSON code. The Preview tab automatically updates as you build your form. When done, click Save Form to save your form.',
            )}
          </p>

          <Button onClick={launchNewFormModal} className={styles.startButton} kind="ghost">
            {t('startBuilding', 'Start building')}
          </Button>
        </div>
      )}

      <DndContext
        collisionDetection={(args) => [...rectIntersection(args), ...closestCorners(args), ...pointerWithin(args)]}
        onDragStart={handleDragStart}
        onDragEnd={(event: DragEndEvent) => handleDragEnd(event)}
        sensors={sensors}
      >
        <SortableContext
          items={
            schema?.pages?.flatMap(
              (page) => page?.sections?.flatMap((section) => section?.questions?.map((qn) => qn.id) || []) || [],
            ) || []
          }
        >
          {schema?.pages?.length
            ? schema.pages.map((page, pageIndex) => (
                <div className={styles.editableFieldsContainer} key={pageIndex}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className={styles.editorContainer}>
                      <EditableValue
                        elementType="page"
                        id="pageNameInput"
                        value={schema.pages[pageIndex].label}
                        onSave={(name) => renamePage(name, pageIndex)}
                      />
                    </div>
                    <IconButton
                      enterDelayMs={300}
                      kind="ghost"
                      label={t('deletePage', 'Delete page')}
                      onClick={() => launchDeletePageModal(pageIndex)}
                      size="md"
                    >
                      <TrashCan />
                    </IconButton>
                  </div>
                  <div>
                    {page?.sections?.length ? (
                      <p className={styles.sectionExplainer}>
                        {t(
                          'expandSectionExplainer',
                          'Below are the sections linked to this page. Expand each section to add questions to it.',
                        )}
                      </p>
                    ) : null}
                    {page?.sections?.length ? (
                      page.sections?.map((section, sectionIndex) => (
                        <Accordion key={sectionIndex}>
                          <AccordionItem title={section.label}>
                            <>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div className={styles.editorContainer}>
                                  <h1 className={styles['sectionLabel']}>{section.label}</h1>
                                  <IconButton
                                    enterDelayMs={300}
                                    kind="ghost"
                                    label={t('editSection', 'Edit Section')}
                                    onClick={() => launchEditSectionModal(pageIndex, sectionIndex)}
                                    size="md"
                                  >
                                    <Edit />
                                  </IconButton>
                                </div>
                                <IconButton
                                  enterDelayMs={300}
                                  kind="ghost"
                                  label={t('deleteSection', 'Delete section')}
                                  onClick={() => launchDeleteSectionModal(pageIndex, sectionIndex)}
                                  size="md"
                                >
                                  <TrashCan />
                                </IconButton>
                              </div>
                              <div>
                                {section.questions?.length ? (
                                  section.questions.map((question, questionIndex) => {
                                    return (
                                      <div
                                        id={`droppable-question-${pageIndex}-${sectionIndex}-${questionIndex}`}
                                        key={questionIndex}
                                      >
                                        <DraggableQuestion
                                          handleDuplicateQuestion={duplicateQuestion}
                                          key={question.id}
                                          onSchemaChange={onSchemaChange}
                                          pageIndex={pageIndex}
                                          question={question}
                                          questionCount={section.questions.length}
                                          questionIndex={questionIndex}
                                          schema={schema}
                                          sectionIndex={sectionIndex}
                                        >
                                          <ObsGroupSubQuestions
                                            question={question}
                                            pageIndex={pageIndex}
                                            sectionIndex={sectionIndex}
                                            questionIndex={questionIndex}
                                          />
                                        </DraggableQuestion>
                                        {getValidationError(question) && (
                                          <div className={styles.validationErrorMessage}>
                                            {getValidationError(question)}
                                          </div>
                                        )}
                                        {getAnswerErrors(question.questionOptions.answers)?.length ? (
                                          <div className={styles.answerErrors}>
                                            <div>Answer Errors</div>
                                            {getAnswerErrors(question.questionOptions.answers)?.map((error, index) => (
                                              <div
                                                className={styles.validationErrorMessage}
                                                key={index}
                                              >{`${error.field.label}: ${error.errorMessage}`}</div>
                                            ))}
                                          </div>
                                        ) : null}
                                      </div>
                                    );
                                  })
                                ) : (
                                  <p className={styles.explainer}>
                                    {t(
                                      'sectionExplainer',
                                      'A section will typically contain one or more questions. Click the button below to add a question to this section.',
                                    )}
                                  </p>
                                )}

                                <Button
                                  className={styles.addQuestionButton}
                                  kind="ghost"
                                  renderIcon={Add}
                                  onClick={() => {
                                    launchAddQuestionModal(pageIndex, sectionIndex);
                                  }}
                                  iconDescription={t('addQuestion', 'Add Question')}
                                >
                                  {t('addQuestion', 'Add Question')}
                                </Button>
                              </div>
                            </>
                          </AccordionItem>
                        </Accordion>
                      ))
                    ) : (
                      <p className={styles.explainer}>
                        {t(
                          'pageExplainer',
                          'Pages typically have one or more sections. Click the button below to add a section to your page.',
                        )}
                      </p>
                    )}
                  </div>
                  <Button
                    className={styles.addSectionButton}
                    kind="ghost"
                    renderIcon={Add}
                    onClick={() => {
                      launchAddSectionModal(pageIndex);
                    }}
                    iconDescription={t('addSection', 'Add Section')}
                  >
                    {t('addSection', 'Add Section')}
                  </Button>
                </div>
              ))
            : null}
          <DragOverlay>
            {activeQuestion ? (
              <div className={styles.dragOverlay}>
                <DraggableQuestion
                  handleDuplicateQuestion={duplicateQuestion}
                  onSchemaChange={onSchemaChange}
                  pageIndex={activeQuestion.pageIndex}
                  sectionIndex={activeQuestion.sectionIndex}
                  question={activeQuestion.question}
                  questionCount={activeQuestion.questionCount}
                  questionIndex={activeQuestion.questionIndex}
                  schema={schema}
                />
              </div>
            ) : null}
          </DragOverlay>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default InteractiveBuilder;
