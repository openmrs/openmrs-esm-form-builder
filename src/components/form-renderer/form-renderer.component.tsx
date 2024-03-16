import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { Button, Loading, Tile } from '@carbon/react';
import { type OHRIFormSchema, OHRIForm } from '@openmrs/openmrs-form-engine-lib';
import styles from './form-renderer.scss';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface FormRendererProps {
  isLoading: boolean;
  onSchemaChange?: (schema: OHRIFormSchema) => void;
  schema: OHRIFormSchema;
}

// enhance loading state with a progress bar or an animated loader
const LoadingUI = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.loadingContainer}>
      {/* animated loading indicator */}
      <Loading description={t('loading', 'Loading')} withOverlay={false} />
      <p className={styles.loadingText}>{t('loadingForm', 'Loading form...')}</p>
    </div>
  );
};

const FormRenderer: React.FC<FormRendererProps> = ({ isLoading, schema }) => {
  const { t } = useTranslation();

  const dummySchema: OHRIFormSchema = {
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

  const [schemaToRender, setSchemaToRender] = useState<OHRIFormSchema>(dummySchema);

  useEffect(() => {
    if (schema) {
      setSchemaToRender(schema);
    }
  }, [schema]);

  if (isLoading) {
    // render the enhanced loading UI
    return <LoadingUI />;
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
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <OHRIForm formJson={schemaToRender} mode={'enter'} patientUUID={''} />
        </ErrorBoundary>
      )}
    </div>
  );
};

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const { t } = useTranslation();
  return (
    <Tile className={styles.errorStateTile}>
      <h4 className={styles.heading}>{t('problemLoadingPreview', 'There was a problem loading the form preview')}</h4>
      <p className={styles.helperText}>
        <pre>{error.message}</pre>
      </p>
      <Button kind="primary" onClick={resetErrorBoundary}>
        {t('tryAgain', 'Try again')}
      </Button>
    </Tile>
  );
}

export default FormRenderer;
