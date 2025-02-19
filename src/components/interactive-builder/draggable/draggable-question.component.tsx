import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';
import { CopyButton, IconButton } from '@carbon/react';
import { Draggable, Edit, TrashCan } from '@carbon/react/icons';
import { showModal, ChevronDownIcon, ChevronUpIcon } from '@openmrs/esm-framework';
import MarkdownWrapper from '../markdown-wrapper/markdown-wrapper';
import type { Question, Schema } from '@types';
import styles from './draggable-question.scss';

interface DraggableQuestionProps {
  handleDuplicateQuestion: (question: Question, pageId: number, sectionId: number, questionId?: number) => void;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  question: Question;
  questionCount: number;
  questionIndex: number;
  schema: Schema;
  sectionIndex: number;
  subQuestionIndex?: number;
  children?: React.ReactNode;
}

const DraggableQuestion: React.FC<DraggableQuestionProps> = ({
  handleDuplicateQuestion,
  onSchemaChange,
  pageIndex,
  question,
  questionCount,
  questionIndex,
  schema,
  sectionIndex,
  subQuestionIndex,
  children,
}) => {
  const { t } = useTranslation();
  const defaultEnterDelayInMs = 300;
  const [isCollapsed, setIsCollapsed] = useState(true);
  const toggleCollapse = () => {
    if (question.questions) {
      setIsCollapsed(!isCollapsed)
    }
  };

  const launchEditQuestionModal = useCallback(() => {
    const dispose = showModal('question-modal', {
      formField: question,
      closeModal: () => dispose(),
      onSchemaChange,
      schema,
      questionIndex,
      pageIndex,
      sectionIndex,
      subQuestionIndex,
    });
  }, [onSchemaChange, pageIndex, question, questionIndex, schema, sectionIndex, subQuestionIndex]);

  const launchDeleteQuestionModal = useCallback(() => {
    const dispose = showModal('delete-question-modal', {
      closeModal: () => dispose(),
      pageIndex,
      sectionIndex,
      question,
      questionIndex,
      subQuestionIndex,
      onSchemaChange,
      schema,
    });
  }, [onSchemaChange, pageIndex, question, questionIndex, schema, sectionIndex, subQuestionIndex]);

  const { attributes, listeners, setNodeRef, active, isDragging, over, isOver } = useSortable({
    id: question.id,
    data: {
      type: (subQuestionIndex === null) || (subQuestionIndex === undefined)  ? 'question' : 'obsQuestion',
      question: {
        handleDuplicateQuestion: handleDuplicateQuestion,
        onSchemaChange: onSchemaChange,
        pageIndex: pageIndex,
        sectionIndex: sectionIndex,
        question: question,
        questionCount: questionCount,
        questionIndex: questionIndex,
        subQuestionIndex: subQuestionIndex !== null ? subQuestionIndex : null,
        schema: schema,
      }
    },
    disabled: questionCount <= 1 && (subQuestionIndex === undefined || subQuestionIndex === null),
  });

  const handleDuplicate = useCallback(() => {
    if (!isDragging) {
      if (subQuestionIndex !== undefined && subQuestionIndex !== null) {
        handleDuplicateQuestion(question, pageIndex, sectionIndex, questionIndex);
      } else {
        handleDuplicateQuestion(question, pageIndex, sectionIndex);
      }
    }
  }, [handleDuplicateQuestion, isDragging, question, pageIndex, sectionIndex, questionIndex, subQuestionIndex]);

  return (
    <div
      ref={setNodeRef}
      className={classNames(styles.question, {
        [styles.dragContainer]: true,
        [styles.dragContainerWhenDragging]: isDragging,
        [styles.dropZone]: over?.id === question.id,
        [styles.droppable]: active?.id === question.id,
      })}
    >
      <div
        className={classNames(styles.questionContainer, {
          [styles.obsGroup]: question?.questions
        })}
        onClick={toggleCollapse}
      >
        <div className={styles.iconAndName}>
          <div ref={setNodeRef} {...attributes} {...listeners}>
            <IconButton
              className={styles.dragIcon}
              enterDelayMs={over ? 6000 : defaultEnterDelayInMs}
              label={t('dragToReorder', 'Drag to reorder')}
              kind="ghost"
              size="md"
            >
              <Draggable />
            </IconButton>
          </div>
          <p className={styles.questionLabel}>
            {question.questionOptions.rendering === 'markdown' ? (
              <MarkdownWrapper markdown={question.value} />
            ) : (
              question.label
            )}
          </p>
        </div>
        <div className={styles.buttonsContainer}>
          <CopyButton
            align="top"
            className="cds--btn--sm"
            feedback={t('duplicated', 'Duplicated') + '!'}
            iconDescription={t('duplicateQuestion', 'Duplicate question')}
            kind="ghost"
            onClick={handleDuplicate}
          />
          <IconButton
            enterDelayMs={defaultEnterDelayInMs}
            label={t('editQuestion', 'Edit question')}
            kind="ghost"
            onClick={launchEditQuestionModal}
            size="md"
          >
            <Edit />
          </IconButton>
          <IconButton
            enterDelayMs={defaultEnterDelayInMs}
            label={t('deleteQuestion', 'Delete question')}
            kind="ghost"
            onClick={launchDeleteQuestionModal}
            size="md"
          >
            <TrashCan />
          </IconButton>
          {question?.questions && (
            <span className={styles.collapseIconWrapper}>
              {isCollapsed ? (
                <ChevronDownIcon className={styles.collapseIcon} aria-label="Expand" />
              ) : (
                <ChevronUpIcon className={styles.collapseIcon} aria-label="Collapse" />
              )}
            </span>
          )}
        </div>
      </div>
      {question?.questions && (
        <div
          className={classNames(styles.obsQuestions, {
            [styles.hiddenAccordion]: isCollapsed,
            [styles.accordionContainer]: !isCollapsed,
          })}
        >
          <SortableContext items={question.questions.map(qn => qn.id)}>
            {children}
          </SortableContext>
        </div>
      )}
    </div>
  );
};

export default DraggableQuestion;
