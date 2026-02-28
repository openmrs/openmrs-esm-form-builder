import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { InlineLoading, Tile } from '@carbon/react';
import { type FormSchema, FormEngine } from '@openmrs/esm-form-engine-lib';
import styles from './form-renderer.scss';

interface ErrorFallbackProps {
  error: Error;
}

interface FormRendererProps {
  isLoading: boolean;
  onSchemaChange?: (schema: FormSchema) => void;
  schema: FormSchema;
}

const FormRenderer: React.FC<FormRendererProps> = ({ isLoading, schema }) => {
  const { t } = useTranslation();

  const dummySchema: FormSchema = {
    encounterType: '',
    name: 'Test Form',
    pages: [
      {
        label: 'Test Page',
        sections: [
          {
            label: 'Test Section',
            isExpanded: 'true',
            questions: [
              {
                label: 'Test Question',
                type: 'obs',
                questionOptions: {
                  rendering: 'text',
                  concept: 'xxxx',
                },
                id: 'testQuestion',
              },
            ],
          },
        ],
      },
    ],
    processor: 'EncounterFormProcessor',
    referencedForms: [],
    uuid: 'xxx',
  };

  const [schemaToRender, setSchemaToRender] = useState<FormSchema>(dummySchema);

  useEffect(() => {
    if (schema) {
      setSchemaToRender(schema);
    }
  }, [schema]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading className={styles.loader} description={t('loading', 'Loading') + '...'} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {!schema && (
        <Tile className={styles.emptyStateTile}>
          <h4 className={styles.heading}>{t('noSchemaLoaded', 'No schema loaded')}</h4>
          <p className={styles.helperText}>
            {t(
              'formRendererHelperText',
              'Load a form schema in the Schema Editor to the left to see it rendered here by the Form Engine.',
            )}
          </p>
        </Tile>
      )}
      {schema === schemaToRender && (
        <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[schemaToRender]}>
          <FormEngine formJson={schemaToRender} mode={'enter'} patientUUID={''} />
        </ErrorBoundary>
      )}
    </div>
  );
};

function ErrorFallback({ error }: ErrorFallbackProps) {
  const { t } = useTranslation();
  return (
    <Tile className={styles.errorStateTile}>
      <h4 className={styles.heading}>{t('problemLoadingPreview', 'There was a problem loading the form preview')}</h4>
      <p className={styles.helperText}>
        <pre>{error.message}</pre>
      </p>
      <p className={styles.helperText}>
        {t('fixSchemaAndRender', 'Fix the error in the Schema Editor and click "Render changes" to retry.')}
      </p>
    </Tile>
  );
}

export default FormRenderer;
