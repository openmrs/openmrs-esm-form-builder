import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import { Button, InlineLoading } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { OHRIFormSchema } from "@ohri/openmrs-ohri-form-engine-lib";
import { Schema } from "../../types";
import styles from "./schema-editor.scss";

type RouteParams = { formUuid: string };
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
  const { formUuid } = useParams<RouteParams>();
  const isNewSchema = !formUuid;
  const [formSchema, setFormSchema] = useState<string>("");
  const [invalidJsonErrorMessage, setInvalidJsonErrorMessage] = useState("");
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    const stringifiedSchema = JSON.stringify(schema, null, 2);
    setFormSchema(stringifiedSchema);
  }, [schema]);

  const resetErrorMessage = useCallback(() => {
    setInvalidJsonErrorMessage("");
  }, []);

  const handleSchemaChange = (updatedSchema: string) => {
    setFormSchema(updatedSchema);
  };

  const inputDummySchema = useCallback(() => {
    const dummySchema: OHRIFormSchema = {
      encounterType: "",
      name: "Test Form",
      pages: [
        {
          label: "Test Page",
          sections: [
            {
              label: "Test Section",
              isExpanded: "true",
              questions: [
                {
                  label: "Test Question",
                  type: "obs",
                  questionOptions: {
                    rendering: "text",
                    concept: "xxxx",
                  },
                  id: "testQuestion",
                },
              ],
            },
          ],
        },
      ],
      processor: "EncounterFormProcessor",
      referencedForms: [],
      uuid: "xxx",
    };

    onSchemaUpdate(dummySchema);
  }, [onSchemaUpdate]);

  const renderSchemaChanges = useCallback(() => {
    setIsRendering(true);
    resetErrorMessage();

    try {
      const parsedJson: Schema = JSON.parse(formSchema);
      onSchemaUpdate(parsedJson);
      setFormSchema(JSON.stringify(parsedJson, null, 2));
    } catch (error) {
      setInvalidJsonErrorMessage(error.message);
    }
    setIsRendering(false);
  }, [formSchema, onSchemaUpdate, resetErrorMessage]);

  return (
    <>
      <div className={styles.actionButtons}>
        {isLoading ? (
          <InlineLoading
            description={t("loadingSchema", "Loading schema") + "..."}
          />
        ) : null}

        {isNewSchema ? (
          <Button kind="secondary" onClick={inputDummySchema}>
            {t("inputDummySchema", "Input dummy schema")}
          </Button>
        ) : null}

        <Button
          disabled={isRendering}
          kind="primary"
          onClick={renderSchemaChanges}
        >
          {isRendering ? (
            <InlineLoading
              className={styles.spinner}
              description={t("rendering", "Rendering") + "..."}
            />
          ) : (
            <span>{t("renderChanges", "Render changes")}</span>
          )}
        </Button>
      </div>

      {invalidJsonErrorMessage ? (
        <div className={styles.errorMessage}>
          <p className={styles.heading}>
            {t("schemaError", "There's an error in your schema.")}
          </p>
          <p>{invalidJsonErrorMessage}</p>
        </div>
      ) : null}

      <AceEditor
        style={{ height: "100vh", width: "100%" }}
        placeholder=""
        mode="json"
        theme="textmate"
        name="schemaEditor"
        onChange={handleSchemaChange}
        fontSize={15}
        showPrintMargin={false}
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
    </>
  );
};

export default SchemaEditorComponent;
