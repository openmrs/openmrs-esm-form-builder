import React from "react";
import { Column, Row, Tabs, Tab } from "carbon-components-react";
import { useTranslation } from "react-i18next";
import SchemaEditorComponent from "./schema-editor/schema-editor.component";
import styles from "./form-editor.scss";
import { useParams } from "react-router-dom";
import { useFormSchema, useFormMetadata } from "../../api/fetchFormDetail";

const FormEditor: React.FC = () => {
  type Route = {
    uuid: string;
  };
  const { t } = useTranslation();
  const { uuid } = useParams<Route>();
  const { formMetaData } = useFormMetadata(uuid);
  const { formSchemaData } = useFormSchema(formMetaData);

  return (
    <div className={styles.wrap}>
      <Row>
        <Column lg={6} md={6} className={styles.grid}>
          <Tabs>
            <Tab label={t("schemaEditor", "Schema Editor")}>
              <SchemaEditorComponent schema={formSchemaData} />
            </Tab>
            <Tab label={t("interactiveBuilder", "Interactive Builder")}>
              {t("interactiveBuilder", "Interactive Builder")}
            </Tab>
          </Tabs>
        </Column>
        <Column lg={6} md={6}>
          <Tabs>
            <Tab label={t("formViewer", "Form Viewer")}>
              {t("formViewer", "Form Viewer")}
            </Tab>
          </Tabs>
        </Column>
      </Row>
    </div>
  );
};

export default FormEditor;
