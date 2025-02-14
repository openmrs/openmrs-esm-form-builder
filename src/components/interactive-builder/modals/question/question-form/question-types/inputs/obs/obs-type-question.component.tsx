import React, { useCallback, useMemo, useState } from 'react';
import { FormLabel, InlineNotification, FormGroup, Stack, RadioButton, RadioButtonGroup } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import ConceptSearch from '../../../common/concept-search/concept-search.component';
import { useFormField } from '../../../../form-field-context';
import type { Concept, ConceptMapping, DatePickerType } from '@types';
import styles from './obs-type-question.scss';

const ObsTypeQuestion: React.FC = () => {
  const { t } = useTranslation();
  const { formField, setFormField, concept } = useFormField();
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(null); // Track selected radio button by ID

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
      }
    },
    [getDatePickerType, setFormField],
  );

  const clearSelectedConcept = useCallback(() => {
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
    setSelectedMappingId(null); // Clear selected mapping when concept is cleared
  }, [setFormField]);

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

  const handleRadioSelect = useCallback(
    (mapping: ConceptMapping) => {
      const mappingId = `${mapping.type}:${mapping.value}`;
      setSelectedMappingId(mappingId); // Update selected mapping ID
      setFormField((prevField) => ({
        ...prevField,
        questionOptions: {
          ...prevField.questionOptions,
          concept: mappingId, // Set the concept to the selected mapping's value
        },
      }));
    },
    [setFormField],
  );

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

      {conceptMappings.length > 0 && (
        <FormGroup>
          <FormLabel className={styles.label}>{t('mappings', 'Mappings')}</FormLabel>
          <table className={styles.tableStriped}>
            <thead>
              <tr>
                <th>{t('relationship', 'Relationship')}</th>
                <th>{t('source', 'Source')}</th>
                <th>{t('code', 'Code')}</th>
                <th>{t('select', 'Select')}</th>
              </tr>
            </thead>
            <tbody>
              {conceptMappings.map((mapping, index) => (
                <tr key={`mapping-${index}`}>
                  <td>{mapping.relationship}</td>
                  <td>{mapping.type}</td>
                  <td>{mapping.value}</td>
                  <td>
                    {mapping.relationship === 'SAME-AS' && (
                      <RadioButton
                        id={`radio-${index}`}
                        checked={selectedMappingId === `${mapping.type}:${mapping.value}`} // Control checked state
                        onChange={() => handleRadioSelect(mapping)} // Handle selection
                        labelText="" // No label text since it's in a table
                      />
                    )}
                  </td>
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
