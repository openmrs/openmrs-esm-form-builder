import React, { useCallback, useEffect, useState } from "react";
import {
  Column,
  InlineNotification,
  Grid,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
} from "@carbon/react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExtensionSlot } from "@openmrs/esm-framework";
import { Schema, RouteParams } from "../../types";
import { useClobdata } from "../../hooks/useClobdata";
import { useForm } from "../../hooks/useForm";
import FormRenderer from "../form-renderer/form-renderer.component";
import InteractiveBuilder from "../interactive-builder/interactive-builder.component";
import SchemaEditor from "../schema-editor/schema-editor.component";
import styles from "./form-editor.scss";

const Error = ({ error, title }) => {
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
  const { form, formError, isLoadingForm } = useForm(formUuid);
  const { clobdata, clobdataError, isLoadingClobdata } = useClobdata(form);
  const isLoadingFormOrSchema =
    formUuid && (isLoadingClobdata || isLoadingForm);

  useEffect(() => {
    if (!isLoadingClobdata && clobdata) {
      setSchema(clobdata);
      localStorage.setItem("formJSON", JSON.stringify(clobdata));
    } else {
      const draftJSON = localStorage.getItem("formJSON");
      setSchema(JSON.parse(draftJSON));
    }
  }, [clobdata, isLoadingClobdata, setSchema]);

  const updateSchema = useCallback((updatedSchema) => {
    setSchema(updatedSchema);
    localStorage.setItem("formJSON", JSON.stringify(updatedSchema));
  }, []);

  return (
    <>
      <div className={styles.breadcrumbsContainer}>
        <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
      </div>
      <div className={styles.container}>
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
