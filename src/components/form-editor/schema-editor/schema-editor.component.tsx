import React from "react";
import { showToast } from "@openmrs/esm-framework";
import { Button, Loading } from "carbon-components-react";
import styles from "./schema-editor.scss";
import AceEditor from "react-ace";
import { useTranslation } from "react-i18next";

interface SchemaParameters {
  schema: any;
}

const SchemaEditorComponent: React.FC<SchemaParameters> = (schema) => {
  const { t } = useTranslation();
  let formSchema: string;

  const updateFormJson = (value) => {
    formSchema = value;
  };

  const render = () => {
    try {
      typeof formSchema == "string" ? JSON.parse(formSchema) : formSchema;
    } catch (error) {
      showToast({
        title: t("error", "Error"),
        kind: "error",
        critical: true,
        description: `${error}`,
      });
    }
  };

  return (
    <div>
      <h4>{t("schemaEditor", "Schema Editor")}</h4>
      <AceEditor
        placeholder="Schema"
        mode="json"
        theme="github"
        name="schemaEditor"
        onChange={updateFormJson}
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        value={JSON.stringify(schema?.schema, null, "\t")}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          displayIndentGuides: false,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
      <Button className={styles.renderButton} onClick={render}>
        {t("render", "Render")}
      </Button>
    </div>
  );
};
export default SchemaEditorComponent;
