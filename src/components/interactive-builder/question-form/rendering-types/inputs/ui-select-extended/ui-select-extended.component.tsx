import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RadioButtonGroup, RadioButton } from '@carbon/react';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { ComponentProps } from '../../../../../../types';

const UiSelectExtended: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const { t } = useTranslation();
  const [searchable, setSearchable] = useState(formField.questionOptions?.isSearchable ?? false);
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
            const updatedQuestion: FormField = {
              ...formField,
              questionOptions: { ...formField.questionOptions, isSearchable: false },
            };
            setFormField(updatedQuestion);
          }}
          value="optional"
        />
        <RadioButton
          id="uiSelectSearchable"
          defaultChecked={searchable}
          labelText={t('searchable', 'Searchable')}
          onClick={() => {
            setSearchable(true);
            const updatedQuestion: FormField = {
              ...formField,
              questionOptions: { ...formField.questionOptions, isSearchable: true },
            };
            setFormField(updatedQuestion);
          }}
          value="required"
        />
      </RadioButtonGroup>
    </>
  );
};

export default UiSelectExtended;
