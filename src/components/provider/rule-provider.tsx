import React, { useCallback, useMemo } from 'react';
import { useState } from 'react';
import { RuleContext } from '../../hooks/useFormRule';
import { type formRule } from '../rule-builder/rule-builder.component';

export const RuleProvider = ({ children }: { children: React.ReactNode }) => {
  const [rules, setRules] = useState<Array<formRule>>();
  const cachedRules = useMemo(() => rules, [rules]);
  const updateRules = useCallback((newRules: Array<formRule>) => setRules(newRules), [setRules]);

  return <RuleContext.Provider value={{ rules: cachedRules, setRules: updateRules }}>{children}</RuleContext.Provider>;
};
