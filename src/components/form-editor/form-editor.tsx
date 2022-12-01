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
import { showToast } from "@openmrs/esm-framework";
import { SchemaContext } from "../../context/context";
import { useClobdata } from "../../hooks/useClobdata";
import { useFormMetadata } from "../../hooks/useFormMetadata";
import { publish, unpublish } from "../../forms.resource";
import ElementEditor from "./element-editor/element-editor";
import FormRenderer from "./form-renderer/form-renderer";

type Route = {
  uuid: string;
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
  const { uuid } = useParams<Route>();
  const { metadata } = useFormMetadata(uuid);
  const { clobdata, clobdataError, isLoadingClobdata } = useClobdata(metadata);
  const [schema, setSchema] = useState<any>();

  const handlePublishState = async (option) => {
    if (option == "publish") {
      try {
        await publish(metadata?.uuid);
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
        await unpublish(metadata?.uuid);
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
    <SchemaContext.Provider value={{ schema, setSchema }}>
      <div className={styles.wrapContainer}>
        <div className={styles.actionsContainer}>
          <SaveForm form={metadata} />
          {metadata?.published == true ? (
            <Button
              className={styles.optionButtons}
              onClick={() => handlePublishState("unpublish")}
              kind="primary"
            >
              {t("unpublishForm", "Unpublish form")}
            </Button>
          ) : metadata?.published == false ? (
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
                    {clobdataError ? (
                      <Error
                        error={clobdataError}
                        title={t("schemaLoadError", "Error loading schema")}
                      />
                    ) : null}
                    <SchemaEditorComponent />
                  </>
                </TabPanel>
                <TabPanel>
                  <ElementEditor />
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
                    <FormRenderer />
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Column>
        </Grid>
      </div>
    </SchemaContext.Provider>
  );
};

export default FormEditor;
