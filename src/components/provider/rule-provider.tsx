import React from 'react';
import { useState } from 'react';
import { RuleContext } from '../../hooks/useFormRule';
import { type formRule } from '../rule-builder/rule-builder.component';

export const RuleProvider = ({ children }: { children: React.ReactNode }) => {
  const [rules, setRules] = useState<Array<formRule>>();

  return <RuleContext.Provider value={{ rules, setRules }}>{children}</RuleContext.Provider>;
};
