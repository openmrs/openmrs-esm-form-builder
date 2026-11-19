import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

window.URL.createObjectURL = vi.fn();
window.openmrsBase = '/openmrs';
window.spaBase = '/spa';
window.getOpenmrsSpaBase = () => '/openmrs/spa/';

// https://github.com/jsdom/jsdom/issues/1695
window.HTMLElement.prototype.scrollIntoView = function () {};

// Carbon's TextArea observes its wrapper's width; jsdom has no ResizeObserver.
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
