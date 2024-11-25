import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormLabel, InlineNotification, ComboBox, InlineLoading } from '@carbon/react';
import { usePatientIdentifierTypes } from '../../../../../../hooks/usePatientIdentifierTypes';
import { usePatientIdentifierName } from '../../../../../../hooks/usePatientIdentifierName';
import type { ComponentProps, PatientIdentifierType } from '../../../../../../types';
import styles from './patient-identifier-type-question.scss';

const PatientIdentifierTypeQuestion: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const { t } = useTranslation();
  const { patientIdentifierTypes, patientIdentifierTypeLookupError } = usePatientIdentifierTypes();
  const { patientIdentifierNameLookupError, isLoadingPatientidentifierName } = usePatientIdentifierName(
    formField.questionOptions?.identifierType ?? '',
  );
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

  return (
    <div>
      <FormLabel className={styles.label}>
        {t('searchForBackingPatientIdentifierType', 'Search for a backing patient identifier type')}
      </FormLabel>
      {patientIdentifierTypeLookupError || patientIdentifierNameLookupError ? (
        <InlineNotification
          kind="error"
          lowContrast
          className={styles.error}
          title={t('errorFetchingPatientIdentifierTypes', 'Error fetching patient identifier types')}
          subtitle={t('pleaseTryAgain', 'Please try again.')}
        />
      ) : null}
      {isLoadingPatientidentifierName ? (
        <InlineLoading className={styles.loader} description={t('loading', 'Loading') + '...'} />
      ) : (
        <ComboBox
          helperText={t(
            'patientIdentifierTypeHelperText',
            'Patient identifier type fields must be linked to a patient identifier type',
          )}
          id="patientIdentifierTypeLookup"
          items={patientIdentifierTypes}
          itemToString={(item: PatientIdentifierType) => item?.display}
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
