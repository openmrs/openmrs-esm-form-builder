import { type Dispatch, type SetStateAction, createContext, useContext } from 'react';
import { type formRule } from '../components/rule-builder/rule-builder.component';

export const RuleContext = createContext<{
  rules: Array<formRule>;
  setRules: Dispatch<SetStateAction<Array<formRule>>>;
} | null>(null);

export const useFormRule = () => {
  const context = useContext(RuleContext);
  if (!context) {
    throw new Error('No RuleContext available.');
  }
  return context;
};
