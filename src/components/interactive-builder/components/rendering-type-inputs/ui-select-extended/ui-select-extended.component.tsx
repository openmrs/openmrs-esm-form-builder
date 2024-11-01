import React, { useState } from 'react';
import { RadioButtonGroup, RadioButton } from '@carbon/react';
import type { Question } from '../../../../../types';
import { useTranslation } from 'react-i18next';

interface UiSelectExtendedProps {
  question: Question;
  updateQuestion: (question: Question) => void;
}

const UiSelectExtended: React.FC<UiSelectExtendedProps> = ({ question, updateQuestion }) => {
  const { t } = useTranslation();
  const [searchable, setSearchable] = useState(question.questionOptions?.isSearchable ?? false);
  return (
    <>
      <RadioButtonGroup
        defaultSelected="optional"
        name="isUiSelectSearchable"
        legendText={t('is', 'Is the ui-select-extended rendering searchable')}
      >
        <RadioButton
          id="uiSelectNotSearchable"
          defaultChecked={!searchable}
          labelText={t('notSearchable', 'Not Searchable')}
          onClick={() => {
            setSearchable(false);
            const updatedQuestion: Question = {
              ...question,
              questionOptions: { ...question.questionOptions, isSearchable: false },
            };
            updateQuestion(updatedQuestion);
          }}
          value="optional"
        />
        <RadioButton
          id="uiSelectSearchable"
          defaultChecked={searchable}
          labelText={t('searchable', 'Searchable')}
          onClick={() => {
            setSearchable(true);
            const updatedQuestion: Question = {
              ...question,
              questionOptions: { ...question.questionOptions, isSearchable: true },
            };
            updateQuestion(updatedQuestion);
          }}
          value="required"
        />
      </RadioButtonGroup>
    </>
  );
};

export default UiSelectExtended;
