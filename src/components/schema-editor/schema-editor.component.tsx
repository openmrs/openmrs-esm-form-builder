import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/ext-language_tools";
import { Button, InlineLoading, ButtonSet } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { OHRIFormSchema } from "@openmrs/openmrs-form-engine-lib";

import { RouteParams, Schema } from "../../types";
import styles from "./schema-editor.scss";

type SchemaEditorProps = {
  isLoading: boolean;
  onSchemaChange: (schema: Schema) => void;
  schema: Schema;
  validateStateSetter;
};

const SchemaEditor: React.FC<SchemaEditorProps> = ({
  isLoading,
  onSchemaChange,
  schema,
  validateStateSetter
}) => {
  const { t } = useTranslation();
  const { formUuid } = useParams<RouteParams>();
  const isNewSchema = !formUuid;

  const [stringifiedSchema, setStringifiedSchema] = useState(
    schema ? JSON.stringify(schema, null, 2) : ""
  );
  const [invalidJsonErrorMessage, setInvalidJsonErrorMessage] = useState("");
  const [isRendering, setIsRendering] = useState(false);

  const resetErrorMessage = useCallback(() => {
    setInvalidJsonErrorMessage("");
  }, []);

  const handleSchemaChange = useCallback((updatedSchema: string) => {
    setStringifiedSchema(updatedSchema);
  }, []);

  const inputDummySchema = useCallback(() => {
    const dummySchema: OHRIFormSchema = {
      encounterType: "",
      name: "Sample Form",
      processor: "EncounterFormProcessor",
      referencedForms: [],
      uuid: "",
      version: "1.0",
      pages: [
        {
          label: "First Page",
          sections: [
            {
              label: "A Section",
              isExpanded: "true",
              questions: [
                {
                  label: "A Question of type obs that renders a text input",
                  type: "obs",
                  questionOptions: {
                    rendering: "text",
                    concept: "a-system-defined-concept-uuid",
                  },
                  id: "sampleQuestion",
                },
              ],
            },
            {
              label: "Another Section",
              isExpanded: "true",
              questions: [
                {
                  label:
                    "Another Question of type obs whose answers get rendered as radio inputs",
                  type: "obs",
                  questionOptions: {
                    rendering: "radio",
                    concept: "system-defined-concept-uuid",
                    answers: [
                      {
                        concept: "another-system-defined-concept-uuid",
                        label: "Choice 1",
                        conceptMappings: [],
                      },
                      {
                        concept: "yet-another-system-defined-concept-uuid",
                        label: "Choice 2",
                        conceptMappings: [],
                      },
                      {
                        concept: "yet-one-more-system-defined-concept-uuid",
                        label: "Choice 3",
                        conceptMappings: [],
                      },
                    ],
                  },
                  id: "anotherSampleQuestion",
                },
              ],
            },
          ],
        },
      ],
    };

    setStringifiedSchema(JSON.stringify(dummySchema, null, 2));
    onSchemaChange({ ...dummySchema });
  }, [onSchemaChange]);

  const renderSchemaChanges = useCallback(() => {
    setIsRendering(true);
    resetErrorMessage();

    try {
      const parsedJson: Schema = JSON.parse(stringifiedSchema);
      onSchemaChange(parsedJson);
      setStringifiedSchema(JSON.stringify(parsedJson, null, 2));
    } catch (error) {
      setInvalidJsonErrorMessage(error.message);
    }
    setIsRendering(false);
  }, [stringifiedSchema, onSchemaChange, resetErrorMessage]);

  useEffect(() => {
    setStringifiedSchema(JSON.stringify(schema, null, 2));
  }, [schema]);

  return (
    <>
      <div className={styles.actionButtons}>
        {isLoading ? (
          <InlineLoading
            description={t("loadingSchema", "Loading schema") + "..."}
          />
        ) : null}

        {isNewSchema && !stringifiedSchema ? (
          <Button kind="secondary" onClick={inputDummySchema}>
            {t("inputDummySchema", "Input dummy schema")}
          </Button>
        ) : null}

        {schema ? (
          <ButtonSet>
              <Button
              onClick={()=> validateStateSetter()}
              disabled={schema? false : true}
              >
                Validate Form
            </Button>
             <Button
            disabled={isRendering}
            kind="primary"
            onClick={renderSchemaChanges}
          >
            {isRendering ? (
              <InlineLoading
                className={styles.spinner}
                description={t("render", "Render" + "...")}
              />
            ) : (
              <span>{t("renderChanges", "Render changes")}</span>
            )}
          </Button>
          </ButtonSet>
         
        ) : null}
      </div>

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
        onChange={handleSchemaChange}
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
