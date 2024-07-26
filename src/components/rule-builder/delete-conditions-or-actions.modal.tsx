import { ModalHeader, ModalBody, ModalFooter, Button } from '@carbon/react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { type Action, type Condition, type FormRule } from './rule-builder.component';
import { showSnackbar } from '@openmrs/esm-framework';

interface DeleteConditionsOrActionsModalProps {
  closeModal: () => void;
  questionLabel: string;
  elementId: string;
  element: Array<Condition | Action>;
  setElement: React.Dispatch<React.SetStateAction<Array<Condition | Action>>>;
  setCurrentRule: React.Dispatch<React.SetStateAction<FormRule>>;
  elementKey: string;
}

const DeleteConditionsOrActionsModal = ({
  closeModal,
  questionLabel,
  elementId,
  element,
  setElement,
  elementKey,
  setCurrentRule,
}: DeleteConditionsOrActionsModalProps) => {
  const { t } = useTranslation();

  const deleteConditionsOrActions = useCallback(() => {
    try {
      setElement(element.filter((e) => e.id !== elementId));
      setCurrentRule((prevRule) => {
        const newRule = { ...prevRule };
        const elementIndex = element.findIndex((e) => e.id === elementId);
        if (elementIndex !== -1) {
          newRule[elementKey]?.splice(elementIndex, 1);
        }
        return newRule;
      });

      showSnackbar({
        title: t(
          `${elementKey}DeletedMessage`,
          `${elementKey.slice(0, 1).toUpperCase() + elementKey.slice(1, elementKey.length)}  for the question "{{- questionLabel}}" has been deleted`,
          { questionLabel: questionLabel },
        ),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t(
            `errorDeleting${elementKey
              .slice(0, 1)
              .toUpperCase()
              .slice(0, elementKey.length - 1)}`,
            `Error deleting ${elementKey.slice(0, 1).slice(0, elementKey.length - 1)}`,
          ),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    } finally {
      closeModal();
    }
  }, [setElement, element, setCurrentRule, t, elementKey, questionLabel, elementId, closeModal]);

  return (
    <div>
      <ModalHeader
        closeModal={closeModal}
        title={t(
          `delete${elementKey
            .slice(0, 1)
            .toUpperCase()
            .slice(0, elementKey.length - 1)}Confirmation`,
          `Are you sure you want to delete this ${elementKey.slice(0, elementKey.length - 1)}?`,
        )}
      />
      <ModalBody>
        <p>
          {t(
            `delete${elementKey
              .slice(0, 1)
              .toUpperCase()
              .slice(0, elementKey.length - 1)}ExplainerText`,
            `Deleting this ${elementKey.slice(0, elementKey.length - 1)} will permanently delete it from the field. This action cannot be undone.`,
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          kind="danger"
          onClick={() => {
            deleteConditionsOrActions();
          }}
        >
          <span>
            {t(
              `confirmDelete${elementKey.slice(0, 1).toUpperCase()}`,
              `Delete ${elementKey.slice(0, elementKey.length - 1)}?`,
            )}
          </span>
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteConditionsOrActionsModal;
