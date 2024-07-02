import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Dashboard from './components/dashboard/dashboard.component';
import FormEditor from './components/form-editor/form-editor.component';
import { RuleProvider } from './components/provider/rule-provider';

const RootComponent: React.FC = () => {
  return (
    <BrowserRouter basename={`${window.spaBase}/form-builder`}>
      <RuleProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<FormEditor />} />
          <Route path="/edit/:formUuid" element={<FormEditor />} />
        </Routes>
      </RuleProvider>
    </BrowserRouter>
  );
};

export default RootComponent;
