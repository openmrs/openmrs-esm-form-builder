import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@carbon/react';
import { Draggable, Edit, TrashCan, Copy } from '@carbon/react/icons';
import { showModal, ChevronDownIcon, ChevronUpIcon } from '@openmrs/esm-framework';
import MarkdownWrapper from '../markdown-wrapper/markdown-wrapper';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { Schema } from '@types';
import styles from './draggable-question.scss';

interface DraggableQuestionProps {
  handleDuplicateQuestion: (question: FormField, pageId: number, sectionId: number, questionId?: number) => void;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  question: FormField;
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
      setIsCollapsed(!isCollapsed);
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

  const { attributes, listeners, setNodeRef, active, isDragging, over } = useSortable({
    id: question.id,
    data: {
      type: subQuestionIndex === null || subQuestionIndex === undefined ? 'question' : 'obsQuestion',
      question: {
        handleDuplicateQuestion,
        onSchemaChange,
        pageIndex,
        sectionIndex,
        question,
        questionCount,
        questionIndex,
        subQuestionIndex: subQuestionIndex ?? null,
        schema,
      },
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
          [styles.obsGroup]: question?.questions && question?.questions.length > 0,
        })}
        onClick={toggleCollapse}
      >
        <div className={styles.iconAndName}>
          <div {...attributes} {...listeners}>
            <IconButton
              enterDelayMs={defaultEnterDelayInMs}
              label={t('dragToReorder', 'Drag to reorder')}
              kind="ghost"
              size="md"
              className={styles.dragIcon}
              onClick={(e) => e.stopPropagation()}
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
          <IconButton
            enterDelayMs={defaultEnterDelayInMs}
            label={t('duplicateQuestion', 'Duplicate question')}
            kind="ghost"
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicate();
            }}
          >
            <Copy />
          </IconButton>

          <IconButton
            enterDelayMs={defaultEnterDelayInMs}
            label={t('editQuestion', 'Edit question')}
            kind="ghost"
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              launchEditQuestionModal();
            }}
          >
            <Edit />
          </IconButton>

          <IconButton
            enterDelayMs={defaultEnterDelayInMs}
            label={t('deleteQuestion', 'Delete question')}
            kind="ghost"
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              launchDeleteQuestionModal();
            }}
          >
            <TrashCan />
          </IconButton>

          {question?.questions && question?.questions.length > 0 && (
            <span className={styles.collapseIconWrapper} onClick={(e) => e.stopPropagation()}>
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
          <SortableContext items={question.questions.map((qn) => qn.id)}>{children}</SortableContext>
        </div>
      )}
    </div>
  );
};

export default DraggableQuestion;
