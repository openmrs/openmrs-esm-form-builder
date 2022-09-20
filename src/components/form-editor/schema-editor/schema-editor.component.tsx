import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button } from "carbon-components-react";
import styles from "./schema-editor.scss";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import { useTranslation } from "react-i18next";
import { SchemaContext } from "../../../context/context";

const SchemaEditorComponent: React.FC = () => {
  const { t } = useTranslation();
  const { schema, setSchema } = useContext(SchemaContext);
  const [formSchema, setFormSchema] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");

  const render = useCallback(() => {
    setErrorMessage("");
    try {
      let parsedJson = JSON.parse(formSchema);
      setFormSchema(JSON.stringify(parsedJson, null, 2));
      setSchema(parsedJson);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }, [formSchema, setSchema]);

  useEffect(() => {
    setFormSchema(JSON.stringify(schema, null, 2));
  }, [schema]);

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
        onChange={(value) => setFormSchema(value)}
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
