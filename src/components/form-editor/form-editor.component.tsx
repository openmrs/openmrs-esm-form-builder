import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Column,
  ComposedModal,
  InlineLoading,
  InlineNotification,
  Form,
  Grid,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
} from "@carbon/react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExtensionSlot } from "@openmrs/esm-framework";
import type { OHRIFormSchema } from "@openmrs/openmrs-form-engine-lib";

import type { Schema, RouteParams } from "../../types";
import { useClobdata } from "../../hooks/useClobdata";
import { useForm } from "../../hooks/useForm";
import ActionButtons from "../action-buttons/action-buttons.component";
import FormRenderer from "../form-renderer/form-renderer.component";
import InteractiveBuilder from "../interactive-builder/interactive-builder.component";
import SchemaEditor from "../schema-editor/schema-editor.component";
import styles from "./form-editor.scss";

type ErrorProps = {
  error: Error;
  title: string;
};

type Status = "idle" | "formLoaded" | "schemaLoaded";

const Error = ({ error, title }: ErrorProps) => {
  return (
    <InlineNotification
      className={styles.errorNotification}
      kind={"error"}
      lowContrast
      subtitle={error?.message}
      title={title}
    />
  );
};

const FormEditor: React.FC = () => {
  const { t } = useTranslation();
  const { formUuid } = useParams<RouteParams>();
  const isNewSchema = !formUuid;
  const [schema, setSchema] = useState<Schema>();
  const [showDraftSchemaModal, setShowDraftSchemaModal] = useState(false);
  const { form, formError, isLoadingForm } = useForm(formUuid);
  const { clobdata, clobdataError, isLoadingClobdata } = useClobdata(form);
  const [status, setStatus] = useState<Status>("idle");
  const [stringifiedSchema, setStringifiedSchema] = useState(
    schema ? JSON.stringify(schema, null, 2) : ""
  );

  const isLoadingFormOrSchema =
    formUuid && (isLoadingClobdata || isLoadingForm);

  useEffect(() => {
    if (formUuid) {
      if (form && Object.keys(form).length > 0) {
        setStatus("formLoaded");
      }

      if (
        status === "formLoaded" &&
        !isLoadingClobdata &&
        clobdata === undefined
      ) {
        setShowDraftSchemaModal(true);
      }

      if (clobdata && Object.keys(clobdata).length > 0) {
        setStatus("schemaLoaded");
        setSchema(clobdata);
        localStorage.setItem("formJSON", JSON.stringify(clobdata));
      }
    }
  }, [
    clobdata,
    form,
    formUuid,
    isLoadingClobdata,
    isLoadingFormOrSchema,
    status,
  ]);

  useEffect(() => {
    setStringifiedSchema(JSON.stringify(schema, null, 2));
  }, [schema]);

  const handleLoadDraftSchema = useCallback(() => {
    setShowDraftSchemaModal(false);
    const draftSchema = localStorage.getItem("formJSON");
    setSchema(JSON.parse(draftSchema));
  }, []);

  const handleSchemaChange = useCallback((updatedSchema: string) => {
    setStringifiedSchema(updatedSchema);
  }, []);

  const updateSchema = useCallback((updatedSchema) => {
    setSchema(updatedSchema);
    localStorage.setItem("formJSON", JSON.stringify(updatedSchema));
  }, []);

  const inputDummySchema = useCallback(() => {
    const dummySchema: OHRIFormSchema = {
      encounterType: "",
      name: "Sample Form",
      processor: "EncounterFormProcessor",
      referencedForms: [],
      uuid: "",
      version: "1.0",
      pages: [
        {
          label: "First Page",
          sections: [
            {
              label: "A Section",
              isExpanded: "true",
              questions: [
                {
                  label: "A Question of type obs that renders a text input",
                  type: "obs",
                  questionOptions: {
                    rendering: "text",
                    concept: "a-system-defined-concept-uuid",
                  },
                  id: "sampleQuestion",
                },
              ],
            },
            {
              label: "Another Section",
              isExpanded: "true",
              questions: [
                {
                  label:
                    "Another Question of type obs whose answers get rendered as radio inputs",
                  type: "obs",
                  questionOptions: {
                    rendering: "radio",
                    concept: "system-defined-concept-uuid",
                    answers: [
                      {
                        concept: "another-system-defined-concept-uuid",
                        label: "Choice 1",
                        conceptMappings: [],
                      },
                      {
                        concept: "yet-another-system-defined-concept-uuid",
                        label: "Choice 2",
                        conceptMappings: [],
                      },
                      {
                        concept: "yet-one-more-system-defined-concept-uuid",
                        label: "Choice 3",
                        conceptMappings: [],
                      },
                    ],
                  },
                  id: "anotherSampleQuestion",
                },
              ],
            },
          ],
        },
      ],
    };

    setStringifiedSchema(JSON.stringify(dummySchema, null, 2));
    updateSchema({ ...dummySchema });
  }, [updateSchema]);

  const [invalidJsonErrorMessage, setInvalidJsonErrorMessage] = useState("");

  const resetErrorMessage = useCallback(() => {
    setInvalidJsonErrorMessage("");
  }, []);

  const renderSchemaChanges = useCallback(() => {
    resetErrorMessage();

    try {
      const parsedJson: Schema = JSON.parse(stringifiedSchema);
      updateSchema(parsedJson);
      setStringifiedSchema(JSON.stringify(parsedJson, null, 2));
    } catch (error) {
      setInvalidJsonErrorMessage(error.message);
    }
  }, [stringifiedSchema, updateSchema, resetErrorMessage]);

  const DraftSchemaModal = () => {
    return (
      <ComposedModal
        open={showDraftSchemaModal}
        onClose={() => setShowDraftSchemaModal(false)}
        preventCloseOnClickOutside
      >
        <ModalHeader title={t("schemaNotFound", "Schema not found")} />
        <Form onSubmit={(event) => event.preventDefault()}>
          <ModalBody>
            <p>
              {t(
                "schemaNotFoundText",
                "The schema originally associated with this form could not be found. A draft schema was found saved in your browser's local storage. Would you like to load it instead?"
              )}
            </p>
          </ModalBody>
        </Form>
        <ModalFooter>
          <Button
            onClick={() => setShowDraftSchemaModal(false)}
            kind="secondary"
          >
            {t("cancel", "Cancel")}
          </Button>
          <Button onClick={handleLoadDraftSchema}>
            <span>{t("loadDraft", "Load draft")}</span>
          </Button>
        </ModalFooter>
      </ComposedModal>
    );
  };

  return (
    <>
      <div className={styles.breadcrumbsContainer}>
        <ExtensionSlot name="breadcrumbs-slot" />
      </div>
      <div className={styles.container}>
        {showDraftSchemaModal && <DraftSchemaModal />}
        <Grid className={styles.grid}>
          <Column lg={8} md={8} className={styles.column}>
            <div className={styles.actionButtons}>
              {isLoadingFormOrSchema ? (
                <InlineLoading
                  description={t("loadingSchema", "Loading schema") + "..."}
                />
              ) : null}

              {isNewSchema && !schema ? (
                <Button kind="ghost" onClick={inputDummySchema}>
                  {t("inputDummySchema", "Input dummy schema")}
                </Button>
              ) : null}

              {schema ? (
                <Button kind="ghost" onClick={renderSchemaChanges}>
                  <span>{t("renderChanges", "Render changes")}</span>
                </Button>
              ) : null}
            </div>
            <div>
              <span className={styles.tabHeading}>
                {t("schemaEditor", "Schema Editor")}
              </span>
              {formError ? (
                <Error
                  error={formError}
                  title={t("formError", "Error loading form metadata")}
                />
              ) : null}
              {clobdataError ? (
                <Error
                  error={clobdataError}
                  title={t("schemaLoadError", "Error loading schema")}
                />
              ) : null}
              <div className={styles.editorContainer}>
                <SchemaEditor
                  invalidJsonErrorMessage={invalidJsonErrorMessage}
                  isLoading={isLoadingFormOrSchema}
                  onSchemaChange={handleSchemaChange}
                  stringifiedSchema={stringifiedSchema}
                />
              </div>
            </div>
          </Column>
          <Column lg={8} md={8} className={styles.column}>
            <ActionButtons schema={schema} t={t} />
            <Tabs>
              <TabList aria-label="Form previews">
                <Tab>{t("preview", "Preview")}</Tab>
                <Tab>{t("interactiveBuilder", "Interactive Builder")}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <FormRenderer
                    schema={schema}
                    isLoading={isLoadingFormOrSchema}
                  />
                </TabPanel>
                <TabPanel>
                  <InteractiveBuilder
                    schema={schema}
                    onSchemaChange={updateSchema}
                    isLoading={isLoadingFormOrSchema}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Column>
        </Grid>
      </div>
    </>
  );
};

export default FormEditor;
