import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FormLabel, InlineNotification, ComboBox, InlineLoading } from '@carbon/react';
import { usePersonAttributeTypes } from '@hooks/usePersonAttributeTypes';
import { useFormField } from '../../../../form-field-context';
import type { PersonAttributeType } from '@types';
import styles from './person-attribute-type-question.scss';

const PersonAttributeTypeQuestion: React.FC = () => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();
  const { personAttributeTypes, personAttributeTypeLookupError, isLoadingPersonAttributeTypes } =
    usePersonAttributeTypes();

  const attributeTypeUuid = (formField.questionOptions as any)?.attributeType;
  const [selectedPersonAttributeType, setSelectedPersonAttributeType] = useState<PersonAttributeType | null>(
    attributeTypeUuid
      ? personAttributeTypes.find((personAttributeType) => personAttributeType.uuid === attributeTypeUuid)
      : null,
  );

  const handlePersonAttributeTypeChange = ({ selectedItem }: { selectedItem: PersonAttributeType }) => {
    setSelectedPersonAttributeType(selectedItem);
    setFormField({
      ...formField,
      questionOptions: {
        ...formField.questionOptions,
        attributeType: selectedItem?.uuid,
      } as any,
    });
  };

  const convertItemsToString = useCallback((item: PersonAttributeType) => item?.display ?? '', []);

  return (
    <div>
      <FormLabel className={styles.label}>
        {t('searchForBackingPersonAttributeType', 'Search for a backing person attribute type')}
      </FormLabel>
      {personAttributeTypeLookupError && (
        <InlineNotification
          kind="error"
          lowContrast
          className={styles.error}
          title={t('errorFetchingPersonAttributeTypes', 'Error fetching person attribute types')}
          subtitle={t('pleaseTryAgain', 'Please try again.')}
        />
      )}
      {isLoadingPersonAttributeTypes ? (
        <InlineLoading className={styles.loader} description={t('loading', 'Loading') + '...'} />
      ) : (
        <ComboBox
          helperText={t(
            'personAttributeTypeHelperText',
            'Person attribute type fields must be linked to a person attribute type',
          )}
          id="personAttributeTypeLookup"
          items={personAttributeTypes}
          itemToString={convertItemsToString}
          onChange={handlePersonAttributeTypeChange}
          placeholder={t('choosePersonAttributeType', 'Choose a person attribute type')}
          selectedItem={selectedPersonAttributeType}
          initialSelectedItem={personAttributeTypes.find(
            (personAttributeType) => personAttributeType?.uuid === attributeTypeUuid,
          )}
        />
      )}
    </div>
  );
};

export default PersonAttributeTypeQuestion;
