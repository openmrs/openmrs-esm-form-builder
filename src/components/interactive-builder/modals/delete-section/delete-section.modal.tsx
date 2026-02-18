import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import type { Schema } from '@types';

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
      const refFormAlias = schema.pages[pageIndex].sections[sectionIndex].reference?.form;

      schema.pages[pageIndex].sections.splice(sectionIndex, 1);

      if (refFormAlias) {
        schema = removeUnusedReferencedForm(schema, refFormAlias);
      }

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

  const removeUnusedReferencedForm = (schema: Schema, targetFormName: string) => {
    let formUsedElsewhere = false;
    for (let page of schema.pages) {
      for (let section of page.sections) {
        if (section.reference && section.reference.form === targetFormName) {
          formUsedElsewhere = true;
          break;
        }
      }
      if (formUsedElsewhere) break;
    }
    if (!formUsedElsewhere) {
      schema.referencedForms = schema.referencedForms.filter((ref) => ref.alias !== targetFormName);
    }

    return schema;
  };

  return (
    <>
      <ModalHeader
        closeModal={closeModal}
        title={t('deleteSectionConfirmation', 'Are you sure you want to delete this section?')}
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
