import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Dashboard from './components/dashboard/dashboard.component';
import FormEditor from './components/form-editor/form-editor.component';

import { SelectionProvider } from './context/selection-context';

const RootComponent: React.FC = () => {
  return (
    <SelectionProvider>
      <BrowserRouter basename={`${window.spaBase}/form-builder`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<FormEditor />} />
          <Route path="/edit/:formUuid" element={<FormEditor />} />
        </Routes>
      </BrowserRouter>
    </SelectionProvider>
  );
};

export default RootComponent;
