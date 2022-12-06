import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { OHRIFormSchema, OHRIForm } from "@ohri/openmrs-ohri-form-engine-lib";
import { Tile } from "@carbon/react";
import { useConfig } from "@openmrs/esm-framework";
import styles from "./form-renderer.scss";

type FormRendererProps = {
  onSchemaUpdate?: (schema: OHRIFormSchema) => void;
  schema: OHRIFormSchema;
};

const FormRenderer: React.FC<FormRendererProps> = ({ schema }) => {
  const { t } = useTranslation();
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

  const [schemaToRender, setSchemaToRender] =
    useState<OHRIFormSchema>(dummySchema);

  useEffect(() => {
    if (schema) {
      setSchemaToRender(schema);
    }
  }, [schema]);

  return (
    <div className={styles.container}>
      {!schema && (
        <Tile className={styles.emptyStateTile}>
          <h4 className={styles.heading}>
            {t("noSchemaLoaded", "No schema loaded")}
          </h4>
          <p className={styles.helperText}>
            {t(
              "formRendererHelperText",
              "Load a form schema in the Schema Editor to the left to see it rendered here by the Form Engine."
            )}
          </p>
        </Tile>
      )}
      {schema === schemaToRender && (
        <OHRIForm
          formJson={schemaToRender}
          mode={"enter"}
          patientUUID={patientUuid}
        />
      )}
    </div>
  );
};

export default FormRenderer;
