import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ComposedModal,
  Form,
  FormGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  TextInput,
} from '@carbon/react';
import { showToast, showNotification } from '@openmrs/esm-framework';
import type { Schema } from '../../types';

interface NewFormModalProps {
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  onModalChange: (showModal: boolean) => void;
  showModal: boolean;
}

const NewFormModal: React.FC<NewFormModalProps> = ({ schema, onSchemaChange, showModal, onModalChange }) => {
  const { t } = useTranslation();
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const updateSchema = (updates: Partial<Schema>) => {
    try {
      const updatedSchema = { ...schema, ...updates };
      onSchemaChange(updatedSchema);

      showToast({
        title: t('success', 'Success!'),
        kind: 'success',
        critical: true,
        description: t('formCreated', 'New form created'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showNotification({
          title: t('errorCreatingForm', 'Error creating form'),
          kind: 'error',
          critical: true,
          description: error?.message,
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

      onModalChange(false);
    }
  };

  return (
    <ComposedModal open={showModal} onClose={() => onModalChange(false)} preventCloseOnClickOutside>
      <ModalHeader title={t('createNewForm', 'Create a new form')} />
      <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <Stack gap={5}>
            <FormGroup legendText={''}>
              <TextInput
                id="formName"
                labelText={t('formName', 'Form name')}
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
        <Button kind="secondary" onClick={() => onModalChange(false)}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={!formName} onClick={handleCreateForm}>
          <span>{t('createForm', 'Create Form')}</span>
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default NewFormModal;
