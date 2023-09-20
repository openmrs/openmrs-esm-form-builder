import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Dashboard from './components/dashboard/dashboard.component';
import FormEditor from './components/form-editor/form-editor.component';

const RootComponent: React.FC = () => {
  return (
    <BrowserRouter basename={`${window.spaBase}/form-builder`}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<FormEditor />} />
        <Route path="/edit/:formUuid" element={<FormEditor />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
