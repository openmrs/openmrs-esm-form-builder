import React from "react";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/ext-language_tools";
import { useTranslation } from "react-i18next";
import styles from "./schema-editor.scss";

type SchemaEditorProps = {
  isLoading: boolean;
  invalidJsonErrorMessage: string;
  onSchemaChange: (stringifiedSchema: string) => void;
  stringifiedSchema: string;
};

const SchemaEditor: React.FC<SchemaEditorProps> = ({
  invalidJsonErrorMessage,
  onSchemaChange,
  stringifiedSchema,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {invalidJsonErrorMessage ? (
        <div className={styles.errorContainer}>
          <p className={styles.heading}>
            {t("schemaError", "There's an error in your schema.")}
          </p>
          <p>{invalidJsonErrorMessage}</p>
        </div>
      ) : null}

      <AceEditor
        style={{ height: "100vh", width: "100%" }}
        mode="json"
        theme="textmate"
        name="schemaEditor"
        onChange={onSchemaChange}
        fontSize={15}
        showPrintMargin={false}
        showGutter={true}
        highlightActiveLine={true}
        value={stringifiedSchema}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          displayIndentGuides: true,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
    </>
  );
};

export default SchemaEditor;
