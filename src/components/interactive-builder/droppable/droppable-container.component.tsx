import React from 'react';
import classNames from 'classnames';
import { useDroppable } from '@dnd-kit/core';
import styles from './droppable-container.scss';

interface DroppableProps {
  id: string;
  children: React.ReactNode;
}

function Droppable({ id, children }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div className={classNames(styles.droppable as string, { [styles.isOver]: isOver })} ref={setNodeRef}>
      {children}
    </div>
  );
}

export default Droppable;
