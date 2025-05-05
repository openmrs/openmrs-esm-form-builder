import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Stack,
  InlineLoading,
  InlineNotification,
  Dropdown,
  CheckboxGroup,
  Checkbox,
  RadioButtonGroup,
  RadioButton,
  Button,
} from '@carbon/react';
import { type Form as FormType, type Schema, type Page, type Section, type Question } from '@types';
import { useForms } from '@hooks/useForms';
import { useClobdata } from '@hooks/useClobdata';
import { showSnackbar } from '@openmrs/esm-framework';
import styles from './add-form-reference.scss';

interface AddFormReferenceModalProps {
  closeModal: () => void;
  pageIndex: number;
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
}

const AddFormReferenceModal: React.FC<AddFormReferenceModalProps> = ({
  closeModal,
  pageIndex,
  schema,
  onSchemaChange,
}) => {
  const { t } = useTranslation();
  const [selectedForm, setSelectedForm] = useState<FormType>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page>(null);
  const [selectedSection, setSelectedSection] = useState<Section>(null);
  const [excludedQuestions, setExcludedQuestions] = useState<string[]>([]);
  const { forms, error, isLoading } = useForms();
  const { clobdata, isLoadingClobdata, clobdataError } = useClobdata(selectedForm);

  const selectForm = useCallback(({ selectedItem }: { selectedItem: FormType }) => {
    setSelectedForm(selectedItem);
    setSelectedPage(null);
    setSelectedSection(null);
    setExcludedQuestions([]);
  }, []);

  useEffect(() => {
    if (clobdata) {
      setPages(clobdata.pages);
    }
  }, [clobdata]);

  const handleSelectedPage = useCallback(({ selectedItem }: { selectedItem: Page }) => {
    setSelectedPage(selectedItem);
    setSelectedSection(null);
    setExcludedQuestions([]);
  }, []);

  const handleSelectedSections = useCallback((section: Section) => {
    setSelectedSection(section);
    setExcludedQuestions([]);
  }, []);

  const handleExcludedQuestions = useCallback((question: Question, checked: Boolean) => {
    setExcludedQuestions((prev) => {
      if (!checked) {
        return prev.some((q) => q === question.id) ? prev : [...prev, question.id];
      } else {
        return prev.filter((q) => q !== question.id);
      }
    });
  }, []);

  const handleUpdateSchema = () => {
    updateSchema();
    closeModal();
  };

  const updateSchema = () => {
    try {
      if (!schema.referencedForms?.some((form) => form.formName === selectedForm.name)) {
        schema.referencedForms
          ? schema.referencedForms.push({
              formName: selectedForm.name,
              alias: selectedForm.name,
            })
          : (schema.referencedForms = [
              {
                formName: selectedForm.name,
                alias: selectedForm.name,
              },
            ]);
      }
      schema.pages[pageIndex].sections.push({
        label: selectedSection.label,
        isExpanded: 'true',
        questions: [],
        reference: {
          form: selectedForm.name,
          page: selectedPage.label,
          section: selectedSection.label,
          excludeQuestions: excludedQuestions,
        },
      });
      onSchemaChange({ ...schema });
      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('componentadded', 'Component added'),
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

  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('addFormComponent', 'Add Form Component')} />
      <Form className={styles.form}>
        <ModalBody className={styles.modalBody}>
          <Stack gap={4}>
            {isLoading ? (
              <InlineLoading description={t('loading', 'Loading...')} />
            ) : error ? (
              <InlineNotification>{t('errorLoadingForms', 'Error loading forms')}</InlineNotification>
            ) : forms.length === 0 ? (
              <InlineNotification>{t('noFormsAvailable', 'No forms available')}</InlineNotification>
            ) : (
              <FormGroup legendText={''}>
                <Dropdown
                  titleText={t('selectForm', 'Select form')}
                  id="form-component-dropdown"
                  label={t('selectForm', 'Select form')}
                  items={forms.map((form) => ({
                    uuid: form.uuid,
                    name: form.name,
                    resources: form.resources,
                  }))}
                  itemToString={(item: FormType) => (item ? item.name : '')}
                  onChange={selectForm}
                />
              </FormGroup>
            )}
            {isLoadingClobdata ? (
              <InlineLoading description={t('loading', 'Loading...')} />
            ) : clobdataError ? (
              <InlineNotification>{t('errorLoadingForm', 'Error loading form')}</InlineNotification>
            ) : pages && pages.length > 0 ? (
              <>
                <FormGroup legendText={''}>
                  <Dropdown
                    titleText={`${selectedForm.name} ${t('pages', 'Pages')}:`}
                    id="form-Pages-dropdown"
                    label={t('Page', 'Select page')}
                    items={pages.map((page) => ({
                      label: page.label,
                      sections: page.sections,
                    }))}
                    itemToString={(item: Page) => (item ? item.label : '')}
                    onChange={handleSelectedPage}
                    selectedItem={selectedPage}
                  />
                </FormGroup>
                {selectedPage ? (
                  <FormGroup legendText={`${selectedPage.label} ${t('sections', 'Sections')}:`}>
                    <RadioButtonGroup orientation="vertical" name="radio-button-group">
                      {selectedPage.sections.map((section) => (
                        <RadioButton
                          key={`${selectedPage.label}-${section.label}`}
                          labelText={section.label}
                          id={`${selectedPage.label}-${section.label}`}
                          value={section.label}
                          onClick={() => handleSelectedSections(section)}
                        />
                      ))}
                    </RadioButtonGroup>
                  </FormGroup>
                ) : null}
              </>
            ) : null}
            {selectedSection ? (
              <FormGroup legendText={t('selectQuestions', 'Select questions')}>
                <CheckboxGroup legendText={''}>
                  {selectedSection.questions.map((question) => (
                    <Checkbox
                      key={question.id}
                      labelText={question.label || question.id}
                      id={`${selectedSection.label}-${question.id}`}
                      value={question.id}
                      checked={!excludedQuestions.includes(question.id)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>, { checked }) =>
                        handleExcludedQuestions(question, checked)
                      }
                    />
                  ))}
                </CheckboxGroup>
              </FormGroup>
            ) : null}
          </Stack>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          kind="primary"
          onClick={() => {
            handleUpdateSchema();
          }}
          disabled={
            !selectedForm ||
            !selectedPage ||
            !selectedSection ||
            excludedQuestions.length === selectedSection.questions.length
          }
        >
          <span>{t('add', 'Add')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default AddFormReferenceModal;
