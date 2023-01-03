import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { InlineLoading, Tile } from "@carbon/react";
import { OHRIFormSchema, OHRIForm } from "@ohri/openmrs-ohri-form-engine-lib";
import { useConfig } from "@openmrs/esm-framework";

import ActionButtons from "../action-buttons/action-buttons.component";
import styles from "./form-renderer.scss";

type FormRendererProps = {
  isLoading: boolean;
  onSchemaChange?: (schema: OHRIFormSchema) => void;
  schema: OHRIFormSchema;
};

const FormRenderer: React.FC<FormRendererProps> = ({ isLoading, schema }) => {
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

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading
          className={styles.loader}
          description={t("loading", "Loading") + "..."}
        />
      </div>
    );
  }

  return (
    <>
      <ActionButtons schema={schema} t={t} />

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
    </>
  );
};

export default FormRenderer;
