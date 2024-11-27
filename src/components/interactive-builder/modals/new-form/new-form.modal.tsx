import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, FormGroup, ModalBody, ModalFooter, ModalHeader, Stack, TextInput } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import type { Schema } from '@types';
import styles from '../modals.scss';

interface NewFormModalProps {
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  closeModal: () => void;
}

const NewFormModal: React.FC<NewFormModalProps> = ({ schema, onSchemaChange, closeModal }) => {
  const { t } = useTranslation();
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const updateSchema = (updates: Partial<Schema>) => {
    try {
      const updatedSchema = { ...schema, ...updates };
      onSchemaChange(updatedSchema);

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('formCreated', 'New form created'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorCreatingForm', 'Error creating form'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }
  };

  const handleCreateForm = () => {
    if (formName) {
      updateSchema({
        name: formName,
        description: formDescription,
      });

      closeModal();
    }
  };

  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        closeModal={closeModal}
        title={t('createNewForm', 'Create a new form')}
      />
      <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <Stack gap={5}>
            <FormGroup legendText={''}>
              <TextInput
                id="formName"
                labelText={t('formName', 'Form Name')}
                placeholder={t('namePlaceholder', 'What the form is called in the system')}
                value={formName}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFormName(event.target.value)}
              />
            </FormGroup>
            <FormGroup legendText={''}>
              <TextInput
                id="formDescription"
                labelText={t('formDescription', 'Form description')}
                placeholder={t(
                  'formDescriptionPlaceholder',
                  'A short description of the form e.g. A form for collecting COVID-19 symptoms',
                )}
                value={formDescription}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFormDescription(event.target.value)}
              />
            </FormGroup>
          </Stack>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={!formName} onClick={handleCreateForm}>
          <span>{t('createForm', 'Create Form')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default NewFormModal;
