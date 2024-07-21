import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, CopyButton } from '@carbon/react';
import { Edit, TrashCan } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import type { Question, Schema } from '../../types';
import styles from './question-block.scss';

interface QuestionBlockProps {
  handleDuplicateQuestion: (question: Question, pageId: number, sectionId: number) => void;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  question: Question;
  questionIndex: number;
  schema: Schema;
  sectionIndex: number;
}

const QuestionBlock: React.FC<QuestionBlockProps> = ({
  handleDuplicateQuestion,
  onSchemaChange,
  pageIndex,
  question,
  questionIndex,
  schema,
  sectionIndex,
}) => {
  const { t } = useTranslation();

  const launchEditQuestionModal = useCallback(() => {
    const dispose = showModal('edit-question-modal', {
      closeModal: () => dispose(),
      questionToEdit: question,
      pageIndex,
      sectionIndex,
      questionIndex,
      onSchemaChange,
      schema,
    });
  }, [onSchemaChange, pageIndex, question, questionIndex, schema, sectionIndex]);

  const launchDeleteQuestionModal = useCallback(() => {
    const dispose = showModal('delete-question-modal', {
      closeModal: () => dispose(),
      pageIndex,
      sectionIndex,
      question,
      questionIndex,
      onSchemaChange,
      schema,
    });
  }, [onSchemaChange, pageIndex, question, questionIndex, schema, sectionIndex]);

  return (
    <div className={styles.questionBlock}>
      <div className={styles.iconAndName}>
        <p className={styles.questionLabel}>{question.label}</p>
      </div>
      <div className={styles.buttonsContainer}>
        <CopyButton
          align="top"
          className="cds--btn--sm"
          feedback={t('duplicated', 'Duplicated') + '!'}
          iconDescription={t('duplicateQuestion', 'Duplicate question')}
          kind="ghost"
          onClick={() => handleDuplicateQuestion(question, pageIndex, sectionIndex)}
        />
        <Button
          enterDelayMs={300}
          hasIconOnly
          iconDescription={t('editQuestion', 'Edit question')}
          kind="ghost"
          onClick={launchEditQuestionModal}
          renderIcon={(props) => <Edit size={16} {...props} />}
          size="md"
        />
        <Button
          enterDelayMs={300}
          hasIconOnly
          iconDescription={t('deleteQuestion', 'Delete question')}
          kind="ghost"
          onClick={launchDeleteQuestionModal}
          renderIcon={(props) => <TrashCan size={16} {...props} />}
          size="md"
        />
      </div>
    </div>
  );
};

export default QuestionBlock;
