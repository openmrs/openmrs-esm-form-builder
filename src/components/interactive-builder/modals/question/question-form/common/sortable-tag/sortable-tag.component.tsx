import React from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Tag } from '@carbon/react';
import { Draggable } from '@carbon/react/icons';

import styles from './sortable-tag.scss';

interface SortableTagProps {
  id: string;
  text: string;
  onDelete?: () => void;
}

export const SortableTag: React.FC<SortableTagProps> = ({ id, text, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const dynamicStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={dynamicStyle} className={styles.sortableTagWrapper}>
      <div {...attributes} {...listeners} className={styles.dragHandle}>
        <Draggable />
      </div>
      <Tag
        className={`${styles.sortableTag} ${isDragging ? styles.dragging : ''}`}
        type="blue"
        renderIcon={
          onDelete
            ? () => (
                <button
                  aria-label="Clear all selected items"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className={styles.conceptAnswerButton}
                >
                  X
                </button>
              )
            : undefined
        }
      >
        {text}
      </Tag>
    </div>
  );
};
