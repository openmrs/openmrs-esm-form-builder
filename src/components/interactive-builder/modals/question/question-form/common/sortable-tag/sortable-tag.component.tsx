import React from 'react';
import { Tag } from '@carbon/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import styles from './sortable-tag.scss';

interface SortableTagProps {
  id: string;
  text: string;
}

export const SortableTag: React.FC<SortableTagProps> = ({ id, text }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const dynamicStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={dynamicStyle} {...attributes} {...listeners}>
      <Tag className={`${styles.sortableTag} ${isDragging ? styles.dragging : ''}`} type="blue">
        {text}
      </Tag>
    </div>
  );
};
