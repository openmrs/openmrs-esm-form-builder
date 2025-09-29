import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormGroup, Stack, TextInput } from '@carbon/react';
import { Add, TrashCan } from '@carbon/react/icons';
import ConceptSearch from '../../../common/concept-search/concept-search.component';
import { useFormField } from '../../../../form-field-context';
import styles from './test-order-type-question.scss';

interface SelectableOrder {
  concept: string;
  label: string;
}

const TestOrderTypeQuestion: React.FC = () => {
  const { t } = useTranslation();
  const { formField, setFormField } = useFormField();

  const selectableOrders = useMemo(
    () => formField.questionOptions?.selectableOrders || [],
    [formField.questionOptions?.selectableOrders],
  );

  const handleConceptChange = useCallback(
    (concept: string) => {
      setFormField((prevField) => ({
        ...prevField,
        questionOptions: {
          ...prevField.questionOptions,
          concept,
        },
      }));
    },
    [setFormField],
  );

  const handleAddSelectableOrder = useCallback(() => {
    const newOrder: SelectableOrder = { concept: '', label: '' };
    setFormField((prevField) => ({
      ...prevField,
      questionOptions: {
        ...prevField.questionOptions,
        selectableOrders: [...selectableOrders, newOrder],
      },
    }));
  }, [selectableOrders, setFormField]);

  const handleRemoveSelectableOrder = useCallback(
    (index: number) => {
      const updatedOrders = selectableOrders.filter((_, i) => i !== index);
      setFormField((prevField) => ({
        ...prevField,
        questionOptions: {
          ...prevField.questionOptions,
          selectableOrders: updatedOrders,
        },
      }));
    },
    [selectableOrders, setFormField],
  );

  const handleSelectableOrderChange = useCallback(
    (index: number, field: keyof SelectableOrder, value: string) => {
      const updatedOrders = selectableOrders.map((order, i) => (i === index ? { ...order, [field]: value } : order));
      setFormField((prevField) => ({
        ...prevField,
        questionOptions: {
          ...prevField.questionOptions,
          selectableOrders: updatedOrders,
        },
      }));
    },
    [selectableOrders, setFormField],
  );

  const handleSelectableOrderConceptChange = useCallback(
    (index: number, concept: string) => {
      handleSelectableOrderChange(index, 'concept', concept);
    },
    [handleSelectableOrderChange],
  );

  return (
    <div className={styles.testOrderContainer}>
        <ConceptSearch
          defaultConcept={formField.questionOptions?.concept}
          onSelectConcept={(concept) => handleConceptChange(concept.uuid)}
        />

      <FormGroup legendText={t('selectableOrders', 'Selectable Orders')}>
        <Stack gap={4}>
          {selectableOrders.map((order, index) => (
            <div key={index} className={styles.selectableOrderItem}>
              <div className={styles.orderFields}>
                <div className={styles.conceptField}>
                  <ConceptSearch
                    defaultConcept={order.concept}
                    onSelectConcept={(concept) => handleSelectableOrderConceptChange(index, concept.uuid)}
                  />
                </div>
                <TextInput
                  id={`order-label-${index}`}
                  labelText={t('label', 'Label')}
                  value={order.label}
                  onChange={(e) => handleSelectableOrderChange(index, 'label', e.target.value)}
                  placeholder={t('enterOrderLabel', 'Enter order label')}
                />
                <Button
                  kind="ghost"
                  size="md"
                  renderIcon={TrashCan}
                  iconDescription={t('removeOrder', 'Remove order')}
                  onClick={() => handleRemoveSelectableOrder(index)}
                  className={styles.removeButton}
                />
              </div>
            </div>
          ))}
          <Button
            kind="tertiary"
            size="md"
            renderIcon={Add}
            onClick={handleAddSelectableOrder}
            className={styles.addButton}
          >
            {t('addSelectableOrder', 'Add selectable order')}
          </Button>
        </Stack>
      </FormGroup>
    </div>
  );
};

export default TestOrderTypeQuestion;
