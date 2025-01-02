import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@carbon/react';
import { useFormField } from '../../../../form-field-context';

const Number: React.FC = () => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();

  return (
    <>
      <TextInput
        id="min"
        labelText="Min value that can be entered"
        value={formField.questionOptions?.min ?? ''}
        invalid={parseFloat(formField.questionOptions?.min ?? '') > parseFloat(formField.questionOptions?.max ?? '')}
        invalidText={
          parseFloat(formField.questionOptions?.min ?? '') > parseFloat(formField.questionOptions?.max ?? '')
            ? t('invalidMinMax', 'Min value cannot be greater than max')
            : ''
        }
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const updatedQuestion = {
            ...formField,
            questionOptions: { ...formField.questionOptions, min: event.target.value },
          };
          setFormField(updatedQuestion);
        }}
      />
      <TextInput
        id="max"
        labelText="Max value that can be entered"
        value={formField.questionOptions?.max ?? ''}
        invalid={parseFloat(formField.questionOptions?.min ?? '') > parseFloat(formField.questionOptions?.max ?? '')}
        invalidText={
          parseFloat(formField.questionOptions?.min ?? '') > parseFloat(formField.questionOptions?.max ?? '')
            ? t('invalidMinMax', 'Min value cannot be greater than max')
            : ''
        }
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const updatedQuestion = {
            ...formField,
            questionOptions: { ...formField.questionOptions, max: event.target.value },
          };
          setFormField(updatedQuestion);
        }}
      />
    </>
  );
};

export default Number;
