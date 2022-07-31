import React from "react";
import { Column, Row, Tabs, Tab } from "carbon-components-react";
import { useTranslation } from "react-i18next";
import { showToast } from "@openmrs/esm-framework";
import SchemaEditorComponent from "./schema-editor/schema-editor.component";
import styles from "./form-editor.scss";
import { useParams } from "react-router-dom";
import { useFormSchema, useFormMetadata } from "../../api/fetchFormDetail";
import { Form, Schema } from "../../api/types";

const FormEditor: React.FC = () => {
  type State = {
    uuid: string;
  };
  const { t } = useTranslation();
  const { uuid } = useParams<State>();

  const GetFormMetaData = (formUUID: string) => {
    const { formMetaData, formMetaDataError } = useFormMetadata(formUUID);
    if (formMetaDataError) {
      showToast({
        title: t("error", "Error"),
        kind: "error",
        critical: true,
        description: `${formMetaDataError?.message}`,
      });
    }
    return formMetaData;
  };

  const GetFormSchema = (form: Form) => {
    const { formSchemaData, isSchemaLoading, formSchemaError } =
      useFormSchema(form);
    if (form?.resources.length !== 0) {
      if (formSchemaError) {
        showToast({
          title: t("error", "Error"),
          kind: "error",
          critical: true,
          description: `${formSchemaError?.message}`,
        });
      }
      if (isSchemaLoading) {
        return "Loading...";
      }
      return formSchemaData;
    } else {
      return GetRawSchema();
    }
  };

  const GetRawSchema = () => {
    const schema: Schema = {
      name: "",
      pages: [],
      processor: "EncounterFormProcessor",
      uuid: "xxx",
      referencedForms: [],
    };
    return schema;
  };

  const formData = uuid == "new" ? null : GetFormMetaData(uuid);
  const formSchema = uuid == "new" ? GetRawSchema() : GetFormSchema(formData);

  return (
    <div className={styles.wrap}>
      <Row>
        <Column lg={6} md={6} className={styles.grid}>
          <Tabs>
            <Tab label={t("schemaEditor", "Schema Editor")}>
              <SchemaEditorComponent schema={formSchema} />
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
