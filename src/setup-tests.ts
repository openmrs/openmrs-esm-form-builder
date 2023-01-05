import "@testing-library/jest-dom/extend-expect";

declare global {
  interface Window {
    URL: {
      createObjectURL: (blob: Blob) => string;
    };
  }
}

window.URL.createObjectURL = jest.fn();
