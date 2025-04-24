import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, InlineLoading, ModalBody, ModalFooter, ModalHeader , Dropdown } from '@carbon/react';
import { type Form as FormType, type Schema, type Page } from '@types';
import { useForms } from '@hooks/useForms';
import { useClobdata } from '@hooks/useClobdata';

interface AddFormComponentModalProps {
  closeModal: () => void;
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
}

const AddFormComponentModal: React.FC<AddFormComponentModalProps> = ({ closeModal, schema, onSchemaChange }) => {
  const { t } = useTranslation();
  const { forms, error, isLoading, isValidating, mutate } = useForms();

  const [selectedForm, setSelectedForm] = useState<FormType>(null);
  const { clobdata, isLoadingClobdata, clobdataError } = useClobdata(selectedForm);
  const [pages, setPages] = useState<Page[]>([]);

  const selectForm = useCallback((form: FormType) => {
    setSelectedForm(form);
  }, []);

  useEffect(() => {
    if (clobdata) {
      setPages(clobdata.pages);
    }
  }, [clobdata]);

  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('addFormComponent', 'Add Form Component')} />
      <Form>
        <ModalBody>
          {isLoading ? (
            <InlineLoading description={t('loading', 'Loading...')} />
          ) : (
            <Dropdown
              titleText={t('selectForm', 'Select Form')}
              id="form-component-dropdown"
              label={t('selectForm', 'Select Form')}
              items={forms.map((form) => ({
                id: form.uuid,
                text: form.name,
                resources: form.resources,
              }))}
              itemToString={(item) => (item ? item.text : '')}
              onChange={selectForm}
            />
          )}
          {isLoadingClobdata ? (
            <InlineLoading description={t('loading', 'Loading...')} />
          ) : clobdataError ? (
            <div>{t('errorLoadingForm', 'Error loading Form')}</div>
          ) : pages.length > 0 ? (
            pages.map((page) => (
              <div>
                <h3>{page.label}</h3>
              </div>
            ))
          ) : null}
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          kind="primary"
          onClick={() => {
            closeModal();
          }}
        >
          <span>{t('add', 'Add')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default AddFormComponentModal;
