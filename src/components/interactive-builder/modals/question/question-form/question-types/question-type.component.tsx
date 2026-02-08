import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FormLabel, InlineNotification, ComboBox, InlineLoading } from '@carbon/react';
import {
  ObsTypeQuestion,
  ProgramStateTypeQuestion,
  PatientIdentifierTypeQuestion,
  TestOrderTypeQuestion,
} from './inputs';
import { useFormField } from '../../form-field-context';
import { usePersonAttributeTypes } from '@hooks/usePersonAttributeTypes';
import type { QuestionType, PersonAttributeType } from '@types';

const componentMap: Partial<Record<QuestionType, React.FC>> = {
  obs: ObsTypeQuestion,
  programState: ProgramStateTypeQuestion,
  patientIdentifier: PatientIdentifierTypeQuestion,
  obsGroup: ObsTypeQuestion,
  testOrder: TestOrderTypeQuestion,
};

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
      <FormLabel style={{ display: 'block', marginBottom: '0.5rem' }}>
        {t('searchForBackingPersonAttributeType', 'Search for a backing person attribute type')}
      </FormLabel>
      {personAttributeTypeLookupError && (
        <InlineNotification
          kind="error"
          lowContrast
          style={{ marginBottom: '1rem' }}
          title={t('errorFetchingPersonAttributeTypes', 'Error fetching person attribute types')}
          subtitle={t('pleaseTryAgain', 'Please try again.')}
        />
      )}
      {isLoadingPersonAttributeTypes ? (
        <InlineLoading style={{ marginTop: '1rem' }} description={t('loading', 'Loading') + '...'} />
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

const QuestionTypeComponent: React.FC = () => {
  const { formField } = useFormField();

  // Handle personAttribute inline
  if (formField.type === 'personAttribute') {
    return <PersonAttributeTypeQuestion />;
  }

  const Component = componentMap[formField.type as QuestionType];
  if (!Component) {
    console.error(`No component found for questiontype: ${formField.type}`);
    return null;
  }
  return <Component />;
};

export default QuestionTypeComponent;
