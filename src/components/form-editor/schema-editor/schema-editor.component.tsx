import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@carbon/react";
import styles from "./schema-editor.scss";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import { useTranslation } from "react-i18next";
import { Schema } from "../../../types";

type SchemaEditorProps = {
  isLoading: boolean;
  onSchemaUpdate: (schema: Schema) => void;
  schema: Schema;
};

const SchemaEditorComponent: React.FC<SchemaEditorProps> = ({
  isLoading,
  onSchemaUpdate,
  schema,
}) => {
  const { t } = useTranslation();
  const [formSchema, setFormSchema] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const stringifiedSchema = JSON.stringify(schema, null, 2);
    setFormSchema(stringifiedSchema);
  }, [schema]);

  const handleSchemaChange = (updatedSchema: string) => {
    setFormSchema(updatedSchema);
  };

  const render = useCallback(() => {
    setErrorMessage("");
    try {
      let parsedJson = JSON.parse(formSchema);
      onSchemaUpdate(parsedJson);
      setFormSchema(JSON.stringify(parsedJson, null, 2));
    } catch (error) {
      setErrorMessage(error.message);
    }
  }, [formSchema, onSchemaUpdate]);

  return (
    <div>
      <h4>{t("schemaEditor", "Schema Editor")}</h4>
      <div className={styles.inputErrorMessage}>{errorMessage}</div>
      <AceEditor
        className={styles.aceEditor}
        placeholder="Schema"
        mode="json"
        theme="github"
        name="schemaEditor"
        onChange={handleSchemaChange}
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        value={formSchema}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          displayIndentGuides: false,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
      <Button kind="tertiary" className={styles.renderButton} onClick={render}>
        {t("render", "Render")}
      </Button>
    </div>
  );
};
export default SchemaEditorComponent;
