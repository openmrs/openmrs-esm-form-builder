import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  Column,
  CopyButton,
  Dropdown,
  FileUploader,
  Grid,
  IconButton,
  InlineLoading,
  InlineNotification,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@carbon/react';
import { ArrowLeft, Maximize, Minimize, Download } from '@carbon/react/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { type TFunction } from 'i18next';
import { ConfigurableLink, showModal, useConfig } from '@openmrs/esm-framework';
import ActionButtons from '../action-buttons/action-buttons.component';
import AuditDetails from '../audit-details/audit-details.component';
import FormRenderer from '../form-renderer/form-renderer.component';
import Header from '../header/header.component';
import InteractiveBuilder from '../interactive-builder/interactive-builder.component';
import TranslationBuilder from '../translation-builder/translation-builder.component';
import SchemaEditor from '../schema-editor/schema-editor.component';
import ValidationMessage from '../validation-info/validation-info.component';
import { handleFormValidation } from '@resources/form-validator.resource';
import { mergeTranslatedSchema } from '../../utils/translationSchemaUtils';
import { useClobdata } from '@hooks/useClobdata';
import { useForm } from '@hooks/useForm';
import { useLanguageOptions } from '@hooks/getLanguageOptionsFromSession';
import type { IMarker } from 'react-ace';
import type { FormSchema } from '@openmrs/esm-form-engine-lib';
import type { Schema } from '@types';
import type { ConfigObject } from '../../config-schema';
import styles from './form-editor.scss';

interface ErrorProps {
  error: Error;
  title: string;
}

interface TranslationFnProps {
  readonly t: TFunction;
}

interface MarkerProps extends IMarker {
  text: string;
}

type Status = 'idle' | 'formLoaded' | 'schemaLoaded';

const ErrorNotification = ({ error, title }: ErrorProps) => {
  return (
    <InlineNotification
      className={styles.errorNotification}
      kind={'error'}
      lowContrast
      subtitle={error?.message}
      title={title}
    />
  );
};

