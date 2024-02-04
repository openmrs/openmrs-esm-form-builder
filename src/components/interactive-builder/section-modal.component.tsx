import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ComposedModal, Form, FormGroup, ModalBody, ModalFooter, ModalHeader, TextInput } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import type { Schema } from '../../types';

interface SectionModalProps {
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  resetIndices: () => void;
  showModal: boolean;
  onModalChange: (showModal: boolean) => void;
}

const SectionModal: React.FC<SectionModalProps> = ({
  schema,
  onSchemaChange,
  pageIndex,
  resetIndices,
  showModal,
  onModalChange,
}) => {
  const { t } = useTranslation();
  const [sectionTitle, setSectionTitle] = useState('');

  const handleUpdatePageSections = () => {
    updateSections();
    onModalChange(false);
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
      resetIndices();

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('sectionCreated', 'New section created'),
        timeoutInMs: 5000,
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
    <ComposedModal open={showModal} onClose={() => onModalChange(false)} preventCloseOnClickOutside>
      <ModalHeader title={t('createNewSection', 'Create a new section')} />
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
        <Button onClick={() => onModalChange(false)} kind="secondary">
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={!sectionTitle} onClick={handleUpdatePageSections}>
          <span>{t('save', 'Save')}</span>
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};
export default SectionModal;
