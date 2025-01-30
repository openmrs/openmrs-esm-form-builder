import React, { useCallback, useState } from 'react';
import { FormLabel, InlineNotification, FormGroup, Stack } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import ConceptSearch from '../../../common/concept-search/concept-search.component';
import { useFormField } from '../../../../form-field-context';
import type { Concept, ConceptMapping, DatePickerType } from '@types';
import styles from './obs-type-question.scss';

const ObsTypeQuestion: React.FC = () => {
  const { t } = useTranslation();
  const { formField, setFormField, concept, setConcept } = useFormField();
  const [conceptMappings, setConceptMappings] = useState<Array<ConceptMapping>>([]);

  const getDatePickerType = useCallback((concept: Concept): DatePickerType | null => {
    const conceptDataType = concept.datatype.name;
    switch (conceptDataType) {
      case 'Datetime':
        return 'both';
      case 'Date':
        return 'calendar';
      case 'Time':
        return 'timer';
      default:
        return null;
    }
  }, []);

  const handleConceptSelect = useCallback(
    (selectedConcept: Concept) => {
      setConcept(selectedConcept);
      if (selectedConcept) {
        const datePickerType = getDatePickerType(selectedConcept);
        setFormField((prevField) => ({
          ...prevField,
          questionOptions: {
            ...prevField.questionOptions,
            concept: selectedConcept.uuid,
          },
          ...(datePickerType && { datePickerFormat: datePickerType }),
        }));
        setConceptMappings(
          selectedConcept?.mappings?.map((conceptMapping) => {
            const data = conceptMapping.display.split(': ');
            return {
              relationship: conceptMapping.conceptMapType.display,
              type: data[0],
              value: data[1],
            };
          }),
        );
      }
    },
    [getDatePickerType, setFormField, setConcept],
  );

  const clearSelectedConcept = useCallback(() => {
    setConcept(null);
    setConceptMappings([]);

    setFormField((prevFormField) => {
      const updatedFormField = { ...prevFormField };
      if (updatedFormField.questionOptions) {
        delete updatedFormField.questionOptions.concept;
        delete updatedFormField.questionOptions.answers;
      }
      if (updatedFormField.datePickerFormat) {
        delete updatedFormField.datePickerFormat;
      }
      return updatedFormField;
    });
  }, [setFormField, setConcept]);

  return (
    <Stack gap={5}>
      <ConceptSearch
        defaultConcept={formField.questionOptions?.concept ?? null}
        onClearSelectedConcept={clearSelectedConcept}
        onSelectConcept={handleConceptSelect}
      />

      {concept?.allowDecimal === false && (
        <InlineNotification
          kind="info"
          lowContrast
          title={t('decimalsNotAllowed', 'This concept does not allow decimals')}
        />
      )}

      {conceptMappings?.length ? (
        <FormGroup>
          <FormLabel className={styles.label}>{t('mappings', 'Mappings')}</FormLabel>
          <table className={styles.tableStriped}>
            <thead>
              <tr>
                <th>{t('relationship', 'Relationship')}</th>
                <th>{t('source', 'Source')}</th>
                <th>{t('code', 'Code')}</th>
              </tr>
            </thead>
            <tbody>
              {conceptMappings.map((mapping, index) => (
                <tr key={`mapping-${index}`}>
                  <td>{mapping.relationship}</td>
                  <td>{mapping.type}</td>
                  <td>{mapping.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormGroup>
      ) : null}
    </Stack>
  );
};

export default ObsTypeQuestion;
