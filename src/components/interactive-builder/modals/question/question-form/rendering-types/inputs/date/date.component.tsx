import React, { useCallback } from 'react';
import { RadioButtonGroup, RadioButton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import type { DatePickerTypeOption, ComponentProps } from '@types';

const Date: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const { t } = useTranslation();

  const datePickerTypeOptions: Record<string, Array<DatePickerTypeOption>> = {
    datetime: [{ value: 'both', label: t('calendarAndTimer', 'Calendar and timer'), defaultChecked: true }],
    date: [{ value: 'calendar', label: t('calendarOnly', 'Calendar only'), defaultChecked: false }],
    time: [{ value: 'timer', label: t('timerOnly', 'Timer only'), defaultChecked: false }],
  };

  const handleDatePickerTypeChange = useCallback(
    (type: DatePickerTypeOption) => {
      setFormField({ ...formField, datePickerFormat: type.value });
    },
    [formField, setFormField],
  );
  return (
    <RadioButtonGroup name="datePickerType" legendText={t('datePickerType', 'The type of date picker to show ')}>
      {Object.values(datePickerTypeOptions)
        .flat()
        .map((type) => (
          <RadioButton
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
