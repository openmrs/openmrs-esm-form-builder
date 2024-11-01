import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@carbon/react';
import type { Question } from '../../../../../types';

interface NumberProps {
  question: Question;
  updateQuestion: (question: Question) => void;
}

const Number: React.FC<NumberProps> = ({ question, updateQuestion }) => {
  const { t } = useTranslation();
  const [min, setMin] = useState(question.questionOptions?.min ?? '');
  const [max, setMax] = useState(question.questionOptions?.min ?? '');
  return (
    <>
      <TextInput
        id="min"
        labelText="Min"
        value={min || ''}
        invalid={parseFloat(min) > parseFloat(max)}
        invalidText={
          parseFloat(min) > parseFloat(max) ? t('invalidMinMax', 'Min value cannot be greater than max') : ''
        }
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setMin(event.target.value);
          const updatedQuestion: Question = {
            ...question,
            questionOptions: { ...question.questionOptions, min: event.target.value },
          };
          updateQuestion(updatedQuestion);
        }}
      />
      <TextInput
        id="max"
        labelText="Max"
        value={max || ''}
        invalid={parseFloat(min) > parseFloat(max)}
        invalidText={
          parseFloat(min) > parseFloat(max) ? t('invalidMinMax', 'Min value cannot be greater than max') : ''
        }
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setMax(event.target.value);
          const updatedQuestion: Question = {
            ...question,
            questionOptions: { ...question.questionOptions, min: event.target.value },
          };
          updateQuestion(updatedQuestion);
        }}
      />
    </>
  );
};

export default Number;
