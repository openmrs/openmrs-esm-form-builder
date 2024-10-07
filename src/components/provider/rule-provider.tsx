import React, { useCallback, useMemo, useState } from 'react';
import { RuleContext } from '../../hooks/useFormRule';
import { type FormRule } from '../rule-builder/rule-builder.component';

interface RuleProviderProps {
  children: React.ReactNode;
}

export const RuleProvider: React.FC<RuleProviderProps> = ({ children }) => {
  const [rules, setRules] = useState<Array<FormRule>>();
  const cachedRules = useMemo(() => rules, [rules]);
  const updateRules = useCallback((newRules: Array<FormRule>) => setRules(newRules), [setRules]);
  const contextValue = useMemo(
    () => ({
      rules: cachedRules,
      setRules: updateRules,
    }),
    [cachedRules, updateRules],
  );
  return <RuleContext.Provider value={contextValue}>{children}</RuleContext.Provider>;
};
