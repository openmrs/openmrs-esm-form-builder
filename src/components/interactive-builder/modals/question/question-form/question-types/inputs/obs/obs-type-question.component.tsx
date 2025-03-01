import React, { useCallback, useMemo } from 'react';
import { FormLabel, InlineNotification, FormGroup, Stack } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import ConceptSearch from '../../../common/concept-search/concept-search.component';
import { useFormField } from '../../../../form-field-context';
import type { Concept, ConceptMapping, DatePickerType } from '@types';
import styles from './obs-type-question.scss';

interface ObsTypeQuestionProps {
  setIsConceptIdValid?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ObsTypeQuestion: React.FC<ObsTypeQuestionProps> = ({ setIsConceptIdValid }) => {
  const { t } = useTranslation();
  const { formField, setFormField, concept, setConcept } = useFormField();

  const getDatePickerType = useCallback((selectedConcept: Concept): DatePickerType | null => {
    switch (selectedConcept.datatype.name) {
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
      if (selectedConcept) {
        setConcept(selectedConcept);
        const datePickerType = getDatePickerType(selectedConcept);
        setFormField((prevField) => ({
          ...prevField,
          questionOptions: {
            ...prevField.questionOptions,
            concept: selectedConcept.uuid,
          },
          ...(datePickerType && { datePickerFormat: datePickerType }),
        }));
      }
    },
    [getDatePickerType, setFormField, setConcept],
  );

  const clearSelectedConcept = useCallback(() => {
    setConcept(null);
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

  const conceptMappings: ConceptMapping[] = useMemo(() => {
    if (concept && concept.mappings) {
      return concept.mappings.map((conceptMapping) => {
        const data = conceptMapping.display.split(': ');
        return {
          relationship: conceptMapping.conceptMapType.display,
          type: data[0],
          value: data[1],
        };
      });
    }
    return [];
  }, [concept]);

  return (
    <Stack gap={5}>
      <ConceptSearch
        defaultConcept={formField.questionOptions?.concept ?? null}
        onClearSelectedConcept={clearSelectedConcept}
        onSelectConcept={handleConceptSelect}
        retainConceptInContextAfterSearch={true}
        onConceptValidityChange={(valid) => setIsConceptIdValid?.(valid)}
      />

      {concept?.allowDecimal === false && (
        <InlineNotification
          kind="info"
          lowContrast
          title={t('decimalsNotAllowed', 'This concept does not allow decimals')}
        />
      )}

      {conceptMappings.length > 0 && (
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
      )}
    </Stack>
  );
};

export default ObsTypeQuestion;
