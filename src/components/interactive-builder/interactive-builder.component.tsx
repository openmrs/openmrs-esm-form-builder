import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, KeyboardSensor, MouseSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import { Accordion, AccordionItem, Button, InlineLoading } from '@carbon/react';
import { Add, TrashCan } from '@carbon/react/icons';
import { useParams } from 'react-router-dom';
import { showModal, showSnackbar } from '@openmrs/esm-framework';
import type { FormSchema } from '@openmrs/openmrs-form-engine-lib';

import type { Schema, Question } from '../../types';
import DraggableQuestion from './draggable-question.component';
import Droppable from './droppable-container.component';
import EditableValue from './editable-value.component';
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

const InteractiveBuilder: React.FC<InteractiveBuilderProps> = ({
  isLoading,
  onSchemaChange,
  schema,
  validationResponse,
}) => {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10, // Enable sort function when dragging 10px 💡 here!!!
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

  const launchAddQuestionModal = useCallback(
    (pageIndex: number, sectionIndex: number) => {
      const dispose = showModal('add-question-modal', {
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
    (question: Question, pageId: number, sectionId: number) => {
      try {
        const questionToDuplicate: Question = JSON.parse(JSON.stringify(question));
        questionToDuplicate.id = questionToDuplicate.id + 'Duplicate';

        schema.pages[pageId].sections[sectionId].questions.push(questionToDuplicate);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    if (active) {
      // Get the source information
      const activeIdParts = active.id.toString().split('-');
      const sourcePageIndex = parseInt(activeIdParts[1]);
      const sourceSectionIndex = parseInt(activeIdParts[2]);
      const sourceQuestionIndex = parseInt(activeIdParts[3]);

      // Move the question within the same section
      const questions = schema.pages[sourcePageIndex].sections[sourceSectionIndex].questions;
      const questionToMove = questions[sourceQuestionIndex];
      questions.splice(sourceQuestionIndex, 1);
      questions.splice(sourceQuestionIndex + delta.y, 0, questionToMove);

      const updatedSchema = {
        ...schema,
        pages: schema.pages.map((page, pageIndex) => {
          if (pageIndex === sourcePageIndex) {
            return {
              ...page,
              sections: page.sections.map((section, sectionIndex) => {
                if (sectionIndex === sourceSectionIndex) {
                  return {
                    ...section,
                    questions: [...questions],
                  };
                }
                return section;
              }),
            };
          }
          return page;
        }),
      };

      // Update your state or data structure with the updated schema
      onSchemaChange(updatedSchema);
    }
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
        collisionDetection={closestCorners}
        onDragEnd={(event: DragEndEvent) => handleDragEnd(event)}
        sensors={sensors}
      >
        {schema?.pages?.length
          ? schema.pages.map((page, pageIndex) => (
              <div className={styles.editableFieldsContainer}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className={styles.editorContainer}>
                    <EditableValue
                      elementType="page"
                      id="pageNameInput"
                      value={schema.pages[pageIndex].label}
                      onSave={(name) => renamePage(name, pageIndex)}
                    />
                  </div>
                  <Button
                    hasIconOnly
                    enterDelayMs={300}
                    iconDescription={t('deletePage', 'Delete page')}
                    kind="ghost"
                    onClick={() => {
                      launchDeletePageModal(pageIndex);
                    }}
                    renderIcon={(props) => <TrashCan size={16} {...props} />}
                    size="sm"
                  />
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
                      <Accordion>
                        <AccordionItem title={section.label}>
                          <>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div className={styles.editorContainer}>
                                <EditableValue
                                  elementType="section"
                                  id="sectionNameInput"
                                  value={section.label}
                                  onSave={(name) => renameSection(name, pageIndex, sectionIndex)}
                                />
                              </div>
                              <Button
                                hasIconOnly
                                enterDelayMs={300}
                                iconDescription={t('deleteSection', 'Delete section')}
                                kind="ghost"
                                onClick={() => {
                                  launchDeleteSectionModal(pageIndex, sectionIndex);
                                }}
                                renderIcon={(props) => <TrashCan size={16} {...props} />}
                                size="sm"
                              />
                            </div>
                            <div>
                              {section.questions?.length ? (
                                section.questions.map((question, questionIndex) => {
                                  return (
                                    <Droppable id={`droppable-question-${pageIndex}-${sectionIndex}-${questionIndex}`}>
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
                                      />
                                      {getValidationError(question) && (
                                        <div className={styles.validationErrorMessage}>
                                          {getValidationError(question)}
                                        </div>
                                      )}
                                      {getAnswerErrors(question.questionOptions.answers)?.length ? (
                                        <div className={styles.answerErrors}>
                                          <div>Answer Errors</div>
                                          {getAnswerErrors(question.questionOptions.answers)?.map((error) => (
                                            <div
                                              className={styles.validationErrorMessage}
                                            >{`${error.field.label}: ${error.errorMessage}`}</div>
                                          ))}
                                        </div>
                                      ) : null}
                                    </Droppable>
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
      </DndContext>
    </div>
  );
};

export default InteractiveBuilder;
