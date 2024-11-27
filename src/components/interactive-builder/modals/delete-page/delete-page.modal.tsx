import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import type { Schema } from '@types';
import styles from '../modals.scss';

interface DeletePageModalProps {
  closeModal: () => void;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  schema: Schema;
}

const DeletePageModal: React.FC<DeletePageModalProps> = ({ onSchemaChange, pageIndex, schema, closeModal }) => {
  const { t } = useTranslation();

  const deletePage = (pageIndex: number) => {
    try {
      schema.pages.splice(pageIndex, 1);

      onSchemaChange({ ...schema });

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('pageDeleted', 'Page deleted'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorDeletingPage', 'Error deleting page'),
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
        title={t('deletePageConfirmation', 'Are you sure you want to delete this page?')}
        closeModal={closeModal}
      />
      <ModalBody>
        <p>
          {t(
            'deletePageExplainerText',
            'Deleting this page will delete all the sections and questions associated with it. This action cannot be undone.',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          kind="danger"
          onClick={() => {
            deletePage(pageIndex);
            closeModal();
          }}
        >
          <span>{t('deletePage', 'Delete page')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeletePageModal;
