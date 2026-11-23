import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

window.URL.createObjectURL = vi.fn();
window.openmrsBase = '/openmrs';
window.spaBase = '/spa';
window.getOpenmrsSpaBase = () => '/openmrs/spa/';

// https://github.com/jsdom/jsdom/issues/1695
window.HTMLElement.prototype.scrollIntoView = function () {};

// CodeMirror measures text through Range rects, which jsdom doesn't implement.
// https://github.com/jsdom/jsdom/issues/3729
Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
Range.prototype.getBoundingClientRect = () => new DOMRect();