const FormEditorContent: React.FC<TranslationFnProps> = ({ t }) => {
  const defaultEnterDelayInMs = 300;
  const { formUuid } = useParams<{ formUuid: string }>();
  const { blockRenderingWithErrors, dataTypeToRenderingMap } = useConfig<ConfigObject>();
  const isNewSchema = !formUuid;
  const [schema, setSchema] = useState<Schema>();
  const { form, formError, isLoadingForm } = useForm(formUuid);
  const { clobdata, clobdataError, isLoadingClobdata } = useClobdata(form);
  const [status, setStatus] = useState<Status>('idle');
  const [isMaximized, setIsMaximized] = useState(false);
  const [stringifiedSchema, setStringifiedSchema] = useState(schema ? JSON.stringify(schema, null, 2) : '');
  const [validationResponse, setValidationResponse] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  const [publishedWithErrors, setPublishedWithErrors] = useState(false);
  const [errors, setErrors] = useState<Array<MarkerProps>>([]);
  const [validationOn, setValidationOn] = useState(false);
  const [invalidJsonErrorMessage, setInvalidJsonErrorMessage] = useState('');
  const languageOptions = useLanguageOptions();
  const [selectedLanguageCode, setSelectedLanguageCode] = useState(() => languageOptions[0]?.code ?? 'en');
  const [shouldMergeTranslation, setShouldMergeTranslation] = useState(false);
  const [renderLangCode, setRenderLangCode] = useState<string | null>(null);

  const isLoadingFormOrSchema = Boolean(formUuid) && (isLoadingClobdata || isLoadingForm);

  const langCodeForPreview = useMemo(
    () => (shouldMergeTranslation ? renderLangCode : null),
    [shouldMergeTranslation, renderLangCode],
  );

  const resetErrorMessage = useCallback(() => {
    setInvalidJsonErrorMessage('');
  }, []);

  const handleSchemaChange = useCallback(
    (updatedSchema: string) => {
      resetErrorMessage();
      setStringifiedSchema(updatedSchema);
    },
    [resetErrorMessage],
  );

  const updateSchema = useCallback((updatedSchema: FormSchema) => {
    setSchema(updatedSchema);
    localStorage.setItem('formJSON', JSON.stringify(updatedSchema));
  }, []);

  const launchRestoreDraftSchemaModal = useCallback(() => {
    const dispose = showModal('restore-draft-schema-modal', {
      closeModal: () => dispose(),
      onSchemaChange: updateSchema,
    });
  }, [updateSchema]);

  useEffect(() => {
    if (formUuid) {
      if (form && Object.keys(form).length > 0) {
        setStatus('formLoaded');
      }

      if (status === 'formLoaded' && !isLoadingClobdata && clobdata === undefined) {
        launchRestoreDraftSchemaModal();
      }

      if (clobdata && Object.keys(clobdata).length > 0) {
        setStatus('schemaLoaded');
        setSchema(clobdata);
        localStorage.setItem('formJSON', JSON.stringify(clobdata));
      }
    }
  }, [clobdata, form, formUuid, isLoadingClobdata, isLoadingFormOrSchema, launchRestoreDraftSchemaModal, status]);

  useEffect(() => {
    setStringifiedSchema(JSON.stringify(schema, null, 2));
  }, [schema]);

  const onValidateForm = async () => {
    setIsValidating(true);
    try {
      const [errorsArray] = await handleFormValidation(schema, dataTypeToRenderingMap);
      setValidationResponse(errorsArray);
      setValidationComplete(true);
    } catch (error) {
      console.error('Error during form validation:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const inputDummySchema = useCallback(() => {
    const dummySchema: FormSchema = {
      encounterType: '',
      name: 'Sample Form',
      processor: 'EncounterFormProcessor',
      referencedForms: [],
      uuid: '',
      version: '1.0',
      pages: [
        {
          label: 'First Page',
          sections: [
            {
              label: 'A Section',
              isExpanded: 'true',
              questions: [
                {
                  id: 'sampleQuestion',
                  label: 'A Question of type obs that renders a text input',
                  type: 'obs',
                  questionOptions: {
                    rendering: 'text',
                    concept: 'a-system-defined-concept-uuid',
                  },
                },
              ],
            },
            {
              label: 'Another Section',
              isExpanded: 'true',
              questions: [
                {
                  id: 'anotherSampleQuestion',
                  label: 'Another Question of type obs whose answers get rendered as radio inputs',
                  type: 'obs',
                  questionOptions: {
                    rendering: 'radio',
                    concept: 'system-defined-concept-uuid',
                    answers: [
                      {
                        concept: 'another-system-defined-concept-uuid',
                        label: 'Choice 1',
                      },
                      {
                        concept: 'yet-another-system-defined-concept-uuid',
                        label: 'Choice 2',
                      },
                      {
                        concept: 'yet-one-more-system-defined-concept-uuid',
                        label: 'Choice 3',
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    setStringifiedSchema(JSON.stringify(dummySchema, null, 2));
    updateSchema({ ...dummySchema });
  }, [updateSchema]);

  const renderSchemaChanges = useCallback(() => {
    resetErrorMessage();
    try {
      const parsedJson: Schema = JSON.parse(stringifiedSchema);
      updateSchema(parsedJson);
      setStringifiedSchema(JSON.stringify(parsedJson, null, 2));
    } catch (e) {
      if (e instanceof Error) {
        setInvalidJsonErrorMessage(e.message);
      }
    }
  }, [stringifiedSchema, updateSchema, resetErrorMessage]);

  const translatedSchema = useMemo(() => {
    if (!schema) return null;
    if (!shouldMergeTranslation) return schema;
    return mergeTranslatedSchema(schema, langCodeForPreview);
  }, [schema, shouldMergeTranslation, langCodeForPreview]);

  const handleRenderSchemaChanges = useCallback(() => {
    if (errors.length && blockRenderingWithErrors) {
      setValidationOn(true);
      return;
    }

    setShouldMergeTranslation(true);
    setRenderLangCode(selectedLanguageCode);
    if (errors.length && !blockRenderingWithErrors) {
      setValidationOn(true);
      renderSchemaChanges();
    } else {
      renderSchemaChanges();
    }
  }, [blockRenderingWithErrors, errors.length, renderSchemaChanges, selectedLanguageCode]);

  const handleSchemaImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    const fileContent = await file.text();
    const parsedJson: Schema = JSON.parse(fileContent);
    setSchema(parsedJson);
  };

  const downloadableSchema = useMemo(
    () =>
      new Blob([JSON.stringify(schema, null, 2)], {
        type: 'application/json',
      }),
    [schema],
  );

  const handleCopySchema = useCallback(async () => {
    await navigator.clipboard.writeText(stringifiedSchema);
  }, [stringifiedSchema]);

  const handleToggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const responsiveSize = isMaximized ? 16 : 8;

  return (
    <div className={styles.container}>
      <Grid
        className={classNames(styles.grid as string, {
          [styles.maximized]: isMaximized,
        })}
      >
        <Column lg={responsiveSize} md={responsiveSize} sm={4} className={styles.column}>
          <div className={styles.actionButtons}>
            {isLoadingFormOrSchema ? (
              <InlineLoading description={t('loadingSchema', 'Loading schema') + '...'} />
            ) : (
              <h1 className={styles.formName}>{form?.name}</h1>
            )}
          </div>
          <div>
            <div className={styles.heading}>
              <span className={styles.tabHeading}>{t('schemaEditor', 'Schema editor')}</span>
              <div className={styles.topBtns}>
                {schema ? null : (
                  <FileUploader
                    onChange={handleSchemaImport}
                    labelTitle=""
                    labelDescription=""
                    buttonLabel={t('importSchema', 'Import schema')}
                    buttonKind="ghost"
                    size="lg"
                    filenameStatus="edit"
                    accept={['.json']}
                    multiple={false}
                    disabled={false}
                    iconDescription={t('importSchema', 'Import schema')}
                    name="form-import"
                  />
                )}
                {isNewSchema && !schema ? (
                  <Button kind="ghost" onClick={inputDummySchema}>
                    {t('inputDummySchema', 'Input dummy schema')}
                  </Button>
                ) : null}
                <Dropdown
                  id="target-language"
                  items={languageOptions}
                  itemToString={(item) => item?.label ?? ''}
                  label={t('selectLanguage', 'Select language')}
                  onChange={({ selectedItem }) => {
                    if (selectedItem) setSelectedLanguageCode(selectedItem.code);
                  }}
                  titleText={t('previewFormIn', 'Preview form in')}
                  selectedItem={languageOptions.find((opt) => opt.code === selectedLanguageCode)}
                  type="inline"
                  className={styles.dropdown}
                />

                <Button kind="ghost" onClick={handleRenderSchemaChanges} disabled={!!invalidJsonErrorMessage}>
                  <span>{t('renderChanges', 'Render changes')}</span>
                </Button>
              </div>
              {schema ? (
                <>
                  <IconButton
                    enterDelayMs={defaultEnterDelayInMs}
                    kind="ghost"
                    label={
                      isMaximized ? t('minimizeEditor', 'Minimize editor') : t('maximizeEditor', 'Maximize editor')
                    }
                    onClick={handleToggleMaximize}
                    size="md"
                  >
                    {isMaximized ? <Minimize /> : <Maximize />}
                  </IconButton>
                  <CopyButton
                    align="top"
                    className="cds--btn--md"
                    iconDescription={t('copySchema', 'Copy schema')}
                    kind="ghost"
                    onClick={handleCopySchema}
                  />
                  <a download={`${form?.name}.json`} href={globalThis.URL.createObjectURL(downloadableSchema)}>
                    <IconButton
                      enterDelayMs={defaultEnterDelayInMs}
                      kind="ghost"
                      label={t('downloadSchema', 'Download schema')}
                      size="md"
                    >
                      <Download />
                    </IconButton>
                  </a>
                </>
              ) : null}
            </div>
            {formError ? (
              <ErrorNotification error={formError} title={t('formError', 'Error loading form metadata')} />
            ) : null}
            {clobdataError ? (
              <ErrorNotification error={clobdataError} title={t('schemaLoadError', 'Error loading schema')} />
            ) : null}
            <div className={styles.editorContainer}>
              <SchemaEditor
                errors={errors}
                onSchemaChange={handleSchemaChange}
                setErrors={setErrors}
                setValidationOn={setValidationOn}
                stringifiedSchema={stringifiedSchema}
                validationOn={validationOn}
              />
            </div>
          </div>
        </Column>
        <Column lg={8} md={8} sm={4} className={styles.column}>
          <ActionButtons
            schema={schema}
            t={t}
            schemaErrors={errors}
            setPublishedWithErrors={setPublishedWithErrors}
            onFormValidation={onValidateForm}
            setValidationResponse={setValidationResponse}
            setValidationComplete={setValidationComplete}
            isValidating={isValidating}
          />
          {validationComplete && (
            <ValidationMessage
              hasValidationErrors={validationResponse.length > 0}
              publishedWithErrors={publishedWithErrors}
              errorsCount={validationResponse.length}
            />
          )}
          <Tabs>
            <TabList aria-label="Form previews">
              <Tab>{t('preview', 'Preview')}</Tab>
              <Tab>{t('interactiveBuilder', 'Interactive Builder')}</Tab>
              <Tab>{t('translationBuilder', 'Translation Builder')}</Tab>
              {form && <Tab>{t('auditDetails', 'Audit Details')}</Tab>}
            </TabList>
            <TabPanels>
              <TabPanel>
                <FormRenderer schema={translatedSchema} isLoading={isLoadingFormOrSchema} />
              </TabPanel>
              <TabPanel>
                <InteractiveBuilder
                  schema={schema}
                  onSchemaChange={updateSchema}
                  isLoading={isLoadingFormOrSchema}
                  validationResponse={validationResponse}
                />
              </TabPanel>
              <TabPanel>
                <TranslationBuilder formSchema={schema} onUpdateSchema={updateSchema} />
              </TabPanel>
              <TabPanel>{form && <AuditDetails form={form} key={form.uuid} />}</TabPanel>
            </TabPanels>
          </Tabs>
        </Column>
      </Grid>
    </div>
  );
};

function BackButton({ t }: TranslationFnProps) {
  return (
    <div className={styles.backButton}>
      <ConfigurableLink
        to={(globalThis as unknown as { getOpenmrsSpaBase: () => string }).getOpenmrsSpaBase() + 'form-builder'}
      >
        <Button
          kind="ghost"
          renderIcon={(props) => <ArrowLeft size={24} {...props} />}
          iconDescription={t('returnToDashboard', 'Return to dashboard')}
        >
          <span>{t('backToDashboard', 'Back to dashboard')}</span>
        </Button>
      </ConfigurableLink>
    </div>
  );
}

function FormEditor() {
  const { t } = useTranslation();

  return (
    <>
      <Header title={t('schemaEditor', 'Schema editor')} />
      <BackButton t={t} />
      <FormEditorContent t={t} />
    </>
  );
}

export default FormEditor;
