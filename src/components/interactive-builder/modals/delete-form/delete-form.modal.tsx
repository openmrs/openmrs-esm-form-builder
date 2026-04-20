import React, { type SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import styles from './delete-form.scss';

interface DeleteFormModalProps {
  closeModal: () => void;
  isDeletingForm: boolean;
  onDeleteForm: () => void;
}

const DeleteFormModal: React.FC<DeleteFormModalProps> = ({ closeModal, isDeletingForm, onDeleteForm }) => {
  const { t } = useTranslation();
  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('retireForm', 'Retire form')} />
      <Form onSubmit={(event: SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <p>
            {t(
              'retireFormConfirmation',
              'Are you sure you want to retire this form? Retired forms are hidden by default but can be restored later.',
            )}
          </p>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          disabled={isDeletingForm}
          kind="danger"
          onClick={() => {
            onDeleteForm();
            closeModal();
          }}
        >
          {isDeletingForm ? (
            <InlineLoading className={styles.spinner} description={t('retiring', 'Retiring') + '...'} />
          ) : (
            <span>{t('retire', 'Retire')}</span>
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteFormModal;
