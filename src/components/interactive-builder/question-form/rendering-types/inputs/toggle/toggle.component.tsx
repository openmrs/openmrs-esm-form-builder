import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@carbon/react';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { ComponentProps } from '../../../../../../types';

const Toggle: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const { t } = useTranslation();
  const [toggleLabelTrue, setToggleLabelTrue] = useState(formField.questionOptions?.toggleOptions?.labelTrue ?? '');
  const [toggleLabelFalse, setToggleLabelFalse] = useState(formField.questionOptions?.toggleOptions?.labelFalse ?? '');
  return (
    <>
      <TextInput
        id="labelTrue"
        labelText={t('labelTrue', 'Label true')}
        value={t(toggleLabelTrue || '')}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setToggleLabelTrue(event.target.value);
          const updatedQuestion: FormField = {
            ...formField,
            questionOptions: {
              ...formField.questionOptions,
              toggleOptions: { ...formField.questionOptions.toggleOptions, labelTrue: event.target.value },
            },
          };
          setFormField(updatedQuestion);
        }}
        placeholder={t('on', 'On')}
      />
      <TextInput
        id="labelFalse"
        labelText={t('labelFalse', 'Label false')}
        value={t(toggleLabelFalse || '')}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setToggleLabelFalse(event.target.value);
          const updatedQuestion: FormField = {
            ...formField,
            questionOptions: {
              ...formField.questionOptions,
              toggleOptions: { ...formField.questionOptions.toggleOptions, labelFalse: event.target.value },
            },
          };
          setFormField(updatedQuestion);
        }}
        placeholder={t('off', 'Off')}
      />
    </>
  );
};

export default Toggle;
