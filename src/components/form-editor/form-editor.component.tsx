import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  Column,
  ComposedModal,
  CopyButton,
  InlineLoading,
  InlineNotification,
  Form,
  Grid,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
} from '@carbon/react';
import { ArrowLeft, Download, Maximize, Minimize } from '@carbon/react/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';
import type { OHRIFormSchema } from '@openmrs/openmrs-form-engine-lib';
import type { Schema } from '../../types';
import { useClobdata } from '../../hooks/useClobdata';
import { useForm } from '../../hooks/useForm';
import ActionButtons from '../action-buttons/action-buttons.component';
import AuditDetails from '../audit-details/audit-details.component';
import FormRenderer from '../form-renderer/form-renderer.component';
import Header from '../header/header.component';
import InteractiveBuilder from '../interactive-builder/interactive-builder.component';
import SchemaEditor from '../schema-editor/schema-editor.component';
import styles from './form-editor.scss';

interface ErrorProps {
  error: Error;
  title: string;
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

const FormEditor: React.FC = () => {
  const { t } = useTranslation();
  const { formUuid } = useParams<{ formUuid: string }>();
  const isNewSchema = !formUuid;
  const [schema, setSchema] = useState<Schema>();
  const [showDraftSchemaModal, setShowDraftSchemaModal] = useState(false);
  const { form, formError, isLoadingForm } = useForm(formUuid);
  const { clobdata, clobdataError, isLoadingClobdata } = useClobdata(form);
  const [status, setStatus] = useState<Status>('idle');
  const [isMaximized, setIsMaximized] = useState(false);
  const [stringifiedSchema, setStringifiedSchema] = useState(schema ? JSON.stringify(schema, null, 2) : '');

  const isLoadingFormOrSchema = Boolean(formUuid) && (isLoadingClobdata || isLoadingForm);

  useEffect(() => {
    if (formUuid) {
      if (form && Object.keys(form).length > 0) {
        setStatus('formLoaded');
      }

      if (status === 'formLoaded' && !isLoadingClobdata && clobdata === undefined) {
        setShowDraftSchemaModal(true);
      }

      if (clobdata && Object.keys(clobdata).length > 0) {
        setStatus('schemaLoaded');
        setSchema(clobdata);
        localStorage.setItem('formJSON', JSON.stringify(clobdata));
      }
    }
  }, [clobdata, form, formUuid, isLoadingClobdata, isLoadingFormOrSchema, status]);

  useEffect(() => {
    setStringifiedSchema(JSON.stringify(schema, null, 2));
  }, [schema]);

  const handleLoadDraftSchema = useCallback(() => {
    setShowDraftSchemaModal(false);

    try {
      const draftSchema = localStorage.getItem('formJSON');
      if (draftSchema) {
        setSchema(JSON.parse(draftSchema) as Schema);
      }
    } catch (e) {
      console.error('Error fetching draft schema from localStorage: ', e?.message);
    }
  }, []);

  const handleSchemaChange = useCallback((updatedSchema: string) => {
    setStringifiedSchema(updatedSchema);
  }, []);

  const updateSchema = useCallback((updatedSchema: Schema) => {
    setSchema(updatedSchema);
    localStorage.setItem('formJSON', JSON.stringify(updatedSchema));
  }, []);

  const inputDummySchema = useCallback(() => {
    const dummySchema: OHRIFormSchema = {
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
                  meta: {
                    concept: {
                      answers: [],
                      attributes: [],
                      auditInfo: {
                        creator: {},
                        dateCreated: '2024-03-26T08:38:19.000+0000',
                        changedBy: {},
                        dateChanged: '2024-03-26T08:38:19.000+0000',
                      },
                      conceptClass: {
                        uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                        display: 'Misc',
                        name: 'Misc',
                        description: "Terms which don't fit other categories",
                        retired: false,
                      },
                      datatype: {
                        uuid: '8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                        display: 'N/A',
                        name: 'N/A',
                        description: 'Not associated with a datatype',
                        hl7Abbreviation: 'ZZ',
                        links: [{}, {}],
                        resourceVersion: '1.8',
                        retired: false,
                      },
                      descriptions: [],
                      display: 'Example Option 1',
                      links: [
                        {
                          rel: 'self',
                          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/acc6f157-c9a5-4690-b814-e653cbf80b4c',
                          resourceAlias: 'concept',
                        },
                      ],
                      mappings: [],
                      name: {
                        conceptNameType: 'FULLY_SPECIFIED',
                        display: 'Example Option 1',
                        links: [{}, {}],
                        locale: 'en',
                        localePreferred: true,
                        name: 'Example Option 1',
                        resourceVersion: '1.9',
                        uuid: '51d0d6c4-0361-479e-aec4-b40ee82fb23c',
                      },
                      names: [
                        {
                          conceptNameType: 'FULLY_SPECIFIED',
                          display: 'Example Option 1',
                          links: [{}],
                          locale: 'en',
                          localePreferred: true,
                          name: 'Example Option 1',
                          resourceVersion: '1.9',
                          uuid: '51d0d6c4-0361-479e-aec4-b40ee82fb23c',
                        },
                      ],
                      resourceVersion: '2.0',
                      retired: false,
                      set: false,
                      setMembers: [],
                      uuid: 'acc6f157-c9a5-4690-b814-e653cbf80b4c',
                      version: '1.0',
                    },
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
                        conceptMappings: [],
                      },
                      {
                        concept: 'yet-another-system-defined-concept-uuid',
                        label: 'Choice 2',
                        conceptMappings: [],
                      },
                      {
                        concept: 'yet-one-more-system-defined-concept-uuid',
                        label: 'Choice 3',
                        conceptMappings: [],
                      },
                    ],
                  },
                  meta: {
                    concept: {
                      answers: [],
                      attributes: [],
                      auditInfo: {
                        creator: {},
                        dateCreated: '2024-03-26T08:38:19.000+0000',
                        changedBy: {},
                        dateChanged: '2024-03-26T08:38:19.000+0000',
                      },
                      conceptClass: {
                        uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
                        display: 'Misc',
                        name: 'Misc',
                        description: "Terms which don't fit other categories",
                        retired: false,
                      },
                      datatype: {
                        uuid: '8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
                        display: 'N/A',
                        name: 'N/A',
                        description: 'Not associated with a datatype',
                        hl7Abbreviation: 'ZZ',
                        links: [{}, {}],
                        resourceVersion: '1.8',
                        retired: false,
                      },
                      descriptions: [],
                      display: 'Example Option 1',
                      links: [
                        {
                          rel: 'self',
                          uri: 'http://dev3.openmrs.org/openmrs/ws/rest/v1/concept/acc6f157-c9a5-4690-b814-e653cbf80b4c',
                          resourceAlias: 'concept',
                        },
                      ],
                      mappings: [],
                      name: {
                        conceptNameType: 'FULLY_SPECIFIED',
                        display: 'Example Option 1',
                        links: [{}, {}],
                        locale: 'en',
                        localePreferred: true,
                        name: 'Example Option 1',
                        resourceVersion: '1.9',
                        uuid: '51d0d6c4-0361-479e-aec4-b40ee82fb23c',
                      },
                      names: [
                        {
                          conceptNameType: 'FULLY_SPECIFIED',
                          display: 'Example Option 1',
                          links: [{}],
                          locale: 'en',
                          localePreferred: true,
                          name: 'Example Option 1',
                          resourceVersion: '1.9',
                          uuid: '51d0d6c4-0361-479e-aec4-b40ee82fb23c',
                        },
                      ],
                      resourceVersion: '2.0',
                      retired: false,
                      set: false,
                      setMembers: [],
                      uuid: 'acc6f157-c9a5-4690-b814-e653cbf80b4c',
                      version: '1.0',
                    },
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

  const [invalidJsonErrorMessage, setInvalidJsonErrorMessage] = useState('');

  const resetErrorMessage = useCallback(() => {
    setInvalidJsonErrorMessage('');
  }, []);

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

  const DraftSchemaModal = () => {
    return (
      <ComposedModal
        open={showDraftSchemaModal}
        onClose={() => setShowDraftSchemaModal(false)}
        preventCloseOnClickOutside
      >
        <ModalHeader title={t('schemaNotFound', 'Schema not found')} />
        <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
          <ModalBody>
            <p>
              {t(
                'schemaNotFoundText',
                "The schema originally associated with this form could not be found. A draft schema was found saved in your browser's local storage. Would you like to load it instead?",
              )}
            </p>
          </ModalBody>
        </Form>
        <ModalFooter>
          <Button onClick={() => setShowDraftSchemaModal(false)} kind="secondary">
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={handleLoadDraftSchema}>
            <span>{t('loadDraft', 'Load draft')}</span>
          </Button>
        </ModalFooter>
      </ComposedModal>
    );
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
    <>
      <Header title={t('schemaEditor', 'Schema editor')} />
      <BackButton />
      <div className={styles.container}>
        {showDraftSchemaModal && <DraftSchemaModal />}
        <Grid
          className={classNames(styles.grid as string, {
            [styles.maximized]: isMaximized,
          })}
        >
          <Column lg={responsiveSize} md={responsiveSize} className={styles.column}>
            <div className={styles.actionButtons}>
              {isLoadingFormOrSchema ? (
                <InlineLoading description={t('loadingSchema', 'Loading schema') + '...'} />
              ) : (
                <h1 className={styles.formName}>{form?.name}</h1>
              )}

              <div>
                {isNewSchema && !schema ? (
                  <Button kind="ghost" onClick={inputDummySchema}>
                    {t('inputDummySchema', 'Input dummy schema')}
                  </Button>
                ) : null}

                <Button kind="ghost" onClick={renderSchemaChanges}>
                  <span>{t('renderChanges', 'Render changes')}</span>
                </Button>
              </div>
            </div>
            <div>
              <div className={styles.heading}>
                <span className={styles.tabHeading}>{t('schemaEditor', 'Schema editor')}</span>
                {schema ? (
                  <>
                    <Button
                      enterDelayMs={300}
                      renderIcon={isMaximized ? Minimize : Maximize}
                      kind={'ghost'}
                      iconDescription={
                        isMaximized ? t('minimizeEditor', 'Minimize editor') : t('maximizeEditor', 'Maximize editor')
                      }
                      hasIconOnly
                      size="md"
                      tooltipAlignment="start"
                      onClick={handleToggleMaximize}
                    />
                    <CopyButton
                      align="top"
                      className="cds--btn--md"
                      enterDelayMs={300}
                      iconDescription={t('copySchema', 'Copy schema')}
                      kind="ghost"
                      onClick={handleCopySchema}
                    />
                    <a download={`${form?.name}.json`} href={window.URL.createObjectURL(downloadableSchema)}>
                      <Button
                        enterDelayMs={300}
                        renderIcon={Download}
                        kind={'ghost'}
                        iconDescription={t('downloadSchema', 'Download schema')}
                        hasIconOnly
                        size="md"
                        tooltipAlignment="start"
                      />
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
                  invalidJsonErrorMessage={invalidJsonErrorMessage}
                  isLoading={isLoadingFormOrSchema}
                  onSchemaChange={handleSchemaChange}
                  stringifiedSchema={stringifiedSchema}
                />
              </div>
            </div>
          </Column>
          <Column lg={8} md={8} className={styles.column}>
            <ActionButtons schema={schema} t={t} />
            <Tabs>
              <TabList aria-label="Form previews">
                <Tab>{t('preview', 'Preview')}</Tab>
                <Tab>{t('interactiveBuilder', 'Interactive Builder')}</Tab>
                {form && <Tab>{t('auditDetails', 'Audit Details')}</Tab>}
              </TabList>
              <TabPanels>
                <TabPanel>
                  <FormRenderer schema={schema} isLoading={isLoadingFormOrSchema} />
                </TabPanel>
                <TabPanel>
                  <InteractiveBuilder schema={schema} onSchemaChange={updateSchema} isLoading={isLoadingFormOrSchema} />
                </TabPanel>
                <TabPanel>{form && <AuditDetails form={form} key={form.uuid} />}</TabPanel>
              </TabPanels>
            </Tabs>
          </Column>
        </Grid>
      </div>
    </>
  );
};

function BackButton() {
  const { t } = useTranslation();

  return (
    <div className={styles.backButton}>
      <ConfigurableLink to={window.getOpenmrsSpaBase() + 'form-builder'}>
        <Button
          kind="ghost"
          renderIcon={(props) => <ArrowLeft size={24} {...props} />}
          iconDescription="Return to dashboard"
        >
          <span>{t('backToDashboard', 'Back to dashboard')}</span>
        </Button>
      </ConfigurableLink>
    </div>
  );
}

export default FormEditor;
