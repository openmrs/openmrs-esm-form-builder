import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { FormLabel, InlineNotification, MultiSelect, FormGroup, Tag, Stack } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import ConceptSearch from './concept-search.component';
import { useFormField } from '../../../../form-field-context';
import type { Concept, ConceptMapping, DatePickerType } from '@types';
import styles from './obs-type-question.scss';

interface AnswerItem {
  id: string;
  text: string;
}

const ObsTypeQuestion: React.FC = () => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();
  const [selectedConcept, setSelectedConcept] = useState<Concept>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Array<AnswerItem>>(
    formField.questionOptions?.answers
      ? formField.questionOptions.answers.map((answer) => ({
          id: answer.concept,
          text: answer.label,
        }))
      : [],
  );
  const [addedAnswers, setAddedAnswers] = useState<AnswerItem[]>([]);
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

  const handleConceptSelect = useCallback((concept: Concept) => {
    setSelectedConcept(concept);
  }, []);

  useEffect(() => {
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
  }, [selectedConcept, getDatePickerType, setFormField]);

  useEffect(() => {
    if (selectedConcept) {
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
  }, [selectedConcept]);

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

  const selectAnswers = useCallback(
    ({ selectedItems }: { selectedItems: Array<AnswerItem> }) => {
      const mappedAnswers = selectedItems.map((answer) => ({
        concept: answer.id,
        label: answer.text,
      }));

      setSelectedAnswers(selectedItems);
      setFormField((prevField) => {
        if (JSON.stringify(prevField.questionOptions?.answers) === JSON.stringify(mappedAnswers)) {
          return prevField;
        }
        return {
          ...prevField,
          questionOptions: {
            ...prevField.questionOptions,
            answers: mappedAnswers,
          },
        };
      });
    },
    [setFormField],
  );

  const handleDeleteAdditionalAnswer = (id: string) => {
    setAddedAnswers((prevAnswers) => prevAnswers.filter((answer) => answer.id !== id));
    const selectedAnswers = formField.questionOptions?.answers ?? [];
    setFormField({
      ...formField,
      questionOptions: {
        ...formField.questionOptions,
        answers: selectedAnswers.filter((answer) => answer.concept !== id),
      },
    });
  };

  const handleSelectAdditionalAnswer = (concept: Concept) => {
    const newAnswer = { id: concept.uuid, text: concept.display };
    const answerExistsInSelected = selectedAnswers.some((answer) => answer.id === newAnswer.id);
    const answerExistsInAdded = addedAnswers.some((answer) => answer.id === newAnswer.id);
    if (!answerExistsInSelected && !answerExistsInAdded) {
      setAddedAnswers((prevAnswers) => [...prevAnswers, newAnswer]);
      const existingAnswers = formField.questionOptions?.answers ?? [];
      existingAnswers.push({ concept: concept.uuid, label: concept.display });
      setFormField({
        ...formField,
        questionOptions: {
          ...formField.questionOptions,
          answers: existingAnswers,
        },
      });
    }
  };

  const answerItems = useMemo(() => {
    // Convert answers from the concept to items format
    const conceptAnswerItems =
      selectedConcept?.answers?.map((answer) => ({
        id: answer.uuid,
        text: answer.display,
      })) ?? [];

    const formFieldAnswers = formField.questionOptions?.answers ?? [];

    // If no answers from concept but we have form field answers, use those
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
  }, [selectedConcept?.answers, formField.questionOptions?.answers]);

  const convertAnswerItemsToString = useCallback((item: AnswerItem) => item.text, []);

  return (
    <Stack gap={5}>
      <ConceptSearch
        defaultConcept={formField.questionOptions?.concept ?? null}
        onClearSelectedConcept={clearSelectedConcept}
        onSelectConcept={handleConceptSelect}
      />

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

      {answerItems.length > 0 && (
        <MultiSelect
          className={styles.multiSelect}
          direction="top"
          id="selectAnswers"
          items={answerItems}
          itemToString={convertAnswerItemsToString}
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

      {selectedConcept && selectedConcept.datatype?.name === 'Coded' && (
        <>
          <ConceptSearch
            label={t('searchForAnswerConcept', 'Search for a concept to add as an answer')}
            onSelectConcept={handleSelectAdditionalAnswer}
          />
          {addedAnswers.length > 0 ? (
            <div>
              {addedAnswers.map((answer) => (
                <Tag className={styles.tag} key={answer.id} type={'blue'}>
                  {answer.text}
                  <button
                    className={styles.conceptAnswerButton}
                    onClick={() => handleDeleteAdditionalAnswer(answer.id)}
                  >
                    X
                  </button>
                </Tag>
              ))}
            </div>
          ) : null}{' '}
        </>
      )}
    </Stack>
  );
};

export default ObsTypeQuestion;
