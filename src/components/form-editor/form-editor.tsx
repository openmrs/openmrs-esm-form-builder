import React, { useEffect, useState } from "react";
import {
  Column,
  InlineNotification,
  Grid,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Button,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import SchemaEditorComponent from "./schema-editor/schema-editor.component";
import styles from "./form-editor.scss";
import { useParams } from "react-router-dom";
import SaveForm from "./modals/save-form";
import { showToast, ExtensionSlot } from "@openmrs/esm-framework";
import { useClobdata } from "../../hooks/useClobdata";
import { useForm } from "../../hooks/useForm";
import { publish, unpublish } from "../../forms.resource";
import ElementEditor from "./element-editor/element-editor";
import FormRenderer from "./form-renderer/form-renderer";
import { Schema } from "../../types";

type Route = {
  formUuid: string;
};

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
  const [schema, setSchema] = useState<Schema>(undefined);
  const { formUuid } = useParams<Route>();
  const { form, formError, isLoadingForm } = useForm(formUuid);
  const { clobdata, clobdataError, isLoadingClobdata } = useClobdata(form);

  const updateSchema = (updatedSchema) => {
    setSchema(updatedSchema);
  };

  const handlePublishState = async (option) => {
    if (option == "publish") {
      try {
        await publish(form?.uuid);
        showToast({
          title: t("success", "Success!"),
          kind: "success",
          critical: true,
          description: t("publishedSuccess", "Form Published"),
        });
      } catch (error) {
        showToast({
          title: t("error", "Error"),
          kind: "error",
          critical: true,
          description: error?.message,
        });
      }
    } else if (option == "unpublish") {
      try {
        await unpublish(form?.uuid);
        showToast({
          title: t("success", "Success!"),
          kind: "success",
          critical: true,
          description: t("unpublishedSuccess", "Form Unpublished"),
        });
      } catch (error) {
        showToast({
          title: t("error", "Error"),
          kind: "error",
          critical: true,
          description: error?.message,
        });
      }
    }
    window.location.reload();
  };

  useEffect(() => {
    if (!isLoadingClobdata) {
      setSchema(clobdata);
    }
  }, [clobdata, isLoadingClobdata]);

  return (
    <>
      <div className={styles.breadcrumbsContainer}>
        <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
      </div>
      <div className={styles.container}>
        <div className={styles.actionsContainer}>
          <SaveForm form={form} schema={schema} />

          {form?.published == true ? (
            <Button
              className={styles.optionButtons}
              onClick={() => handlePublishState("unpublish")}
              kind="primary"
            >
              {t("unpublishForm", "Unpublish form")}
            </Button>
          ) : form?.published == false ? (
            <Button
              className={styles.optionButtons}
              onClick={() => handlePublishState("publish")}
              kind="primary"
            >
              {t("publishForm", "Publish form")}
            </Button>
          ) : (
            <Button className={styles.optionButtons} kind="primary" disabled>
              {t("publishForm", "Publish form")}
            </Button>
          )}
        </div>
        <Grid className={styles.grid}>
          <Column lg={8} md={8} className={styles.column}>
            <Tabs>
              <TabList>
                <Tab>{t("schemaEditor", "Schema Editor")}</Tab>
                <Tab>{t("interactiveBuilder", "Interactive Builder")}</Tab>
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
                    <SchemaEditorComponent
                      schema={schema}
                      onSchemaUpdate={updateSchema}
                      isLoading={
                        formUuid && (isLoadingClobdata || isLoadingForm)
                      }
                    />
                  </>
                </TabPanel>
                <TabPanel>
                  <ElementEditor
                    schema={schema}
                    onSchemaUpdate={updateSchema}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Column>
          <Column lg={8} md={8} className={styles.column}>
            <Tabs>
              <TabList>
                <Tab>{t("formViewer", "Form Viewer")}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <div className={styles.renderComponent}>
                    <FormRenderer
                      schema={schema}
                      onSchemaUpdate={updateSchema}
                    />
                  </div>
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
