import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Accordion, AccordionItem, Button, InlineLoading } from "@carbon/react";
import { Add, Edit } from "@carbon/react/icons";
import { useParams } from "react-router-dom";
import { showToast, showNotification } from "@openmrs/esm-framework";
import { OHRIFormSchema } from "@ohri/openmrs-ohri-form-engine-lib";

import { RouteParams, Schema } from "../../types";
import ActionButtons from "../action-buttons/action-buttons.component";
import AddQuestionModal from "./add-question-modal.component";
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
  const [formName, setFormName] = useState(schema ? schema.name : "");
  const [pageName, setPageName] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);

  const initializeSchema = () => {
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
  };

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

  const renameSchema = (value) => {
    try {
      if (value) {
        schema.name = value;
      } else {
        schema.name = formName;
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
  };

  const renamePage = (name, pageIndex) => {
    try {
      if (name) {
        schema.pages[pageIndex].label = name;
      } else if (pageName) {
        schema.pages[pageIndex].label = pageName;
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
  };

  const renameSection = (name, pageIndex, sectionIndex) => {
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
  };

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
          questionToEdit={questionToEdit}
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
                  "Add pages, sections and questions to your form. The Preview tab automatically updates as you build your form."
                )}
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
              onChange={(event) => setFormName(event.target.value)}
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
              "The Interactive Builder lets you build your form schema without writing JSON code. The Preview on the right automatically updates as you build your form. When done, click Save Form to save your form."
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
              <div className={styles.editorContainer}>
                <EditableValue
                  elementType="page"
                  id="pageNameInput"
                  value={schema.pages[pageIndex].label}
                  onChange={(event) => setPageName(event.target.value)}
                  onSave={(name) => renamePage(name, pageIndex)}
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
                          <div className={styles.editorContainer}>
                            <EditableValue
                              elementType="section"
                              id="sectionNameInput"
                              value={section.label}
                              onChange={(event) =>
                                setSectionName(event.target.value)
                              }
                              onSave={(name) =>
                                renameSection(name, pageIndex, sectionIndex)
                              }
                            />
                          </div>
                          <div>
                            {section.questions?.length ? (
                              section.questions.map(
                                (question, questionIndex) => (
                                  <div className={styles.editorContainer}>
                                    <p className={styles.questionLabel}>
                                      {question.label}
                                    </p>
                                    <Button
                                      kind="ghost"
                                      size="sm"
                                      iconDescription={t(
                                        "editNameButton",
                                        "Edit"
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
