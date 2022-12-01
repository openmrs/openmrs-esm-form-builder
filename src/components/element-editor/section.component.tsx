import React from "react";
import { TrashCan } from "@carbon/react/icons";
import { Button, Column, Row } from "@carbon/react";
import { Section, Schema } from "../../types";
import { useTranslation } from "react-i18next";
import EditSection from "../modals/edit-section.component";
import CreateQuestion from "../modals/new-question.component";
import QuestionElement from "./question.component";
import styles from "./elements.scss";

interface SectionElementProps {
  section: Section;
  index: number;
  deleteSection: (index: number) => void;
  schema: Schema;
  onSchemaUpdate: (schema: Schema) => void;
}

const SectionElement: React.FC<SectionElementProps> = ({
  section,
  index,
  deleteSection,
  schema,
  onSchemaUpdate,
}) => {
  const { t } = useTranslation();
  const deleteQuestion = (index) => {
    section.questions.splice(index, 1);
    onSchemaUpdate({ ...schema });
  };

  return (
    <div className={styles.sectionWrap}>
      <Row className={styles.sectionRow}>
        <Column>
          <h4>{section.label}</h4>
        </Column>
        <Column>
          <EditSection
            section={section}
            schema={schema}
            onSchemaUpdate={onSchemaUpdate}
          />
          <Button
            size="sm"
            renderIcon={TrashCan}
            iconDescription="Delete Section"
            hasIconOnly
            kind="ghost"
            onClick={() => {
              deleteSection(index);
            }}
          />
        </Column>
      </Row>
      <Row className={styles.questionRow}>
        <Column>
          <h5>{t("questions", "Questions")}</h5>
        </Column>
        <Column>
          <CreateQuestion
            questions={section.questions}
            schema={schema}
            onSchemaUpdate={onSchemaUpdate}
          />
        </Column>
      </Row>
      {section.questions
        ? section.questions.map((question, key) => (
            <QuestionElement
              key={key}
              question={question}
              index={key}
              deleteQuestion={deleteQuestion}
              schema={schema}
              onSchemaUpdate={onSchemaUpdate}
            />
          ))
        : null}
    </div>
  );
};
export default SectionElement;
