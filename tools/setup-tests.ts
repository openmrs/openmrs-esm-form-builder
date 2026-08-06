import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Node >=22 defines an experimental localStorage/sessionStorage global that
// resolves to undefined unless --localstorage-file is passed, shadowing jsdom's
// storage. Restore the jsdom-backed instances (or an in-memory fallback).
function installStorage(name: 'localStorage' | 'sessionStorage') {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
  if (descriptor && typeof descriptor.get === 'function') {
    let store: Storage;
    try {
      store = (globalThis as { jsdom?: { window: Window } }).jsdom.window[name];
    } catch {
      store = undefined;
    }
    if (!store) {
      const data = new Map<string, string>();
      store = {
        get length() {
          return data.size;
        },
        key(index: number) {
          return [...data.keys()][index] ?? null;
        },
        getItem(key: string) {
          return data.has(key) ? data.get(key) : null;
        },
        setItem(key: string, value: string) {
          data.set(key, String(value));
        },
        removeItem(key: string) {
          data.delete(key);
        },
        clear() {
          data.clear();
        },
      } as Storage;
    }
    Object.defineProperty(globalThis, name, { value: store, configurable: true, writable: true });
  }
}

installStorage('localStorage');
installStorage('sessionStorage');

window.URL.createObjectURL = vi.fn();
window.openmrsBase = '/openmrs';
window.spaBase = '/spa';
window.getOpenmrsSpaBase = () => '/openmrs/spa/';

// https://github.com/jsdom/jsdom/issues/1695
window.HTMLElement.prototype.scrollIntoView = function () {};
