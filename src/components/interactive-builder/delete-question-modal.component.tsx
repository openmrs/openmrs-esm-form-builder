import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import type { Schema } from '../../types';

interface DeleteQuestionModal {
  onModalChange: (showModal: boolean) => void;
  onSchemaChange: (schema: Schema) => void;
  resetIndices: () => void;
  pageIndex: number;
  sectionIndex: number;
  questionIndex: number;
  schema: Schema;
  showModal: boolean;
}

const DeleteQuestionModal: React.FC<DeleteQuestionModal> = ({
  onModalChange,
  onSchemaChange,
  resetIndices,
  pageIndex,
  sectionIndex,
  questionIndex,
  schema,
  showModal,
}) => {
  const { t } = useTranslation();

  const deleteQuestion = (pageIndex: number, sectionIndex: number, questionIndex: number) => {
    try {
      schema.pages[pageIndex].sections[sectionIndex].questions.splice(questionIndex, 1);

      onSchemaChange({ ...schema });
      resetIndices();

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('QuestionDeleted', 'Question deleted'),
        timeoutInMs: 5000,
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorDeletingQuestion', 'Error deleting question'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }
  };

  return (
    <ComposedModal open={showModal} onClose={() => onModalChange(false)} preventCloseOnClickOutside>
      <ModalHeader title={t('deleteQuestionConfirmation', 'Are you sure you want to delete this question?')} />
      <ModalBody>
        <p>{t('deleteQuestionExplainerText', 'This action cannot be undone.')}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={() => onModalChange(false)}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          kind="danger"
          onClick={() => {
            deleteQuestion(pageIndex, sectionIndex, questionIndex);
            onModalChange(false);
          }}
        >
          <span>{t('deleteQuestion', 'Delete question')}</span>
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default DeleteQuestionModal;
