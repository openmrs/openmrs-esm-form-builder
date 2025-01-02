import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FormLabel, InlineNotification, ComboBox, InlineLoading } from '@carbon/react';
import { usePatientIdentifierTypes } from '@hooks/usePatientIdentifierTypes';
import { useFormField } from '../../../../form-field-context';
import type { PatientIdentifierType } from '@types';
import styles from './patient-identifier-type-question.scss';

const PatientIdentifierTypeQuestion: React.FC = () => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();
  const { patientIdentifierTypes, patientIdentifierTypeLookupError, isLoadingPatientIdentifierTypes } =
    usePatientIdentifierTypes();
  const [selectedPatientIdetifierType, setSelectedPatientIdetifierType] = useState<PatientIdentifierType>(
    formField.questionOptions?.identifierType
      ? patientIdentifierTypes.find(
          (patientIdentifierType) => patientIdentifierType.uuid === formField.questionOptions.identifierType,
        )
      : null,
  );

  const handlePatientIdentifierTypeChange = ({ selectedItem }: { selectedItem: PatientIdentifierType }) => {
    setSelectedPatientIdetifierType(selectedItem);
    setFormField({
      ...formField,
      questionOptions: {
        ...formField.questionOptions,
        identifierType: selectedItem.uuid,
      },
    });
  };

  const convertItemsToString = useCallback((item: PatientIdentifierType) => item?.display ?? '', []);

  return (
    <div>
      <FormLabel className={styles.label}>
        {t('searchForBackingPatientIdentifierType', 'Search for a backing patient identifier type')}
      </FormLabel>
      {patientIdentifierTypeLookupError && (
        <InlineNotification
          kind="error"
          lowContrast
          className={styles.error}
          title={t('errorFetchingPatientIdentifierTypes', 'Error fetching patient identifier types')}
          subtitle={t('pleaseTryAgain', 'Please try again.')}
        />
      )}
      {isLoadingPatientIdentifierTypes ? (
        <InlineLoading className={styles.loader} description={t('loading', 'Loading') + '...'} />
      ) : (
        <ComboBox
          helperText={t(
            'patientIdentifierTypeHelperText',
            'Patient identifier type fields must be linked to a patient identifier type',
          )}
          id="patientIdentifierTypeLookup"
          items={patientIdentifierTypes}
          itemToString={convertItemsToString}
          onChange={handlePatientIdentifierTypeChange}
          placeholder={t('choosePatientIdentifierType', 'Choose a patient identifier type')}
          selectedItem={selectedPatientIdetifierType}
          initialSelectedItem={patientIdentifierTypes.find(
            (patientIdentifierType) => patientIdentifierType?.uuid === formField.questionOptions?.identifierType,
          )}
        />
      )}
    </div>
  );
};

export default PatientIdentifierTypeQuestion;
