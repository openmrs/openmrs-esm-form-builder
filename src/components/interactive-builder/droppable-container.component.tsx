import React from "react";
import { useDroppable } from "@dnd-kit/core";

type DroppableProps = {
  id: string;
  children: React.ReactNode;
};

export function Droppable({ id, children }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const style = {
    border: `1px solid ${isOver ? "#3ddbd9" : "transparent"}`,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}
