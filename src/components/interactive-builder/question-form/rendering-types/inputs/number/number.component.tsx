import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@carbon/react';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { ComponentProps } from '../../../../../../types';

const Number: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const { t } = useTranslation();
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
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
        value={max || ''}
        invalid={parseFloat(min) > parseFloat(max)}
        invalidText={
          parseFloat(min) > parseFloat(max) ? t('invalidMinMax', 'Min value cannot be greater than max') : ''
        }
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setMax(event.target.value);
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
