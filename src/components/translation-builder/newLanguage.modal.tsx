import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, FormGroup, Modal, ModalBody, ModalFooter, ModalHeader, TextInput } from '@carbon/react';
import styles from './new-language-modal.scss';

interface NewLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLanguage: (newLanguage: string) => void;
}

const NewLanguageModal: React.FC<NewLanguageModalProps> = ({ isOpen, onClose, onAddLanguage }) => {
  const { t } = useTranslation();
  const [newLanguage, setNewLanguage] = useState('');

  const handleSave = () => {
    if (newLanguage.trim()) {
      onAddLanguage(newLanguage.trim());
      setNewLanguage('');
      onClose();
    }
  };

  return (
    <Modal
      open={isOpen}
      modalHeading={t('addNewLanguage', 'Add New Language')}
      className={styles.newLanguageModal} // <--- Attach the custom class
      passiveModal
    >
      <Form onSubmit={(e) => e.preventDefault()}>
        <ModalBody>
          <FormGroup legendText="">
            <TextInput
              id="new-language"
              labelText={t('enterLanguageCode', 'Enter Language Code (e.g., "fr", "es")')}
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="e.g., fr, es, de"
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={onClose}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button kind="primary" disabled={!newLanguage.trim()} onClick={handleSave}>
            {t('save', 'Save')}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default NewLanguageModal;
