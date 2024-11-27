import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, ModalBody, ModalHeader, ModalFooter } from '@carbon/react';
import { type Schema } from '@types';
import styles from '../modals.scss';

interface RestoreDraftSchemaModalProps {
  closeModal: () => void;
  onSchemaChange: (schema: Schema) => void;
}

const RestoreDraftSchemaModal: React.FC<RestoreDraftSchemaModalProps> = ({ closeModal, onSchemaChange }) => {
  const { t } = useTranslation();

  const handleRestoreDraftSchema = useCallback(() => {
    try {
      const draftSchema = localStorage.getItem('formJSON');
      if (draftSchema) {
        onSchemaChange(JSON.parse(draftSchema) as Schema);
      }
    } catch (e) {
      console.error('Error fetching draft schema from localStorage: ', e?.message);
    }
  }, [onSchemaChange]);

  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        closeModal={closeModal}
        title={t('schemaNotFound', 'Schema not found')}
      />
      <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <p>
            {t(
              'schemaNotFoundText',
              "The schema originally associated with this form could not be found. A draft schema was found saved in your browser's local storage. Would you like to restore it?",
            )}
          </p>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button kind="secondary">{t('cancel', 'Cancel')}</Button>
        <Button
          onClick={() => {
            handleRestoreDraftSchema();
            closeModal();
          }}
        >
          <span>{t('restoreDraft', 'Restore draft')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default RestoreDraftSchemaModal;
