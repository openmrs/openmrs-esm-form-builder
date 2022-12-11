import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionItem,
  Button,
  FormGroup,
  InlineLoading,
  TextInput,
} from "@carbon/react";
import { Add } from "@carbon/react/icons";
import { useParams } from "react-router-dom";
import { OHRIFormSchema } from "@ohri/openmrs-ohri-form-engine-lib";
import { RouteParams, Schema } from "../../types";
import NewFormModal from "./new-form-modal.component";
import PageModal from "./page-modal.component";
import SectionModal from "./section-modal.component";
import QuestionModal from "./question-modal.component";
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
  const [questionLabel, setQuestionLabel] = useState("");
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

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

  return (
    <div className={styles.container}>
      {isLoading ? (
        <InlineLoading
          description={t("loadingSchema", "Loading schema") + "..."}
        />
      ) : null}

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
        <QuestionModal
          schema={schema}
          onSchemaChange={onSchemaChange}
          pageIndex={pageIndex}
          sectionIndex={sectionIndex}
          questionIndex={questionIndex}
          resetIndices={resetIndices}
          showModal={showAddQuestionModal}
          onModalChange={setShowAddQuestionModal}
        />
      ) : null}

      {schema?.name && (
        <>
          <div className={styles.header}>
            <p className={styles.explainer}>
              {t(
                "welcomeText",
                "Welcome to the Interactive Schema builder! Add pages, sections and questions to your form. The Preview on the right automatically updates as you build your form. When done, click Save Form to save your form."
              )}
            </p>
            <Button
              kind="primary"
              renderIcon={Add}
              onClick={addPage}
              iconDescription={t("addPage", "Add Page")}
            >
              {t("addPage", "Add Page")}
            </Button>
          </div>
          <h1 className={styles.heading}>{schema.name}</h1>
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
            <div className={styles.pageContainer}>
              <h2 className={styles.styledHeading}>{page.label}</h2>
              <div className={styles.accordionContainer}>
                {page?.sections?.length ? (
                  <p className={styles.explainer}>
                    {t(
                      "expandSectionExplainer",
                      "Below are the sections linked to this page. Expand each section to add questions to it."
                    )}
                  </p>
                ) : null}
                {page?.sections?.length ? (
                  page.sections?.map((section, sectionIndex) => (
                    <Accordion className={styles.accordion}>
                      <AccordionItem title={section.label}>
                        {section.questions?.length ? (
                          section.questions.map((question, questionIndex) => (
                            <div className={styles.questionsContainer}>
                              <FormGroup legendText={""}>
                                <TextInput
                                  id="questionLabel"
                                  labelText={question.label}
                                  value={""}
                                  onChange={(event) =>
                                    setQuestionLabel(event.target.value)
                                  }
                                  required
                                />
                              </FormGroup>
                            </div>
                          ))
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
