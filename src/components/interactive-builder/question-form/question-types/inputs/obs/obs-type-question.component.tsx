import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FormLabel,
  InlineNotification,
  Layer,
  Tile,
  Search,
  InlineLoading,
  MultiSelect,
  FormGroup,
  Tag,
  Stack,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@openmrs/esm-framework';
import { ArrowUpRight } from '@carbon/react/icons';
import { useConceptLookup } from '../../../../../../hooks/useConceptLookup';
import { useConceptId } from '../../../../../../hooks/useConceptName';
import type { Concept, ConceptMapping, DatePickerType, ComponentProps } from '../../../../../../types';
import styles from './obs-type-question.scss';

interface AnswerItem {
  id: string;
  text: string;
}

const ObsTypeQuestion: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const { t } = useTranslation();
  const [conceptToLookup, setConceptToLookup] = useState('');
  const debouncedConceptToLookup = useDebounce(conceptToLookup);
  const { concepts, conceptLookupError, isLoadingConcepts } = useConceptLookup(debouncedConceptToLookup);
  const {
    concept: initialConcept,
    conceptName,
    conceptNameLookupError,
    isLoadingConcept,
  } = useConceptId(formField.questionOptions?.concept ?? '');
  const [selectedConcept, setSelectedConcept] = useState<Concept>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Array<AnswerItem>>(
    formField.questionOptions?.answers
      ? formField.questionOptions.answers.map((answer) => ({
          id: answer.concept,
          text: answer.label,
        }))
      : [],
  );
  const [conceptMappings, setConceptMappings] = useState<Array<ConceptMapping>>([]);

  useEffect(() => {
    if (initialConcept) {
      setSelectedConcept(initialConcept);
      setConceptMappings(
        initialConcept?.mappings?.map((conceptMapping) => {
          const data = conceptMapping.display.split(': ');
          return {
            relationship: conceptMapping.conceptMapType.display,
            type: data[0],
            value: data[1],
          };
        }),
      );
    }
  }, [initialConcept]);

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

  const handleConceptChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setConceptToLookup(event.target.value),
    [],
  );

  const handleConceptSelect = useCallback(
    (concept: Concept) => {
      setConceptToLookup('');
      setSelectedConcept(concept);
      setConceptMappings(
        concept?.mappings?.map((conceptMapping) => {
          const data = conceptMapping.display.split(': ');
          return {
            relationship: conceptMapping.conceptMapType.display,
            type: data[0],
            value: data[1],
          };
        }),
      );
      const datePickerType = getDatePickerType(concept);
      const updatedFormField = {
        ...formField,
        questionOptions: { ...formField.questionOptions, concept: concept.uuid },
        ...(datePickerType && { datePickerFormat: datePickerType }),
      };
      setFormField(updatedFormField);
    },
    [formField, getDatePickerType, setFormField],
  );

  const selectAnswers = useCallback(
    ({ selectedItems }: { selectedItems: Array<AnswerItem> }) => {
      setSelectedAnswers(selectedItems);
      setFormField({
        ...formField,
        questionOptions: {
          ...formField.questionOptions,
          answers: selectedItems.map((answer) => ({
            concept: answer.id,
            label: answer.text,
          })),
        },
      });
    },
    [formField, setFormField],
  );

  const clearSelectedConcept = useCallback(() => {
    setSelectedConcept(null);
    setConceptMappings([]);
    const updatedFormField = { ...formField };
    if (updatedFormField.questionOptions) {
      delete updatedFormField.questionOptions.concept, updatedFormField.questionOptions.answers;
    }
    if (updatedFormField.datePickerFormat) delete updatedFormField.datePickerFormat;
    setFormField(updatedFormField);
  }, [formField, setFormField]);

  const items = useMemo(() => {
    // Convert concept answers to items format
    const conceptAnswerItems =
      selectedConcept?.answers?.map((answer) => ({
        id: answer.uuid,
        text: answer.display,
      })) ?? [];

    const formFieldAnswers = formField.questionOptions?.answers ?? [];

    // If no concept answers but we have form field answers, use those
    if (conceptAnswerItems.length === 0 && formFieldAnswers.length > 0) {
      return formFieldAnswers.map((answer) => ({
        id: answer.concept,
        text: answer.label,
      }));
    }

    // Merge concept answers with any additional form field answers
    const additionalAnswers = formFieldAnswers
      .filter((answer) => !conceptAnswerItems.some((item) => item.id === answer.concept))
      .map((answer) => ({
        id: answer.concept,
        text: answer.label,
      }));

    return [...conceptAnswerItems, ...additionalAnswers];
  }, [selectedConcept, formField]);

  const convertItemsToString = useCallback((item: AnswerItem) => item.text, []);

  return (
    <Stack gap={5}>
      <div>
        <FormLabel className={styles.label}>{t('searchForBackingConcept', 'Search for a backing concept')}</FormLabel>
        {conceptLookupError || conceptNameLookupError ? (
          <InlineNotification
            kind="error"
            lowContrast
            className={styles.error}
            title={
              conceptLookupError
                ? t('errorFetchingConcepts', 'Error fetching concepts')
                : t('errorFetchingConceptName', "Couldn't resolve concept name")
            }
            subtitle={
              conceptLookupError
                ? t('pleaseTryAgain', 'Please try again.')
                : t('conceptDoesNotExist', `The linked concept '{{conceptName}}' does not exist in your dictionary`, {
                    conceptName: formField.questionOptions.concept,
                  })
            }
          />
        ) : null}
        {isLoadingConcept ? (
          <InlineLoading className={styles.loader} description={t('loading', 'Loading') + '...'} />
        ) : (
          <Search
            id="conceptLookup"
            onClear={clearSelectedConcept}
            onChange={handleConceptChange}
            placeholder={t('searchConcept', 'Search using a concept name or UUID')}
            required
            size="md"
            value={(() => {
              if (conceptToLookup) {
                return conceptToLookup;
              }
              if (selectedConcept) {
                return selectedConcept.display;
              }
              if (conceptName) {
                return conceptName;
              }
              return '';
            })()}
          />
        )}
      </div>
      {(() => {
        if (!conceptToLookup) return null;
        if (isLoadingConcepts)
          return <InlineLoading className={styles.loader} description={t('searching', 'Searching') + '...'} />;
        if (concepts?.length && !isLoadingConcepts) {
          return (
            <ul className={styles.conceptList}>
              {concepts?.map((concept, index) => (
                <li role="menuitem" className={styles.concept} key={index} onClick={() => handleConceptSelect(concept)}>
                  {concept.display}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <Layer>
            <Tile className={styles.emptyResults}>
              <span>
                {t('noMatchingConcepts', 'No concepts were found that match')}{' '}
                <strong>"{debouncedConceptToLookup}".</strong>
              </span>
            </Tile>

            <div className={styles.oclLauncherBanner}>
              {<p className={styles.bodyShort01}>{t('conceptSearchHelpText', "Can't find a concept?")}</p>}
              <a
                className={styles.oclLink}
                target="_blank"
                rel="noopener noreferrer"
                href={'https://app.openconceptlab.org/'}
              >
                {t('searchInOCL', 'Search in OCL')}
                <ArrowUpRight size={16} />
              </a>
            </div>
          </Layer>
        );
      })()}

      {selectedConcept?.allowDecimal === false && (
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

      {!isLoadingConcept && items.length > 0 && (
        <MultiSelect
          className={styles.multiSelect}
          direction="top"
          id="selectAnswers"
          items={items}
          itemToString={convertItemsToString}
          onChange={selectAnswers}
          size="md"
          selectedItems={selectedAnswers}
          initialSelectedItems={formField?.questionOptions?.answers?.map((answer) => ({
            id: answer.concept,
            text: answer.label,
          }))}
          titleText={t('selectAnswersToDisplay', 'Select answers to display')}
        />
      )}

      {selectedAnswers.length > 0 && (
        <div>
          {selectedAnswers.map((answer) => (
            <Tag className={styles.tag} key={answer.id} type={'blue'}>
              {answer.text}
            </Tag>
          ))}
        </div>
      )}
    </Stack>
  );
};

export default ObsTypeQuestion;
