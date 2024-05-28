import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import { Button, CopyButton } from '@carbon/react';
import { Draggable, Edit, TrashCan, Settings } from '@carbon/react/icons';
import type { Question } from '../../types';
import styles from './draggable-question.scss';
import { useFeatureFlag } from '@openmrs/esm-framework';

interface DraggableQuestionProps {
  question: Question;
  pageIndex: number;
  sectionIndex: number;
  questionIndex: number;
  handleDuplicateQuestion: (question: Question, pageId: number, sectionId: number) => void;
  handleEditButtonClick: (question: Question) => void;
  handleDeleteButtonClick: (question: Question) => void;
  handleAddLogic: (fieldId: string) => void;
  questionCount: number;
}

export const DraggableQuestion: React.FC<DraggableQuestionProps> = ({
  question,
  pageIndex,
  sectionIndex,
  questionIndex,
  handleDuplicateQuestion,
  handleDeleteButtonClick,
  handleEditButtonClick,
  handleAddLogic,
  questionCount,
}) => {
  const { t } = useTranslation();
  const isValidationRuleBuilder = useFeatureFlag('form-rule-builder');
  const draggableId = `question-${pageIndex}-${sectionIndex}-${questionIndex}`;
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
          onClick={() => {
            if (!isDragging) {
              handleEditButtonClick(question);
            }
          }}
          renderIcon={(props) => <Edit size={16} {...props} />}
          size="md"
        />
        <Button
          enterDelayMs={300}
          hasIconOnly
          iconDescription={t('deleteQuestion', 'Delete question')}
          kind="ghost"
          onClick={handleDeleteButtonClick}
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
