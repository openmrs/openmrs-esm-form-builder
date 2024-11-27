import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@carbon/react';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { ComponentProps } from '@types';

const Number: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const { t } = useTranslation();
  return (
    <>
      <TextInput
        id="min"
        labelText="Min"
        value={formField.questionOptions?.min ?? ''}
        invalid={parseFloat(formField.questionOptions?.min ?? '') > parseFloat(formField.questionOptions?.max ?? '')}
        invalidText={
          parseFloat(formField.questionOptions?.min ?? '') > parseFloat(formField.questionOptions?.max ?? '')
            ? t('invalidMinMax', 'Min value cannot be greater than max')
            : ''
        }
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const updatedQuestion: FormField = {
            ...formField,
            questionOptions: { ...formField.questionOptions, min: event.target.value },
          };
          setFormField(updatedQuestion);
        }}
      />
      <TextInput
        id="max"
        labelText="Max"
        value={formField.questionOptions?.max ?? ''}
        invalid={parseFloat(formField.questionOptions?.min ?? '') > parseFloat(formField.questionOptions?.max ?? '')}
        invalidText={
          parseFloat(formField.questionOptions?.min ?? '') > parseFloat(formField.questionOptions?.max ?? '')
            ? t('invalidMinMax', 'Min value cannot be greater than max')
            : ''
        }
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const updatedQuestion: FormField = {
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
