import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Tag, MultiSelect, Stack } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import ConceptSearch from '../../../common/concept-search/concept-search.component';
import { useFormField } from '../../../../form-field-context';
import type { QuestionAnswerOption } from '@openmrs/esm-form-engine-lib';
import type { Concept } from '@types';
import styles from './select-answers.scss';

interface AnswerItem {
  id: string;
  text: string;
}

const SelectAnswers: React.FC = () => {
  const { t } = useTranslation();
  const { formField, concept, setFormField } = useFormField();
  const [selectedAnswers, setSelectedAnswers] = useState<Array<AnswerItem>>(
    formField.questionOptions?.answers
      ? formField.questionOptions.answers.map((answer) => ({
          id: answer.concept,
          text: answer.label,
        }))
      : [],
  );
  const [addedAnswers, setAddedAnswers] = useState<AnswerItem[]>([]);
  const initiallySelectedAnswers = useRef(
    formField?.questionOptions?.answers?.map((answer) => ({
      id: answer.concept,
      text: answer.label,
    })),
  );

  const areAnswersEqual = (arr1: QuestionAnswerOption[], arr2: QuestionAnswerOption[]) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((item, index) => item.concept === arr2[index].concept && item.label === arr2[index].label);
  };

  const updateFormFieldAnswers = useCallback(
    (selectedAnswers: AnswerItem[]) => {
      const mappedAnswers = selectedAnswers.map((answer) => ({
        concept: answer.id,
        label: answer.text,
      }));

      setFormField((prevField) => {
        const currentAnswers = prevField.questionOptions?.answers || [];
        if (areAnswersEqual(currentAnswers, mappedAnswers)) {
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

  const handleSelectAnswers = useCallback(
    ({ selectedItems }: { selectedItems: Array<AnswerItem> }) => {
      setSelectedAnswers(selectedItems);
      updateFormFieldAnswers(selectedItems);
    },
    [setSelectedAnswers, updateFormFieldAnswers],
  );

  const handleSelectAdditionalAnswer = useCallback(
    (concept: Concept) => {
      const newAnswer = { id: concept.uuid, text: concept.display };
      const answerExistsInSelected = formField.questionOptions.answers
        ? formField.questionOptions.answers?.some((answer) => answer.id === newAnswer.id)
        : [];
      const answerExistsInAdded = addedAnswers.some((answer) => answer.id === newAnswer.id);
      if (!answerExistsInSelected && !answerExistsInAdded) {
        setAddedAnswers((prevAnswers) => [...prevAnswers, newAnswer]);
        setFormField((prevFormField) => {
          const existingAnswers = prevFormField.questionOptions?.answers ?? [];
          existingAnswers.push({ concept: concept.uuid, label: concept.display });
          return {
            ...prevFormField,
            questionOptions: {
              ...prevFormField.questionOptions,
              answers: existingAnswers,
            },
          };
        });
      }
    },
    [formField, addedAnswers, setFormField],
  );

  const handleDeleteAdditionalAnswer = useCallback(
    (id: string) => {
      setAddedAnswers((prevAnswers) => prevAnswers.filter((answer) => answer.id !== id));
      setFormField((prevFormField) => {
        const selectedAnswers = prevFormField.questionOptions?.answers ?? [];
        return {
          ...prevFormField,
          questionOptions: {
            ...prevFormField.questionOptions,
            answers: selectedAnswers.filter((answer) => answer.concept !== id),
          },
        };
      });
    },
    [setFormField],
  );

  const answerItems = useMemo(() => {
    // Convert answers from the concept to items format
    const conceptAnswerItems =
      concept?.answers?.map((answer) => ({
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
  }, [concept?.answers, formField.questionOptions?.answers]);

  const convertAnswerItemsToString = useCallback((item: AnswerItem) => item.text, []);

  return (
    <Stack gap={5}>
      {answerItems.length > 0 && (
        <MultiSelect
          className={styles.multiSelect}
          direction="top"
          id="selectAnswers"
          items={answerItems}
          itemToString={convertAnswerItemsToString}
          onChange={handleSelectAnswers}
          size="md"
          selectedItems={selectedAnswers}
          initialSelectedItems={initiallySelectedAnswers}
          titleText={t('selectAnswersToDisplay', 'Select answers to display')}
        />
      )}

      {formField.questionOptions?.answers && formField.questionOptions?.answers?.length > 0 && (
        <div>
          {formField.questionOptions.answers.map((answer) => (
            <Tag className={styles.tag} key={answer.id} type={'blue'}>
              {answer.label}
            </Tag>
          ))}
        </div>
      )}

      {concept && concept.datatype?.name === 'Coded' && (
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

export default SelectAnswers;
