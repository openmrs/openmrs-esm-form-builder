import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import type { Question, Schema } from '@types';
import styles from '../modals.scss';

interface DeleteQuestionModal {
  closeModal: () => void;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  question: Question;
  questionIndex: number;
  schema: Schema;
  sectionIndex: number;
  showModal: boolean;
}

const DeleteQuestionModal: React.FC<DeleteQuestionModal> = ({
  closeModal,
  onSchemaChange,
  pageIndex,
  question,
  questionIndex,
  schema,
  sectionIndex,
}) => {
  const { t } = useTranslation();

  const restoreQuestion = () => {
    schema.pages[pageIndex].sections[sectionIndex].questions.splice(questionIndex, 0, question);
    onSchemaChange({ ...schema });

    showSnackbar({
      title: t('questionRestored', 'Question restored'),
      subtitle: t('questionRestoredMessage', 'The question labelled "{{- questionLabel}}" has been restored.', {
        questionLabel: question.label,
      }),
    });
  };

  const deleteQuestion = (pageIndex: number, sectionIndex: number, questionIndex: number) => {
    try {
      schema.pages[pageIndex].sections[sectionIndex].questions.splice(questionIndex, 1);

      onSchemaChange({ ...schema });

      showSnackbar({
        actionButtonLabel: t('undo', 'Undo'),
        onActionButtonClick: () => restoreQuestion(),
        title: t('questionDeleted', 'Question deleted'),
        subtitle: t('questionDeletedMessage', 'The question labelled "{{- questionLabel}}" has been deleted.', {
          questionLabel: question.label,
        }),
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

    closeModal();
  };

  return (
    <div>
      <ModalHeader
        className={styles.modalHeader}
        closeModal={closeModal}
        title={t('deleteQuestionConfirmation', 'Are you sure you want to delete this question? ')}
      />
      <ModalBody>
        <p>
          {t('deleteQuestionWarningText', 'Clicking the delete button will delete the question labelled')}{' '}
          <strong>"{question.label}"</strong>.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          kind="danger"
          onClick={() => {
            deleteQuestion(pageIndex, sectionIndex, questionIndex);
          }}
        >
          <span>{t('deleteQuestion', 'Delete question')}</span>
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteQuestionModal;
