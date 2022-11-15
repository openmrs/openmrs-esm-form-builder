import React from "react";
import { render, cleanup } from "@testing-library/react";
import FormBuilder from "./form-builder";

describe(`<FormBuilder />`, () => {
  afterEach(cleanup);
  it(`renders without dying`, () => {
    render(<FormBuilder />);
  });
});
