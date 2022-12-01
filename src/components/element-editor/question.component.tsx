import React from "react";
import { TrashCan } from "@carbon/react/icons";
import { Button, Column, Row } from "@carbon/react";
import { Question, Schema } from "../../types";
import EditQuestion from "../modals/edit-question.component";
import styles from "./elements.scss";

interface QuestionElementProps {
  question: Question;
  index: any;
  deleteQuestion: (index: number) => void;
  schema: Schema;
  onSchemaUpdate: (schema: Schema) => void;
}

const QuestionElement: React.FC<QuestionElementProps> = ({
  question,
  index,
  deleteQuestion,
  schema,
  onSchemaUpdate,
}) => {
  return (
    <div className={styles.questionWrap}>
      <Row>
        <Column>
          <div className={styles.questionLabel}>{question.label}</div>
        </Column>
        <Column>
          <EditQuestion
            question={question}
            schema={schema}
            onSchemaUpdate={onSchemaUpdate}
          />
          <Button
            size="sm"
            renderIcon={TrashCan}
            iconDescription="Delete Question"
            hasIconOnly
            kind="ghost"
            onClick={() => {
              deleteQuestion(index);
            }}
          />
        </Column>
      </Row>
    </div>
  );
};
export default QuestionElement;
