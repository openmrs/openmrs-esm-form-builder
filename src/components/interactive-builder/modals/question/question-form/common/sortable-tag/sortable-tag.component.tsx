import React from 'react';
import classNames from 'classnames';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@carbon/react';
import { Draggable, WarningAltFilled, TrashCan } from '@carbon/react/icons';
import styles from './sortable-tag.scss';

interface SortableTagProps {
  id: string;
  text: string;
  onDelete?: () => void;
  isInvalid?: boolean;
}

export const SortableTag: React.FC<SortableTagProps> = ({ id, text, onDelete, isInvalid }) => {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const dynamicStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={dynamicStyle}
      className={classNames(styles.sortableTagWrapper, {
        [styles.dragContainerWhenDragging]: isDragging,

        [styles.invalid]: isInvalid,
      })}
    >
      <div className={styles.leftContent}>
        <div {...attributes} {...listeners} className={styles.dragHandle}>
          <IconButton kind="ghost" size="md" label={t('dragToReorder', 'Drag to reorder')}>
            <Draggable />
          </IconButton>
        </div>
        <span
          className={classNames(styles.sortableTag, {
            [styles.dragging]: isDragging,
          })}
        >
          {text}
        </span>
      </div>
      <div>
        {onDelete && (
          <IconButton
            enterDelayMs={300}
            label={t('deleteAnswer', 'Delete answer')}
            kind="ghost"
            onClick={onDelete}
            size="md"
          >
            <TrashCan />
          </IconButton>
        )}
        {isInvalid && <WarningAltFilled className={styles.invalidIcon} aria-label="Invalid answer" size={16} />}
      </div>
    </div>
  );
};
