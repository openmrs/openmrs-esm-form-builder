import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@carbon/react';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { ComponentProps } from '@types';

const TextArea: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const { t } = useTranslation();
  return (
    <TextInput
      id="textAreaRows"
      labelText={t('rows', 'Rows')}
      value={formField.questionOptions?.rows ? formField.questionOptions.rows.toString() : ''}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        const updatedQuestion: FormField = {
          ...formField,
          questionOptions: { ...formField.questionOptions, rows: parseInt(event.target.value) },
        };
        setFormField(updatedQuestion);
      }}
    />
  );
};

export default TextArea;
