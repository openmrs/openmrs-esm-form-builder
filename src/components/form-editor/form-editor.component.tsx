import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Column,
  ComposedModal,
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

import type { Schema, RouteParams } from "../../types";
import { useClobdata } from "../../hooks/useClobdata";
import { useForm } from "../../hooks/useForm";
import FormRenderer from "../form-renderer/form-renderer.component";
import InteractiveBuilder from "../interactive-builder/interactive-builder.component";
import SchemaEditor from "../schema-editor/schema-editor.component";
import styles from "./form-editor.scss";

type ErrorProps = {
  error: Error;
  title: string;
};

const Error = ({ error, title }: ErrorProps) => {
  return (
    <InlineNotification
      style={{
        minWidth: "100%",
        margin: "0rem",
        padding: "0rem",
      }}
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
  const [schema, setSchema] = useState<Schema>();
  const [showLoadDraftSchemaModal, setShowLoadDraftSchemaModal] =
    useState(false);
  const { form, formError, isLoadingForm } = useForm(formUuid);
  const { clobdata, clobdataError, isLoadingClobdata } = useClobdata(form);
  const isLoadingFormOrSchema =
    formUuid && (isLoadingClobdata || isLoadingForm);

  useEffect(() => {
    if (formUuid) {
      if (
        !isLoadingFormOrSchema &&
        clobdata &&
        Object.keys(clobdata).length > 0
      ) {
        setSchema(clobdata);
        localStorage.setItem("formJSON", JSON.stringify(clobdata));
      } else if (
        !isLoadingFormOrSchema &&
        (!clobdata || Object.keys(clobdata).length === 0)
      ) {
        setShowLoadDraftSchemaModal(true);
      }
    }
  }, [clobdata, formUuid, isLoadingFormOrSchema]);

  const updateSchema = useCallback((updatedSchema) => {
    setSchema(updatedSchema);
    localStorage.setItem("formJSON", JSON.stringify(updatedSchema));
  }, []);

  const LoadDraftSchema = useCallback(() => {
    return (
      <ComposedModal
        open={showLoadDraftSchemaModal}
        onClose={() => setShowLoadDraftSchemaModal(false)}
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
            onClick={() => setShowLoadDraftSchemaModal(false)}
            kind="secondary"
          >
            {t("cancel", "Cancel")}
          </Button>
          <Button
            onClick={() => {
              setShowLoadDraftSchemaModal(false);
              const draftJSON = localStorage.getItem("formJSON");
              setSchema(JSON.parse(draftJSON));
            }}
          >
            <span>{t("loadDraft", "Load draft")}</span>
          </Button>
        </ModalFooter>
      </ComposedModal>
    );
  }, [showLoadDraftSchemaModal, t]);

  return (
    <>
      <div className={styles.breadcrumbsContainer}>
        <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
      </div>
      <div className={styles.container}>
        {showLoadDraftSchemaModal && <LoadDraftSchema />}
        <Grid className={styles.grid}>
          <Column lg={8} md={8} className={styles.column}>
            <Tabs>
              <TabList>
                <Tab>{t("schemaEditor", "Schema Editor")}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <>
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
                    <SchemaEditor
                      schema={schema}
                      onSchemaChange={updateSchema}
                      isLoading={isLoadingFormOrSchema}
                    />
                  </>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Column>
          <Column lg={8} md={8} className={styles.column}>
            <Tabs>
              <TabList>
                <Tab>{t("preview", "Preview")}</Tab>
                <Tab>{t("interactiveBuilder", "Interactive Builder")}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <FormRenderer
                    schema={schema}
                    onSchemaChange={updateSchema}
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
