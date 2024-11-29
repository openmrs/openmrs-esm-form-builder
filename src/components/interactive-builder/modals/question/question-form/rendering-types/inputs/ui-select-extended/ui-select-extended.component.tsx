import React from 'react';
import { useTranslation } from 'react-i18next';
import { RadioButtonGroup, RadioButton } from '@carbon/react';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { ComponentProps } from '@types';

const UiSelectExtended: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const { t } = useTranslation();
  return (
    <>
      <RadioButtonGroup
        defaultSelected="notSearchable"
        name="isUiSelectSearchable"
        legendText={t('isUiSelectSearchable', 'Is the ui-select-extended rendering searchable')}
      >
        <RadioButton
          id="uiSelectNotSearchable"
          checked={!formField.questionOptions?.isSearchable}
          labelText={t('notSearchable', 'Not Searchable')}
          onClick={() => {
            const updatedQuestion: FormField = {
              ...formField,
              questionOptions: { ...formField.questionOptions, isSearchable: false },
            };
            setFormField(updatedQuestion);
          }}
          value="notSearchable"
        />
        <RadioButton
          id="uiSelectSearchable"
          checked={formField.questionOptions?.isSearchable}
          labelText={t('searchable', 'Searchable')}
          onClick={() => {
            const updatedQuestion: FormField = {
              ...formField,
              questionOptions: { ...formField.questionOptions, isSearchable: true },
            };
            setFormField(updatedQuestion);
          }}
          value="searchable"
        />
      </RadioButtonGroup>
    </>
  );
};

export default UiSelectExtended;
