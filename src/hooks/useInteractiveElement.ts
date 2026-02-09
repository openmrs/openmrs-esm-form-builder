import { useCallback } from 'react';
import { useSelection } from '../context/selection-context';
import { getBuilderElementId, type ElementKind } from '../utils/builder-ids';

export interface InteractiveElementProps {
  kind: ElementKind;
  label: string;
  pageIndex?: number | null;
  sectionIndex?: number | null;
  questionIndex?: number | null;
}

/**
 * Hook to manage the interactive state of a builder element (Form, Page, Section, Question).
 *
 * Convention over Configuration:
 * - Automatically generates the standardized DOM ID based on the element coordinates.
 * - Determines selection state by comparing coordinates with the global SelectionContext.
 * - Provides a unified click handler that enforces event isolation (stopPropagation) and updates selection.
 *
 * @param props The coordinates and metadata of the element.
 * @returns { id, isSelected, handleClick } properties to spread or apply to the UI component.
 */
export function useInteractiveElement({
  kind,
  label,
  pageIndex = null,
  sectionIndex = null,
  questionIndex = null,
}: InteractiveElementProps) {
  const {
    setSelection,
    pageIndex: activePageIndex,
    sectionIndex: activeSectionIndex,
    questionIndex: activeQuestionIndex,
  } = useSelection();

  // 1. Generate Standardized ID
  // This adheres to the convention defined in builder-ids.ts
  const elementId = getBuilderElementId(kind, pageIndex, sectionIndex, questionIndex);

  // 2. Determine Selection State
  // Logic: explicitly check if *all* relevant indices match the active selection.
  // We strictly compare nulls to ensure we don't accidentally select a parent when a child is active.
  const isSelected =
    activePageIndex === pageIndex && activeSectionIndex === sectionIndex && activeQuestionIndex === questionIndex;

  // 3. Unified Interaction Handler
  const handleClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      // Vital: Stop propagation to prevent selecting the parent container (e.g., Form or Page)
      if (e && typeof e.stopPropagation === 'function') {
        e.stopPropagation();
      }

      // Allow keyboard support (Enter/Space) if attached to a non-button element
      if (e.type === 'keydown') {
        const key = (e as React.KeyboardEvent).key;
        if (key !== 'Enter' && key !== ' ') {
          return;
        }
      }

      setSelection(pageIndex, sectionIndex, questionIndex, label, kind, 'builder');
    },
    [pageIndex, sectionIndex, questionIndex, label, kind, setSelection],
  );

  return {
    id: elementId,
    isSelected,
    handleClick,
    // Helper to conditionally apply the highlight class
    highlightClass: isSelected ? 'builder-highlight' : '',
  };
}
