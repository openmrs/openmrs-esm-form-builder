import React, { useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import { Button, CopyButton } from '@carbon/react';
import { Draggable, Edit, TrashCan } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import type { Question, Schema } from '../../types';
import styles from './draggable-question.scss';
import { useFeatureFlag } from '@openmrs/esm-framework';
import { Settings } from '@carbon/react/icons';

interface DraggableQuestionProps {
  handleDuplicateQuestion: (question: Question, pageId: number, sectionId: number) => void;
  handleAddLogic: (fieldId: string) => void;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  question: Question;
  questionCount: number;
  questionIndex: number;
  schema: Schema;
  sectionIndex: number;
}

const DraggableQuestion: React.FC<DraggableQuestionProps> = ({
  handleDuplicateQuestion,
  handleAddLogic,
  onSchemaChange,
  pageIndex,
  question,
  questionCount,
  questionIndex,
  schema,
  sectionIndex,
}) => {
  const { t } = useTranslation();
  const isValidationRuleBuilder = useFeatureFlag('form-rule-builder');
  const draggableId = `question-${pageIndex}-${sectionIndex}-${questionIndex}`;

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

  const { attributes, listeners, transform, isDragging, setNodeRef } = useDraggable({
    id: draggableId,
    disabled: questionCount <= 1,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const dragStyles = isDragging ? styles.isDragged : styles.normal;

  return (
    <div className={dragStyles} style={style}>
      <div className={styles.iconAndName}>
        <div ref={setNodeRef} {...attributes} {...listeners}>
          <Button
            className={styles.dragIcon}
            enterDelayMs={300}
            hasIconOnly
            iconDescription={t('reorderQuestion', 'Reorder question')}
            kind="ghost"
            renderIcon={(props) => <Draggable size={16} {...props} />}
            size="md"
          />
        </div>
        <p className={styles.questionLabel}>{question.label}</p>
      </div>
      <div className={styles.buttonsContainer}>
        <CopyButton
          align="top"
          className="cds--btn--sm"
          feedback={t('duplicated', 'Duplicated') + '!'}
          iconDescription={t('duplicateQuestion', 'Duplicate question')}
          kind="ghost"
          onClick={() => !isDragging && handleDuplicateQuestion(question, pageIndex, sectionIndex)}
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
        {isValidationRuleBuilder && (
          <Button
            enterDelayMs={300}
            hasIconOnly
            iconDescription={t('addConditionalLogic', 'Add conditional logic')}
            kind="ghost"
            onClick={() => handleAddLogic(question.id)}
            renderIcon={(props) => <Settings size={16} {...props} />}
            size="md"
          />
        )}
      </div>
    </div>
  );
};

export default DraggableQuestion;
