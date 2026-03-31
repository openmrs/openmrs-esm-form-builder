import React, { useState, useCallback, useEffect } from 'react';
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

  const attributeTypeUuid = (formField.questionOptions as { attributeType?: string })?.attributeType;
  const [selectedPersonAttributeType, setSelectedPersonAttributeType] = useState<PersonAttributeType | null>(null);
  const [isInvalidAttributeType, setIsInvalidAttributeType] = useState(false);

  // Sync selected person attribute type when personAttributeTypes loads or attributeTypeUuid changes
  useEffect(() => {
    if (attributeTypeUuid && personAttributeTypes.length > 0) {
      const matchingType = personAttributeTypes.find(
        (personAttributeType) => personAttributeType.uuid === attributeTypeUuid,
      );
      if (matchingType) {
        setSelectedPersonAttributeType(matchingType);
        setIsInvalidAttributeType(false);
      } else {
        setSelectedPersonAttributeType(null);
        setIsInvalidAttributeType(true);
      }
    } else if (!attributeTypeUuid) {
      setSelectedPersonAttributeType(null);
      setIsInvalidAttributeType(false);
    }
  }, [attributeTypeUuid, personAttributeTypes]);

  const handlePersonAttributeTypeChange = ({ selectedItem }: { selectedItem: PersonAttributeType }) => {
    setSelectedPersonAttributeType(selectedItem);
    setFormField({
      ...formField,
      questionOptions: {
        ...formField.questionOptions,
        attributeType: selectedItem?.uuid,
      } as typeof formField.questionOptions & { attributeType?: string },
    });
  };

  const convertItemsToString = useCallback((item: PersonAttributeType) => item?.display ?? '', []);

  return (
    <div>
      <FormLabel className={styles.label}>
        {t('searchForBackingPersonAttributeType', 'Search for a backing person attribute type')}
      </FormLabel>
      {isInvalidAttributeType && (
        <InlineNotification
          kind="warning"
          lowContrast
          className={styles.error}
          title={t('invalidPersonAttributeType', 'Invalid person attribute type')}
          subtitle={t(
            'personAttributeTypeNotFound',
            'The configured person attribute type ({{uuid}}) was not found. It may have been deleted or retired.',
            { uuid: attributeTypeUuid },
          )}
        />
      )}
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
          disabled={!!personAttributeTypeLookupError}
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
        />
      )}
    </div>
  );
};

export default PersonAttributeTypeQuestion;
