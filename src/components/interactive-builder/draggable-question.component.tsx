import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "react-i18next";
import { Button } from "@carbon/react";
import { Edit, Replicate, TrashCan, Draggable } from "@carbon/react/icons";
import type { Question } from "../../types";
import styles from "./draggable-question.scss";

type DraggableQuestionProps = {
  allQuestions: Array<Question>;
  question: Question;
  pageIndex: number;
  sectionIndex: number;
  questionIndex: number;
  duplicateQuestion: (
    question: Question,
    pageId: number,
    sectionId: number
  ) => void;
  handleEditButtonClick: (question: Question) => void;
  handleDeleteButtonClick: (question: Question) => void;
};

export const DraggableQuestion: React.FC<DraggableQuestionProps> = ({
  question,
  pageIndex,
  sectionIndex,
  questionIndex,
  duplicateQuestion,
  handleDeleteButtonClick,
  handleEditButtonClick,
  allQuestions,
}) => {
  const { t } = useTranslation();
  const draggableId = `question-${pageIndex}-${sectionIndex}-${questionIndex}`;

  const { attributes, listeners, transform, isDragging, setNodeRef } =
    useDraggable({
      id: draggableId,
      disabled: allQuestions.length <= 1,
    });
  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: isDragging ? "grabbing" : "grab",
  };
  const dragStyles = isDragging ? styles.isDragged : styles.normal;

  return (
    <div className={dragStyles} style={style}>
      <div
        className={styles.questionContainer}
        ref={setNodeRef}
        {...attributes}
        {...listeners}
      >
        <Draggable className={styles.draggableIcon} />
        <p className={styles.questionLabel}>{question.label}</p>
      </div>

      <div className={styles.buttonsContainer}>
        <Button
          kind="ghost"
          size="sm"
          enterDelayMs={200}
          iconDescription={t("duplicateQuestion", "Duplicate question")}
          onClick={() => {
            if (!isDragging) {
              duplicateQuestion(question, pageIndex, sectionIndex);
            }
          }}
          renderIcon={(props) => <Replicate size={16} {...props} />}
          hasIconOnly
        />
        <Button
          kind="ghost"
          size="sm"
          enterDelayMs={200}
          iconDescription={t("editQuestion", "Edit question")}
          onClick={() => {
            if (!isDragging) {
              handleEditButtonClick(question);
            }
          }}
          renderIcon={(props) => <Edit size={16} {...props} />}
          hasIconOnly
        />
        <Button
          hasIconOnly
          enterDelayMs={200}
          iconDescription={t("deleteQuestion", "Delete question")}
          kind="ghost"
          onClick={handleDeleteButtonClick}
          renderIcon={(props) => <TrashCan size={16} {...props} />}
          size="sm"
        />
      </div>
    </div>
  );
};
