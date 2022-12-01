import React, { useEffect, useState } from "react";
import {
  SessionMode,
  OHRIFormSchema,
  OHRIForm,
} from "@ohri/openmrs-ohri-form-engine-lib";
import { Tile } from "@carbon/react";
import { useConfig } from "@openmrs/esm-framework";
import { Schema } from "../../types";
import styles from "./form-renderer.scss";

type FormRendererProps = {
  onSchemaUpdate: (schema: Schema) => void;
  schema: Schema;
};

const FormRenderer: React.FC<FormRendererProps> = ({
  onSchemaUpdate,
  schema,
}) => {
  const { patientUuid } = useConfig();

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

  const [sessionMode, setSessionMode] = useState<SessionMode>("enter");
  const [schemaToRender, setSchemaToRender] =
    useState<OHRIFormSchema>(dummySchema);

  useEffect(() => {
    if (schema) {
      setSchemaToRender(schema);
    }
  }, [schema]);

  return (
    <div className={styles.container}>
      {schema === schemaToRender ? (
        <OHRIForm
          formJson={schemaToRender}
          mode={sessionMode}
          patientUUID={patientUuid}
        />
      ) : (
        <Tile className={styles.emptyStateTile}>
          <h4 className={styles.heading}>No schema loaded</h4>
          <p className={styles.helperText}>
            Load a form schema in the Schema Editor to the left to see it
            rendered here by the Form Engine.
          </p>
        </Tile>
      )}
    </div>
  );
};

export default FormRenderer;
