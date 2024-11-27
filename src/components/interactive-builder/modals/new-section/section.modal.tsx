import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, FormGroup, ModalBody, ModalFooter, ModalHeader, TextInput } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import type { Schema } from '@types';
import styles from '../modals.scss';

interface SectionModalProps {
  closeModal: () => void;
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
}

const SectionModal: React.FC<SectionModalProps> = ({ closeModal, schema, onSchemaChange, pageIndex }) => {
  const { t } = useTranslation();
  const [sectionTitle, setSectionTitle] = useState('');

  const handleUpdatePageSections = () => {
    updateSections();
    closeModal();
  };

  const updateSections = () => {
    try {
      schema.pages[pageIndex]?.sections?.push({
        label: sectionTitle,
        isExpanded: 'true',
        questions: [],
      });
      onSchemaChange({ ...schema });
      setSectionTitle('');

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('sectionCreated', 'New section created'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorCreatingSection', 'Error creating section'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }
  };

  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        title={t('createNewSection', 'Create a new section')}
        closeModal={closeModal}
      />
      <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <FormGroup legendText={''}>
            <TextInput
              id="sectionTitle"
              labelText={t('enterSectionTitle', 'Enter a section title')}
              value={sectionTitle}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSectionTitle(event.target.value)}
            />
          </FormGroup>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button onClick={closeModal} kind="secondary">
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={!sectionTitle} onClick={handleUpdatePageSections}>
          <span>{t('save', 'Save')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};
export default SectionModal;
