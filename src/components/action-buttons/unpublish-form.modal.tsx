import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, ModalBody, ModalHeader, ModalFooter } from '@carbon/react';
import { type Status } from '../../types';
import styles from './unpublish-form.scss';

interface UnpublishModalProps {
  closeModal: () => void;
  onUnpublishForm: () => void;
  status: Status;
}

const UnpublishFormModal: React.FC<UnpublishModalProps> = ({ closeModal, onUnpublishForm, status }) => {
  const { t } = useTranslation();
  return (
    <>
      <ModalHeader
        closeModal={closeModal}
        title={t('unpublishConfirmation', 'Are you sure you want to unpublish this form?')}
      />
      <ModalBody>
        <p>
          {t(
            'unpublishExplainerText',
            'Unpublishing a form means you can no longer access it from your frontend. Unpublishing forms does not delete their associated schemas, it only affects whether or not you can access them in your frontend.',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          disabled={status === 'unpublishing'}
          kind={status === 'unpublishing' ? 'secondary' : 'danger'}
          onClick={() => {
            onUnpublishForm();
            closeModal();
          }}
        >
          {status === 'unpublishing' ? (
            <InlineLoading className={styles.spinner} description={t('unpublishing', 'Unpublishing') + '...'} />
          ) : (
            <span>{t('unpublish', 'Unpublish')}</span>
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default UnpublishFormModal;
