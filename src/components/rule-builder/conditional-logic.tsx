import React from 'react';
import type { Question, Schema } from '../../types';
import RuleBuilder, { type FormRule } from './rule-builder.component';
import { v4 as uuidv4 } from 'uuid';

interface ConditionalLogicProps {
  pageIndex: number;
  sectionIndex: number;
  questionIndex: number;
  question: Question;
  schema: Schema;
  rules: Array<FormRule>;
  handleAddLogic: (fieldId: string) => void;
  onSchemaChange: (schema: Schema) => void;
}

const ConditionalLogic: React.FC<ConditionalLogicProps> = ({
  question,
  pageIndex,
  sectionIndex,
  questionIndex,
  rules,
  schema,
  onSchemaChange,
  handleAddLogic,
}) => {
  const rulesForQuestionIndex = rules?.findIndex((rule: FormRule) => rule?.question === question?.id);
  const rulesForQuestion =
    rulesForQuestionIndex !== -1 && rulesForQuestionIndex !== undefined
      ? rules?.filter((rule: FormRule) => rule?.question === question?.id)
      : [{ id: uuidv4(), isNewRule: false, question: question?.id }];
  return (
    <>
      {rulesForQuestion.map((rule: FormRule) => (
        <RuleBuilder
          ruleId={rule.id}
          key={question.id}
          question={question}
          pageIndex={pageIndex}
          sectionIndex={sectionIndex}
          questionIndex={questionIndex}
          handleAddLogic={handleAddLogic}
          isNewRule={rule.isNewRule}
          schema={schema}
          onSchemaChange={onSchemaChange}
        />
      ))}
    </>
  );
};

export default ConditionalLogic;
