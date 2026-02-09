import React from 'react';
import { useInteractiveElement, type InteractiveElementProps } from '../../hooks/useInteractiveElement';

interface InteractiveElementWrapperProps extends InteractiveElementProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  role?: string;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * A wrapper component that automatically handles:
 * 1. Generates the correct DOM ID for the builder.
 * 2. Checks the selection state.
 * 3. Applies the 'builder-highlight' class if selected.
 * 4. Handles click events to update the selection (stopping propagation).
 */
export const InteractiveElementWrapper: React.FC<InteractiveElementWrapperProps> = ({
  children,
  kind,
  label,
  pageIndex,
  sectionIndex,
  questionIndex,
  className = '',
  style,
  role,
  tabIndex,
  onKeyDown,
  onClick: externalOnClick, // Allow passing an extra click handler if absolutely necessary
}) => {
  const { id, highlightClass, handleClick } = useInteractiveElement({
    kind,
    label,
    pageIndex,
    sectionIndex,
    questionIndex,
  });

  const combinedClickHandler = (e: React.MouseEvent) => {
    handleClick(e);
    if (externalOnClick) {
      externalOnClick(e);
    }
  };

  return (
    <div
      id={id}
      className={`${className} ${highlightClass}`.trim()}
      onClick={combinedClickHandler}
      style={style}
      role={role}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
};
