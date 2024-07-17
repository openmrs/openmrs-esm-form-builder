import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import type { Schema } from '../../types';
import styles from '../modals.scss';

interface DeleteSectionModal {
  closeModal: () => void;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  sectionIndex: number;
  schema: Schema;
}

const DeleteSectionModal: React.FC<DeleteSectionModal> = ({
  closeModal,
  onSchemaChange,
  pageIndex,
  sectionIndex,
  schema,
}) => {
  const { t } = useTranslation();

  const deleteSection = (pageIndex: number, sectionIndex: number) => {
    try {
      schema.pages[pageIndex].sections.splice(sectionIndex, 1);

      onSchemaChange({ ...schema });

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('SectionDeleted', 'Section deleted'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorDeletingSection', 'Error deleting section'),
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
        title={t('deleteSectionConfirmation', 'Are you sure you want to delete this section?')}
        closeModal={closeModal}
      />
      <ModalBody>
        <p>
          {t(
            'deleteSectionExplainerText',
            'Deleting this section will delete all the questions associated with it. This action cannot be undone.',
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
            deleteSection(pageIndex, sectionIndex);
            closeModal();
          }}
        >
          <span>{t('deleteSection', 'Delete section')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteSectionModal;
