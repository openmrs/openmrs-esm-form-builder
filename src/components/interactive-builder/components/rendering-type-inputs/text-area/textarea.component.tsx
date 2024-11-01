import React, { useState } from 'react';
import { TextInput } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import type { Question } from '../../../../../types';

interface TextAreaProps {
  question: Question;
  updateQuestion: (question: Question) => void;
}

const TextArea: React.FC<TextAreaProps> = ({ question, updateQuestion }) => {
  const { t } = useTranslation();
  const [rows, setRows] = useState(question.questionOptions?.rows ?? '');
  return (
    <TextInput
      id="textAreaRows"
      labelText={t('rows', 'Rows')}
      value={rows || ''}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setRows(event.target.value);
        const updatedQuestion: Question = {
          ...question,
          questionOptions: { ...question.questionOptions, rows: event.target.value },
        };
        updateQuestion(updatedQuestion);
      }}
    />
  );
};

export default TextArea;
