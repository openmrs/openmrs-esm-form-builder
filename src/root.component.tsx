import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import FormBuilder from "./form-builder";
import FormEditor from "./components/form-editor/form-editor";

const RootComponent: React.FC = () => {
  return (
    <BrowserRouter basename={`${window.spaBase}/form-builder`}>
      <Routes>
        <Route path="/" element={<FormBuilder />} />
        <Route path="/edit/:uuid" element={<FormEditor />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
