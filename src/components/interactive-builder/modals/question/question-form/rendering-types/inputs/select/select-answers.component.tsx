import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';

import { InlineNotification, MultiSelect, Stack } from '@carbon/react';

import { fetchConceptById } from '@resources/concept.resource';
import type { Concept } from '@types';

import { useFormField } from '../../../../form-field-context';
import ConceptSearch from '../../../common/concept-search/concept-search.component';
import { SortableTag } from '../../../common/sortable-tag/sortable-tag.component';

import styles from './select-answers.scss';

interface AnswerItem {
  id: string;
  text: string;
}

const SelectAnswers: React.FC = () => {
  const { t } = useTranslation();
  const { formField, concept, setFormField } = useFormField();
  const [addedAnswers, setAddedAnswers] = useState<AnswerItem[]>([]);
  const [invalidAnswerIds, setInvalidAnswerIds] = useState<string[]>([]);

  useEffect(() => {
    if (!concept) {
      setAddedAnswers([]);
    }
  }, [concept]);

  const selectedAnswers = useMemo(() => {
    const answers =
      formField.questionOptions?.answers?.map((answer) => ({
        id: answer.concept,
        text: answer.label,
      })) ?? [];
    // Filter out any answers that are in addedAnswers
    return answers.filter((answer) => !addedAnswers.some((added) => added.id === answer.id));
  }, [formField.questionOptions?.answers, addedAnswers]);

  const handleSelectAnswers = useCallback(
    ({ selectedItems }: { selectedItems: Array<AnswerItem> }) => {
      const mappedAnswers = selectedItems.map((answer) => ({
        concept: answer.id,
        label: answer.text,
      }));

      setFormField((prevField) => {
        const currentAnswers = prevField.questionOptions?.answers || [];
        if (JSON.stringify(currentAnswers) === JSON.stringify(mappedAnswers)) {
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

  const handleSelectAdditionalAnswer = useCallback(
    (concept: Concept) => {
      const newAnswer = { id: concept.uuid, text: concept.display };
      const answerExistsInSelected = selectedAnswers.some((answer) => answer.id === newAnswer.id);
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
    [selectedAnswers, addedAnswers, setFormField],
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

    const formFieldAnswerLabelsMap = new Map(formFieldAnswers.map((answer) => [answer.concept, answer.label]));

    const answersFromConceptWithLabelsFromFormField = conceptAnswerItems.map((item) => ({
      id: item.id,
      text: formFieldAnswerLabelsMap.get(item.id) ?? item.text,
    }));

    const additionalAnswers = formFieldAnswers
      .filter((answer) => !conceptAnswerItems.some((item) => item.id === answer.concept))
      .map((answer) => ({
        id: answer.concept,
        text: answer.label,
      }));

    return [...answersFromConceptWithLabelsFromFormField, ...additionalAnswers];
  }, [concept?.answers, formField.questionOptions?.answers]);

  const validateAnswers = useCallback(async () => {
    if (!answerItems.length) {
      setInvalidAnswerIds([]);
      return;
    }

    const originalAnswerIds = new Set((concept?.answers || []).map((ans) => ans.uuid));
    const invalidIds: string[] = [];
    const uniqueAnswers = Array.from(new Map(answerItems.map((a) => [a.id, a])).values());

    for (const answer of uniqueAnswers) {
      if (!originalAnswerIds.has(answer.id)) {
        try {
          const res = await fetchConceptById(answer.id);
          if (!(res?.data?.uuid === answer.id)) {
            invalidIds.push(answer.id);
          }
        } catch (error) {
          invalidIds.push(answer.id);
        }
      }
    }

    setInvalidAnswerIds(invalidIds);
  }, [answerItems, concept]);

  useEffect(() => {
    if (concept?.answers?.length) {
      validateAnswers();
    }
  }, [answerItems, concept, validateAnswers]);

  const convertAnswerItemsToString = useCallback((item: AnswerItem) => item.text, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      if (active.id !== over.id) {
        setFormField((prevFormField) => {
          const currentAnswers = prevFormField.questionOptions?.answers ?? [];
          const oldIndex = currentAnswers.findIndex((a) => a.concept === active.id);
          const newIndex = currentAnswers.findIndex((a) => a.concept === over.id);
          if (oldIndex === -1 || newIndex === -1) return prevFormField;

          const reordered = arrayMove(currentAnswers, oldIndex, newIndex);
          return {
            ...prevFormField,
            questionOptions: {
              ...prevFormField.questionOptions,
              answers: reordered,
            },
          };
        });
      }
    },
    [setFormField],
  );

  /**
   * Reordering additional answers by drag & drop
   */
  const handleAdditionalDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      if (active.id !== over.id) {
        setAddedAnswers((prev) => {
          const oldIndex = prev.findIndex((ans) => ans.id === active.id);
          const newIndex = prev.findIndex((ans) => ans.id === over.id);
          if (oldIndex === -1 || newIndex === -1) return prev;
          const reordered = arrayMove(prev, oldIndex, newIndex);
          return reordered;
        });
      }
    },
    [setAddedAnswers],
  );

  return (
    <Stack gap={5}>
      {answerItems.length > 0 && (
        <MultiSelect
          className={styles.multiSelect}
          direction="bottom"
          id="selectAnswers"
          items={answerItems}
          itemToString={convertAnswerItemsToString}
          onChange={handleSelectAnswers}
          size="md"
          selectedItems={selectedAnswers}
          titleText={t('selectAnswersToDisplay', 'Select answers to display')}
        />
      )}

      {selectedAnswers.length > 0 && (
        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext items={selectedAnswers} strategy={verticalListSortingStrategy}>
            <div>
              {selectedAnswers.map((answer) => (
                <SortableTag
                  key={answer.id}
                  id={answer.id}
                  text={answer.text}
                  isInvalid={invalidAnswerIds.includes(answer.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Display an inline notification if any answer fails validation */}
      {invalidAnswerIds.length > 0 && (
        <InlineNotification
          kind="error"
          lowContrast
          className={styles.error}
          title={t('invalidAnswerConcept', 'Invalid Answer Concept Detected')}
          subtitle={t('answerConceptValidation', 'One or more selected answer concepts do not exist in the system. ')}
        />
      )}

      {concept && concept.datatype?.name === 'Coded' && (
        <>
          <ConceptSearch
            label={t('searchForAnswerConcept', 'Search for a concept to add as an answer')}
            onSelectConcept={handleSelectAdditionalAnswer}
            clearSearchAfterSelection={true}
          />
          {addedAnswers.length > 0 && (
            <DndContext onDragEnd={handleAdditionalDragEnd}>
              <SortableContext items={addedAnswers} strategy={verticalListSortingStrategy}>
                <div>
                  {addedAnswers.map((answer) => (
                    <SortableTag
                      key={answer.id}
                      id={answer.id}
                      text={answer.text}
                      onDelete={() => handleDeleteAdditionalAnswer(answer.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}
    </Stack>
  );
};

export default SelectAnswers;
