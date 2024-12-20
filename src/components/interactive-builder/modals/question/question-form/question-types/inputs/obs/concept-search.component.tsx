import React, { useState, useCallback, useEffect } from 'react';
import { Search, InlineLoading, Layer, Tile, FormLabel, InlineNotification } from '@carbon/react';
import { type TFunction, useTranslation } from 'react-i18next';
import { ArrowUpRight } from '@carbon/react/icons';
import { useConceptId } from '@hooks/useConceptId';
import { useConceptLookup } from '@hooks/useConceptLookup';
import { useDebounce } from '@openmrs/esm-framework';
import type { Concept } from '@types';
import styles from './obs-type-question.scss';

interface ConceptSearchProps {
  label?: TFunction;
  defaultConcept?: string;
  onClearSelectedConcept?: () => void;
  onSelectConcept: (concept: Concept) => void;
}

const ConceptSearch: React.FC<ConceptSearchProps> = ({
  label,
  defaultConcept,
  onClearSelectedConcept,
  onSelectConcept,
}) => {
  const { t } = useTranslation();
  const [conceptToLookup, setConceptToLookup] = useState('');
  const debouncedConceptToLookup = useDebounce(conceptToLookup);
  const { concepts, conceptLookupError, isLoadingConcepts } = useConceptLookup(debouncedConceptToLookup);
  const {
    concept: initialConcept,
    conceptName,
    conceptNameLookupError,
    isLoadingConcept,
  } = useConceptId(defaultConcept ?? '');
  const [selectedConcept, setSelectedConcept] = useState<Concept>(null);

  useEffect(() => {
    if (initialConcept) {
      setSelectedConcept(initialConcept);
      onSelectConcept(initialConcept);
    }
  }, [initialConcept, onSelectConcept]);

  const handleConceptChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setConceptToLookup(event.target.value),
    [],
  );

  const handleConceptSelect = useCallback(
    (concept: Concept) => {
      setConceptToLookup('');
      setSelectedConcept(concept);
      onSelectConcept(concept);
    },
    [onSelectConcept],
  );

  const clearSelectedConcept = useCallback(() => {
    setSelectedConcept(null);
    if (onClearSelectedConcept) onClearSelectedConcept();
  }, [onClearSelectedConcept]);

  return (
    <>
      <FormLabel className={styles.label}>
        {label ?? t('searchForBackingConcept', 'Search for a backing concept')}
      </FormLabel>
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
                  conceptName: defaultConcept,
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
          labelText={t('searchForBackingConcept', 'Search for a backing concept')}
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
    </>
  );
};

export default ConceptSearch;
