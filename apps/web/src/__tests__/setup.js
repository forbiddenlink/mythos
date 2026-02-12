import '@testing-library/jest-dom/vitest';

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
Object.defineProperty(window, 'matchMedia', {
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
Object.defineProperty(window, 'location', {
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
