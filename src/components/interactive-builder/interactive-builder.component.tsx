import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Accordion, AccordionItem, Button, InlineLoading } from "@carbon/react";
import { Add, Edit, Replicate, TrashCan } from "@carbon/react/icons";
import { useParams } from "react-router-dom";
import { showToast, showNotification } from "@openmrs/esm-framework";
import { OHRIFormSchema } from "@openmrs/openmrs-form-engine-lib";

import type { Question, RouteParams, Schema } from "../../types";
import ActionButtons from "../action-buttons/action-buttons.component";
import AddQuestionModal from "./add-question-modal.component";
import DeleteSectionModal from "./delete-section-modal.component";
import DeletePageModal from "./delete-page-modal.component";
import DeleteQuestionModal from "./delete-question-modal.component";
import EditQuestionModal from "./edit-question-modal.component";
import EditableValue from "./editable-value.component";
import NewFormModal from "./new-form-modal.component";
import PageModal from "./page-modal.component";
import SectionModal from "./section-modal.component";
import styles from "./interactive-builder.scss";

type InteractiveBuilderProps = {
  isLoading: boolean;
  onSchemaChange: (schema: Schema) => void;
  schema: Schema;
};

const InteractiveBuilder: React.FC<InteractiveBuilderProps> = ({
  isLoading,
  onSchemaChange,
  schema,
}) => {
  const { t } = useTranslation();
  const { formUuid } = useParams<RouteParams>();
  const isEditingExistingForm = !!formUuid;
  const [pageIndex, setPageIndex] = useState(0);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionToEdit, setQuestionToEdit] = useState(null);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showDeletePageModal, setShowDeletePageModal] = useState(false);
  const [showDeleteSectionModal, setShowDeleteSectionModal] = useState(false);
  const [showDeleteQuestionModal, setShowDeleteQuestionModal] = useState(false);

  const initializeSchema = useCallback(() => {
    const dummySchema: OHRIFormSchema = {
      name: null,
      pages: [],
      processor: "EncounterFormProcessor",
      encounterType: "",
      referencedForms: [],
      uuid: "",
    };

    if (!schema) {
      onSchemaChange({ ...dummySchema });
    }
  }, [onSchemaChange, schema]);

  const launchNewFormModal = () => {
    initializeSchema();
    setShowNewFormModal(true);
  };

  const resetIndices = () => {
    setPageIndex(0);
    setSectionIndex(0);
    setQuestionIndex(0);
  };

  const addPage = () => {
    setShowAddPageModal(true);
  };

  const addSection = () => {
    setShowAddSectionModal(true);
  };

  const addQuestion = () => {
    setShowAddQuestionModal(true);
  };

  const editQuestion = () => {
    setShowEditQuestionModal(true);
  };

  const renameSchema = useCallback(
    (value: string) => {
      try {
        if (value) {
          schema.name = value;
        }

        onSchemaChange({ ...schema });

        showToast({
          title: t("success", "Success!"),
          kind: "success",
          critical: true,
          description: t("formRenamed", "Form renamed"),
        });
      } catch (error) {
        showNotification({
          title: t("errorRenamingForm", "Error renaming form"),
          kind: "error",
          critical: true,
          description: error?.message,
        });
      }
    },
    [onSchemaChange, schema, t]
  );

  const renamePage = useCallback(
    (name: string, pageIndex: number) => {
      try {
        if (name) {
          schema.pages[pageIndex].label = name;
        }

        onSchemaChange({ ...schema });

        showToast({
          title: t("success", "Success!"),
          kind: "success",
          critical: true,
          description: t("pageRenamed", "Page renamed"),
        });
      } catch (error) {
        showNotification({
          title: t("errorRenamingPage", "Error renaming page"),
          kind: "error",
          critical: true,
          description: error?.message,
        });
      }
    },
    [onSchemaChange, schema, t]
  );

  const renameSection = useCallback(
    (name: string, pageIndex: number, sectionIndex: number) => {
      try {
        if (name) {
          schema.pages[pageIndex].sections[sectionIndex].label = name;
        }
        onSchemaChange({ ...schema });

        resetIndices();

        showToast({
          title: t("success", "Success!"),
          kind: "success",
          critical: true,
          description: t("sectionRenamed", "Section renamed"),
        });
      } catch (error) {
        showNotification({
          title: t("errorRenamingSection", "Error renaming section"),
          kind: "error",
          critical: true,
          description: error?.message,
        });
      }
    },
    [onSchemaChange, schema, t]
  );

  const duplicateQuestion = useCallback(
    (question: Question, pageId: number, sectionId: number) => {
      try {
        const questionToDuplicate = JSON.parse(JSON.stringify(question));
        questionToDuplicate.id = questionToDuplicate.id + "Duplicate";

        schema.pages[pageId].sections[sectionId].questions.push(
          questionToDuplicate
        );

        onSchemaChange({ ...schema });
        resetIndices();

        showToast({
          title: t("success", "Success!"),
          kind: "success",
          critical: true,
          description: t(
            "questionDuplicated",
            "Question duplicated. Please change the duplicated question's ID to a unique, camelcased value"
          ),
        });
      } catch (error) {
        showNotification({
          title: t("errorDuplicatingQuestion", "Error duplicating question"),
          kind: "error",
          critical: true,
          description: error?.message,
        });
      }
    },
    [onSchemaChange, schema, t]
  );

  return (
    <div className={styles.container}>
      {isLoading ? (
        <InlineLoading
          description={t("loadingSchema", "Loading schema") + "..."}
        />
      ) : null}

      <ActionButtons schema={schema} t={t} />

      {showNewFormModal ? (
        <NewFormModal
          schema={schema}
          onSchemaChange={onSchemaChange}
          showModal={showNewFormModal}
          onModalChange={setShowNewFormModal}
        />
      ) : null}

      {showAddPageModal ? (
        <PageModal
          schema={schema}
          onSchemaChange={onSchemaChange}
          showModal={showAddPageModal}
          onModalChange={setShowAddPageModal}
        />
      ) : null}

      {showAddSectionModal ? (
        <SectionModal
          schema={schema}
          onSchemaChange={onSchemaChange}
          pageIndex={pageIndex}
          resetIndices={resetIndices}
          showModal={showAddSectionModal}
          onModalChange={setShowAddSectionModal}
        />
      ) : null}

      {showAddQuestionModal ? (
        <AddQuestionModal
          onModalChange={setShowAddQuestionModal}
          onQuestionEdit={setQuestionToEdit}
          onSchemaChange={onSchemaChange}
          pageIndex={pageIndex}
          sectionIndex={sectionIndex}
          questionIndex={questionIndex}
          resetIndices={resetIndices}
          schema={schema}
          showModal={showAddQuestionModal}
        />
      ) : null}

      {showEditQuestionModal ? (
        <EditQuestionModal
          onModalChange={setShowEditQuestionModal}
          onQuestionEdit={setQuestionToEdit}
          onSchemaChange={onSchemaChange}
          pageIndex={pageIndex}
          questionIndex={questionIndex}
          questionToEdit={questionToEdit}
          resetIndices={resetIndices}
          schema={schema}
          sectionIndex={sectionIndex}
          showModal={showEditQuestionModal}
        />
      ) : null}

      {showDeletePageModal ? (
        <DeletePageModal
          onModalChange={setShowDeletePageModal}
          onSchemaChange={onSchemaChange}
          resetIndices={resetIndices}
          pageIndex={pageIndex}
          schema={schema}
          showModal={showDeletePageModal}
        />
      ) : null}

      {showDeleteSectionModal ? (
        <DeleteSectionModal
          onModalChange={setShowDeleteSectionModal}
          onSchemaChange={onSchemaChange}
          resetIndices={resetIndices}
          pageIndex={pageIndex}
          sectionIndex={sectionIndex}
          schema={schema}
          showModal={showDeleteSectionModal}
        />
      ) : null}

      {showDeleteQuestionModal ? (
        <DeleteQuestionModal
          onModalChange={setShowDeleteQuestionModal}
          onSchemaChange={onSchemaChange}
          resetIndices={resetIndices}
          pageIndex={pageIndex}
          sectionIndex={sectionIndex}
          questionIndex={questionIndex}
          schema={schema}
          showModal={showDeleteQuestionModal}
        />
      ) : null}

      {schema?.name && (
        <>
          <div className={styles.header}>
            <div className={styles.explainer}>
              <p>
                {t(
                  "welcomeHeading",
                  "Welcome to the Interactive Schema builder"
                )}
              </p>
              <p>
                {t(
                  "welcomeExplainer",
                  "Add pages, sections and questions to your form. The Preview tab automatically updates as you build your form. For a detailed explanation of what constitutes an OpenMRS form schema, please read through the "
                )}{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={"https://ohri-docs.globalhealthapp.net/"}
                >
                  {t("formBuilderDocs", "form builder documentation")}.
                </a>
              </p>
            </div>
            <Button
              kind="primary"
              renderIcon={Add}
              onClick={addPage}
              iconDescription={t("addPage", "Add Page")}
            >
              {t("addPage", "Add Page")}
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
              "interactiveBuilderHelperText",
              "The Interactive Builder lets you build your form schema without writing JSON code. The Preview tab automatically updates as you build your form. When done, click Save Form to save your form."
            )}
          </p>

          <Button
            onClick={launchNewFormModal}
            className={styles.startButton}
            kind="primary"
          >
            {t("startBuilding", "Start building")}
          </Button>
        </div>
      )}

      {schema?.pages?.length
        ? schema.pages.map((page, pageIndex) => (
            <div className={styles.editableFieldsContainer}>
              <div style={{ display: "flex", alignItems: "center" }}>
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
                  enterDelayMs={200}
                  iconDescription={t("deletePage", "Delete page")}
                  kind="ghost"
                  onClick={() => {
                    setPageIndex(pageIndex);
                    setShowDeletePageModal(true);
                  }}
                  renderIcon={(props) => <TrashCan size={16} {...props} />}
                  size="sm"
                />
              </div>
              <div>
                {page?.sections?.length ? (
                  <p className={styles.sectionExplainer}>
                    {t(
                      "expandSectionExplainer",
                      "Below are the sections linked to this page. Expand each section to add questions to it."
                    )}
                  </p>
                ) : null}
                {page?.sections?.length ? (
                  page.sections?.map((section, sectionIndex) => (
                    <Accordion>
                      <AccordionItem title={section.label}>
                        <>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <div className={styles.editorContainer}>
                              <EditableValue
                                elementType="section"
                                id="sectionNameInput"
                                value={section.label}
                                onSave={(name) =>
                                  renameSection(name, pageIndex, sectionIndex)
                                }
                              />
                            </div>
                            <Button
                              hasIconOnly
                              enterDelayMs={200}
                              iconDescription={t(
                                "deleteSection",
                                "Delete section"
                              )}
                              kind="ghost"
                              onClick={() => {
                                setPageIndex(pageIndex);
                                setSectionIndex(sectionIndex);
                                setShowDeleteSectionModal(true);
                              }}
                              renderIcon={(props) => (
                                <TrashCan size={16} {...props} />
                              )}
                              size="sm"
                            />
                          </div>
                          <div>
                            {section.questions?.length ? (
                              section.questions.map(
                                (question, questionIndex) => (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div className={styles.editorContainer}>
                                      <p className={styles.questionLabel}>
                                        {question.label}
                                      </p>
                                      <div className={styles.buttonContainer}>
                                        <Button
                                          kind="ghost"
                                          size="sm"
                                          enterDelayMs={200}
                                          iconDescription={t(
                                            "duplicateQuestion",
                                            "Duplicate question"
                                          )}
                                          onClick={() =>
                                            duplicateQuestion(
                                              question,
                                              pageIndex,
                                              sectionIndex
                                            )
                                          }
                                          renderIcon={(props) => (
                                            <Replicate size={16} {...props} />
                                          )}
                                          hasIconOnly
                                        />
                                        <Button
                                          kind="ghost"
                                          size="sm"
                                          enterDelayMs={200}
                                          iconDescription={t(
                                            "editQuestion",
                                            "Edit question"
                                          )}
                                          onClick={() => {
                                            editQuestion();
                                            setPageIndex(pageIndex);
                                            setSectionIndex(sectionIndex);
                                            setQuestionIndex(questionIndex);
                                            setQuestionToEdit(question);
                                          }}
                                          renderIcon={(props) => (
                                            <Edit size={16} {...props} />
                                          )}
                                          hasIconOnly
                                        />
                                      </div>
                                    </div>
                                    <Button
                                      hasIconOnly
                                      enterDelayMs={200}
                                      iconDescription={t(
                                        "deleteQuestion",
                                        "Delete question"
                                      )}
                                      kind="ghost"
                                      onClick={() => {
                                        setPageIndex(pageIndex);
                                        setSectionIndex(sectionIndex);
                                        setQuestionIndex(questionIndex);
                                        setShowDeleteQuestionModal(true);
                                      }}
                                      renderIcon={(props) => (
                                        <TrashCan size={16} {...props} />
                                      )}
                                      size="sm"
                                    />
                                  </div>
                                )
                              )
                            ) : (
                              <p className={styles.explainer}>
                                {t(
                                  "sectionExplainer",
                                  "A section will typically contain one or more questions. Click the button below to add a question to this section."
                                )}
                              </p>
                            )}
                            <Button
                              className={styles.addQuestionButton}
                              kind="primary"
                              renderIcon={Add}
                              onClick={() => {
                                addQuestion();
                                setQuestionIndex(questionIndex);
                                setPageIndex(pageIndex);
                                setSectionIndex(sectionIndex);
                              }}
                              iconDescription={t("addQuestion", "Add Question")}
                            >
                              {t("addQuestion", "Add Question")}
                            </Button>
                          </div>
                        </>
                      </AccordionItem>
                    </Accordion>
                  ))
                ) : (
                  <p className={styles.explainer}>
                    {t(
                      "pageExplainer",
                      "Pages typically have one or more sections. Click the button below to add a section to your page."
                    )}
                  </p>
                )}
              </div>
              <Button
                className={styles.addSectionButton}
                kind="primary"
                renderIcon={Add}
                onClick={() => {
                  addSection();
                  setPageIndex(pageIndex);
                }}
                iconDescription={t("addSection", "Add Section")}
              >
                {t("addSection", "Add Section")}
              </Button>
            </div>
          ))
        : null}
    </div>
  );
};

export default InteractiveBuilder;
