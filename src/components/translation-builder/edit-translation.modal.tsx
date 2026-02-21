import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalHeader, ModalFooter, TextInput } from '@carbon/react';

interface EditTranslationModalProps {
  onClose: () => void;
  originalKey: string;
  initialValue: string;
  onSave: (newValue: string) => void;
}

const EditTranslationModal: React.FC<EditTranslationModalProps> = ({ onClose, originalKey, initialValue, onSave }) => {
  const { t } = useTranslation();
  const [newValue, setNewValue] = useState(initialValue);

  return (
    <>
      <ModalHeader closeModal={onClose} title={t('editTranslationTitle', 'Edit Translation')} />
      <ModalBody>
        <p>
          {t('editingFor', 'Editing translation for:')} <strong>{originalKey}</strong>
        </p>
        <TextInput
          id="translation-input"
          labelText={t('translationValue', 'Translated Value')}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          data-testid="translation-value-input"
        />
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          kind="primary"
          onClick={() => {
            onSave(newValue);
          }}
        >
          {t('save', 'Save')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default EditTranslationModal;
