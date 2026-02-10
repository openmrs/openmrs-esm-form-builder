import React, { createContext, useContext, useState, type ReactNode, useCallback } from 'react';

interface SelectionState {
  pageIndex: number | null;
  sectionIndex: number | null;
  questionIndex: number | null;
  label?: string;
  kind?: 'page' | 'section' | 'question' | 'form';
  source?: 'editor' | 'builder';
}

interface SelectionContextType extends SelectionState {
  setSelection: (
    page: number | null,
    section?: number | null,
    question?: number | null,
    label?: string,
    kind?: 'page' | 'section' | 'question' | 'form',
    source?: 'editor' | 'builder',
  ) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selection, setSelectionState] = useState<SelectionState>({
    pageIndex: null,
    sectionIndex: null,
    questionIndex: null,
  });

  const setSelection = useCallback(
    (
      pageIndex: number | null,
      sectionIndex: number | null = null,
      questionIndex: number | null = null,
      label?: string,
      kind?: 'page' | 'section' | 'question',
      source?: 'editor' | 'builder',
    ) => {
      setSelectionState({ pageIndex, sectionIndex, questionIndex, label, kind, source });
    },
    [],
  );

  return <SelectionContext.Provider value={{ ...selection, setSelection }}>{children}</SelectionContext.Provider>;
};

export const useSelection = (): SelectionContextType => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};
