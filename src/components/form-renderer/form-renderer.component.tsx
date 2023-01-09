import React, { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { Button, InlineLoading, Tile } from "@carbon/react";
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
          <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {}}>
            <OHRIForm
              formJson={schemaToRender}
              mode={"enter"}
              patientUUID={patientUuid}
            />
          </ErrorBoundary>
        )}
      </div>
    </>
  );
};

function ErrorFallback({ error, resetErrorBoundary }) {
  const { t } = useTranslation();
  return (
    <Tile className={styles.errorStateTile}>
      <h4 className={styles.heading}>
        {t(
          "problemLoadingPreview",
          "There was a problem loading the schema preview"
        )}
      </h4>
      <p className={styles.helperText}>
        <pre>{error.message}</pre>
      </p>
      <Button kind="primary" onClick={resetErrorBoundary}>
        {t("tryAgain", "Try again")}
      </Button>
    </Tile>
  );
}

export default FormRenderer;
