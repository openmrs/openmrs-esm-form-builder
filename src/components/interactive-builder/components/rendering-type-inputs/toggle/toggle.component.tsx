import React, { useState } from 'react';
import { TextInput } from '@carbon/react';
import type { Question } from '../../../../types';
import { useTranslation } from 'react-i18next';

interface ToggleProps {
  question: Question;
  updateQuestion: (question: Question) => void;
}

const Toggle: React.FC<ToggleProps> = ({ question, updateQuestion }) => {
  const { t } = useTranslation();
  const [toggleLabelTrue, setToggleLabelTrue] = useState(question.questionOptions?.toggleOptions?.labelTrue ?? '');
  const [toggleLabelFalse, setToggleLabelFalse] = useState(question.questionOptions?.toggleOptions?.labelFalse ?? '');
  return (
    <>
      <TextInput
        id="labelTrue"
        labelText={t('labelTrue', 'Label true')}
        value={t(toggleLabelTrue || '')}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setToggleLabelTrue(event.target.value);
          const updatedQuestion: Question = {
            ...question,
            questionOptions: {
              ...question.questionOptions,
              toggleOptions: { ...question.questionOptions.toggleOptions, labelTrue: event.target.value },
            },
          };
          updateQuestion(updatedQuestion);
        }}
        placeholder={t('on', 'On')}
      />
      <TextInput
        id="labelFalse"
        labelText={t('labelFalse', 'Label false')}
        value={t(toggleLabelFalse || '')}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setToggleLabelFalse(event.target.value);
          const updatedQuestion: Question = {
            ...question,
            questionOptions: {
              ...question.questionOptions,
              toggleOptions: { ...question.questionOptions.toggleOptions, labelFalse: event.target.value },
            },
          };
          updateQuestion(updatedQuestion);
        }}
        placeholder={t('off', 'Off')}
      />
    </>
  );
};

export default Toggle;
