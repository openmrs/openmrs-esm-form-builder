import React, { useCallback, useMemo, useState } from 'react';
import { RuleContext } from '../../hooks/useFormRule';
import { type FormRule } from '../rule-builder/rule-builder.component';

export const RuleProvider = ({ children }: { children: React.ReactNode }) => {
  const [rules, setRules] = useState<Array<FormRule>>();
  const cachedRules = useMemo(() => rules, [rules]);
  const updateRules = useCallback((newRules: Array<FormRule>) => setRules(newRules), [setRules]);

  return <RuleContext.Provider value={{ rules: cachedRules, setRules: updateRules }}>{children}</RuleContext.Provider>;
};
