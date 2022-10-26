import React, { useEffect, useState } from "react";
import {
  Column,
  Row,
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
import { useFormSchema, useFormMetadata } from "../../api/fetchFormDetail";
import SaveForm from "./modals/save-form";
import { SchemaContext } from "../../context/context";
import { publish, unpublish } from "../../api/saveForm";
import { showToast } from "@openmrs/esm-framework";
import ElementEditor from "./element-editor/element-editor";
import FormRenderer from "./form-renderer/form-renderer";

const FormEditor: React.FC = () => {
  type Route = {
    uuid: string;
  };
  const { t } = useTranslation();
  const { uuid } = useParams<Route>();
  const { formMetaData } = useFormMetadata(uuid);
  const { formSchemaData, isLoading } = useFormSchema(formMetaData);
  const [schema, setSchema] = useState<any>();

  const handlePublishState = async (option) => {
    if (option == "publish") {
      try {
        await publish(formMetaData?.uuid);
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
        await unpublish(formMetaData?.uuid);
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
    if (!isLoading) {
      setSchema(formSchemaData);
    }
  }, [isLoading]);

  return (
    <SchemaContext.Provider value={{ schema, setSchema }}>
      <div className={styles.wrap}>
        <Row className={styles.optionRow}>
          <SaveForm form={formMetaData} />
          {/* TODO: Add reference form feature */}
          {/* <Button className={styles.optionButtons} kind="tertiary">
            {t("referenceForm", "Reference Form")}
          </Button> */}
          {formMetaData?.published == true ? (
            <Button
              className={styles.optionButtons}
              onClick={() => handlePublishState("unpublish")}
              kind="primary"
            >
              {t("unpublishForm", "Unpublish form")}
            </Button>
          ) : formMetaData?.published == false ? (
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
        </Row>
        <Grid className={styles.grid}>
          <Column lg={8} md={8} className={styles.column}>
            <Tabs>
              <TabList>
                <Tab>{t("schemaEditor", "Schema Editor")}</Tab>
                <Tab>{t("interactiveBuilder", "Interactive Builder")}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <SchemaEditorComponent />
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
