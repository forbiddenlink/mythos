import "@testing-library/jest-dom/vitest";

// React 18+ / 19: enable act() in test env (quiets Radix/async focus updates in jsdom)
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Ensure jsdom localStorage is bound to globalThis across Node 22+ and Node 26
class MemoryStorage {
  constructor() {
    this._store = new Map();
  }
  getItem(key) {
    return this._store.has(String(key)) ? this._store.get(String(key)) : null;
  }
  setItem(key, value) {
    this._store.set(String(key), String(value));
  }
  removeItem(key) {
    this._store.delete(String(key));
  }
  clear() {
    this._store.clear();
  }
  key(index) {
    const keys = Array.from(this._store.keys());
    return keys[index] ?? null;
  }
  get length() {
    return this._store.size;
  }
}

const storageInstance =
  (typeof window !== "undefined" && window.localStorage) || new MemoryStorage();

Object.defineProperty(globalThis, "localStorage", {
  value: storageInstance,
  configurable: true,
  writable: true,
});
if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    value: storageInstance,
    configurable: true,
    writable: true,
  });
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollTo
window.scrollTo = () => {};

// Mock window.location
Object.defineProperty(window, "location", {
  writable: true,
  value: {
    ...window.location,
    reload: () => {},
    assign: () => {},
    replace: () => {},
  },
});

// Mock scrollIntoView for cmdk and other components
Element.prototype.scrollIntoView = () => {};

// Mock requestAnimationFrame for tests
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock pointer capture methods
Element.prototype.setPointerCapture = () => {};
Element.prototype.releasePointerCapture = () => {};
Element.prototype.hasPointerCapture = () => false;

// Suppress console errors in tests for cleaner output
// Comment out these lines if you need to debug test failures
// const originalError = console.error;
// console.error = (...args) => {
//   if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
//     return;
//   }
//   originalError.apply(console, args);
// };
