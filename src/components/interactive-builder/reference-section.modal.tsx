import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionItem,
  Button,
  ComposedModal,
  FormGroup,
  Checkbox,
  Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  SelectItem,
  Select,
  TextInput,
} from '@carbon/react';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import type { Form as JsonForm, Schema } from '../../types';
import { useForms } from '../../hooks/useForms';
import { useClobdata } from '../../hooks/useClobdata';
import styles from './interactive-builder.scss';

interface ReferenceSectionModalProps {
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  resetIndices: () => void;
  showModal: boolean;
  onModalChange: (showModal: boolean) => void;
}

const ReferenceSectionModal: React.FC<ReferenceSectionModalProps> = ({
  schema,
  onSchemaChange,
  pageIndex,
  resetIndices,
  showModal,
  onModalChange,
}) => {
  const { t } = useTranslation();
  const config = useConfig();
  const { forms } = useForms();
  const [componentFormUuid, setComponentFormUuid] = useState('');
  const [selectedComponentSkeleton, setSelectedComponentSkeleton] = useState<JsonForm>(null);
  const [selectedComponentAlias, setSelectedComponentAlias] = useState('');
  const { clobdata, clobdataError, isLoadingClobdata } = useClobdata(selectedComponentSkeleton);

  const componentForms = useMemo(() => {
    return forms?.filter((form) => form?.encounterType?.uuid === config.componentFormEncounterTypeUuid);
  }, [forms]);

  const handleUpdatePageSections = () => {
    updateFormReferences();
    updateSectionsReferences();
    onModalChange(false);
  };

  const updateFormReferences = () => {
    try {
      const componentReferenceExists = schema.referencedForms.find(
        (component) => component?.formName === selectedComponentSkeleton?.name,
      );
      if (!componentReferenceExists) {
        schema.referencedForms.push({
          formName: selectedComponentSkeleton?.name,
          alias: selectedComponentAlias,
        });
      }

      onSchemaChange({ ...schema });
      resetIndices();

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('componentAdded', 'Component added'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorAddingComponent', 'Error adding component'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }
  };

  const updateSectionsReferences = () => {
    try {
      // TODO update form section

      onSchemaChange({ ...schema });
      resetIndices();

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('componentReferenceAdded', 'Component reference added to section'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorAddingComponentReference', 'Error adding component reference to section'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }
  };

  const handleSelectedComponent = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComponentFormUuid(event.target.value);
    const selectedForm = componentForms.find((form) => form?.uuid === event.target.value);
    setSelectedComponentSkeleton(selectedForm);
  };

  return (
    <ComposedModal open={showModal} onClose={() => onModalChange(false)} preventCloseOnClickOutside>
      <ModalHeader title={t('referenceSection', 'Reference section')} />
      <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <FormGroup legendText={''}>
            <Select
              id="componentForm"
              labelText={t('selectComponentForm', 'Select a component form')}
              value={componentFormUuid}
              onChange={handleSelectedComponent}
            >
              {componentForms ? (
                <>
                  <SelectItem
                    key="default"
                    value=""
                    text={t('selectComponent', 'Choose the component you want to reference')}
                  />

                  {componentForms.map((form) => (
                    <SelectItem key={form?.uuid} value={form?.uuid} text={form?.name} />
                  ))}
                </>
              ) : null}
            </Select>
          </FormGroup>
          <FormGroup legendText={''}>
            <TextInput
              id="componentAlias"
              labelText={t('componentAlias', 'Component alias')}
              placeholder={t(
                'componentAliasPlaceholder',
                'Short alias for this component usually 3 characters long e.g art as an alias for component_art.',
              )}
              value={selectedComponentAlias}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSelectedComponentAlias(event.target.value)}
            />
          </FormGroup>

          {isLoadingClobdata && <p>{t('loading', 'Loading...')}</p>}
          {clobdataError && <p>{t('errorLoadingClobdata', 'Error loading clobdata')}</p>}
          {clobdata &&
            (clobdata?.pages?.length > 0
              ? clobdata?.pages?.map((page, pageIndex) => (
                  <div className={styles.editableFieldsContainer}>
                    <div>
                      {page?.sections?.length ? (
                        <p className={styles.sectionExplainer}>
                          {t(
                            'expandComponentSectionExplainer',
                            'Below are the sections linked to this component. Expand each section to view the questions.',
                          )}
                        </p>
                      ) : null}
                      {page?.sections?.length ? (
                        page.sections?.map((section, sectionIndex) => (
                          <Accordion>
                            <AccordionItem title={section.label}>
                              <>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <div className={styles.editorContainer}>
                                    {/* <h1 className={styles.section + 'Label'}>{section.label}</h1> */}
                                  </div>
                                </div>
                                <div>
                                  {section.questions?.length ? (
                                    section.questions.map((question, questionIndex) => (
                                      <Checkbox labelText={question.label} />
                                    ))
                                  ) : (
                                    <p className={styles.explainer}>
                                      {t(
                                        'componentSectionNoQuestions',
                                        'This page section does not have any questions. Please edit the component form to add questions.',
                                      )}
                                    </p>
                                  )}
                                </div>
                              </>
                            </AccordionItem>
                          </Accordion>
                        ))
                      ) : (
                        <p className={styles.explainer}>
                          {t(
                            'componentPagesNoSections',
                            'This page does not have any sections attached to it. Please edit the component form to add sections.',
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              : null)}
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button onClick={() => onModalChange(false)} kind="secondary">
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={!clobdata} onClick={handleUpdatePageSections}>
          <span>{t('save', 'Save')}</span>
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};
export default ReferenceSectionModal;
