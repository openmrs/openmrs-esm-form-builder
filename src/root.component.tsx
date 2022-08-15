import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import FormBuilder from "./form-builder";
import FormEditor from "./components/form-editor/form-editor";

const RootComponent: React.FC = () => {
  return (
    <BrowserRouter basename={`${window.spaBase}/form-builder`}>
      <Route exact path="/" component={FormBuilder} />
      <Route exact path="/edit/:uuid" component={FormEditor} />
    </BrowserRouter>
  );
};

export default RootComponent;
