/**
 * Vitest setup — runs once before each test file.
 *
 * Resets DOM state and stubs browser-isms that jsdom doesn't ship.
 */

import { afterEach, beforeEach, vi } from 'vitest';

// jsdom 29 ships without a working localStorage by default. Provide an
// in-memory implementation so production code that calls localStorage.* works.
if (typeof window.localStorage === 'undefined' || typeof window.localStorage.getItem !== 'function') {
  const store = new Map();
  const localStorageMock = {
    get length() { return store.size; },
    key: (i) => Array.from(store.keys())[i] ?? null,
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(String(k), String(v)); },
    removeItem: (k) => { store.delete(k); },
    clear: () => { store.clear(); },
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
}

// jsdom doesn't implement matchMedia — stub it so `prefers-color-scheme` checks
// behave as "light mode" by default.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

beforeEach(() => {
  // Fresh document for each test
  document.documentElement.innerHTML = '<head></head><body></body>';
  document.documentElement.removeAttribute('data-theme');
  // Clean localStorage
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});
