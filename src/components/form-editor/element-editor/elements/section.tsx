import React, { useContext } from "react";
import { TrashCan } from "@carbon/icons-react/next";
import { Button, Column, Row } from "carbon-components-react";
import { Section } from "../../../../api/types";
import { SchemaContext } from "../../../../context/context";
import EditSection from "../../modals/edit-section";
import CreateQuestion from "../../modals/new-question";
import styles from "./elements.scss";
import QuestionElement from "./question";
import { useTranslation } from "react-i18next";

interface SectionElementProps {
  section: Section;
  index: number;
  deleteSection: (index: number) => void;
}

const SectionElement: React.FC<SectionElementProps> = ({
  section,
  index,
  deleteSection,
}) => {
  const { t } = useTranslation();
  const { schema, setSchema } = useContext(SchemaContext);
  const deleteQuestion = (index) => {
    section.questions.splice(index, 1);
    setSchema({ ...schema });
  };
  return (
    <div className={styles.sectionWrap}>
      <Row className={styles.sectionRow}>
        <Column>
          <h4>{section.label}</h4>
        </Column>
        <Column>
          <EditSection section={section} />
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
          <CreateQuestion questions={section.questions} />
        </Column>
      </Row>
      {section.questions
        ? section.questions.map((question, key) => (
            <QuestionElement
              question={question}
              index={key}
              deleteQuestion={deleteQuestion}
              key={key}
            />
          ))
        : null}
    </div>
  );
};
export default SectionElement;
