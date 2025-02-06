import React, { useCallback } from 'react';
import { RadioButtonGroup, RadioButton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useFormField } from '../../../../form-field-context';
import type { DatePickerTypeOption } from '@types';

const Date: React.FC = () => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();

  const datePickerTypeOptions: Record<string, Array<DatePickerTypeOption>> = {
    datetime: [{ value: 'both', label: t('calendarAndTimer', 'Calendar and timer'), defaultChecked: true }],
    date: [{ value: 'calendar', label: t('calendarOnly', 'Calendar only'), defaultChecked: false }],
    time: [{ value: 'timer', label: t('timerOnly', 'Timer only'), defaultChecked: false }],
  };

  const handleDatePickerTypeChange = useCallback(
    (type: DatePickerTypeOption) => {
      setFormField((prevField) => ({
        ...prevField,
        datePickerFormat: type.value,
      }));
    },
    [setFormField],
  );

  return (
    <RadioButtonGroup name="datePickerType" legendText={t('datePickerType', 'The type of date picker to show ')}>
      {Object.values(datePickerTypeOptions)
        .flat()
        .map((type) => (
          <RadioButton
            key={`date-picker-type-${type.value}`}
            id={type.value}
            checked={formField.datePickerFormat && formField.datePickerFormat === type.value}
            labelText={type.label}
            onClick={handleDatePickerTypeChange.bind(null, type)}
            value={type.value}
          />
        ))}
    </RadioButtonGroup>
  );
};

export default Date;
