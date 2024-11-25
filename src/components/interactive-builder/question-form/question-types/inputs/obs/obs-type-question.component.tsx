import React, { useCallback, useMemo, useState } from 'react';
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
} from '@carbon/react';
import { useDebounce } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from '@carbon/react/icons';
import { useConceptLookup } from '../../../../../../hooks/useConceptLookup';
import type { Answer, Concept, ConceptMapping, DatePickerType, ComponentProps } from '../../../../../../types';
import styles from './obs-type-question.scss';
import { Stack } from '@carbon/react';

interface AnswerItem {
  id: string;
  text: string;
}

const ObsTypeQuestion: React.FC<ComponentProps> = ({ formField, setFormField }) => {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Array<Answer>>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Array<AnswerItem>>([]);
  const [conceptMappings, setConceptMappings] = useState<Array<ConceptMapping>>([]);
  const [conceptToLookup, setConceptToLookup] = useState('');
  const debouncedConceptToLookup = useDebounce(conceptToLookup);
  const [selectedConcept, setSelectedConcept] = useState<Concept>(null);
  const { concepts, conceptLookupError, isLoadingConcepts } = useConceptLookup(debouncedConceptToLookup);

  const getDatePickerType = (concept: Concept): DatePickerType | null => {
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
  };

  const handleConceptChange = (event: React.ChangeEvent<HTMLInputElement>) => setConceptToLookup(event.target.value);

  const handleConceptSelect = (concept: Concept) => {
    setConceptToLookup('');
    setSelectedConcept(concept);
    setAnswers(
      concept?.answers?.map((answer) => ({
        concept: answer?.uuid,
        label: answer?.display,
      })),
    );
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
  };

  const items = useMemo(() => answers.map((answer) => ({ id: answer.concept, text: answer.label })), [answers]);

  const convertItemsToString = useCallback((item: AnswerItem) => item.text, []);

  const selectAnswers = ({ selectedItems }: { selectedItems: Array<AnswerItem> }) => {
    setSelectedAnswers(selectedItems);
    setFormField({
      ...formField,
      questionOptions: {
        ...formField.questionOptions,
        answers: selectedAnswers.map((answer) => ({
          concept: answer.id,
          label: answer.text,
        })),
      },
    });
  };

  const clearSelectedConcept = () => {
    setSelectedConcept(null);
    setAnswers([]);
    setConceptMappings([]);
    const updatedFormField = { ...formField };
    delete updatedFormField.questionOptions.concept,
      updatedFormField.datePickerFormat,
      updatedFormField.questionOptions.answers;
    setFormField(updatedFormField);
  };

  return (
    <Stack gap={5}>
      <div>
        <FormLabel className={styles.label}>{t('searchForBackingConcept', 'Search for a backing concept')}</FormLabel>
        {conceptLookupError ? (
          <InlineNotification
            kind="error"
            lowContrast
            className={styles.error}
            title={t('errorFetchingConcepts', 'Error fetching concepts')}
            subtitle={t('pleaseTryAgain', 'Please try again.')}
          />
        ) : null}
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
            return '';
          })()}
        />
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

      {answers.length > 0 && (
        <MultiSelect
          className={styles.multiSelect}
          direction="top"
          id="selectAnswers"
          items={items}
          itemToString={convertItemsToString}
          onChange={selectAnswers}
          size="md"
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
