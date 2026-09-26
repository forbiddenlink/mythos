import { vi } from "vitest";

/**
 * LocalStorage mock with tracking
 */
export function createLocalStorageMock() {
  const store = new Map<string, string>();
  const calls = {
    getItem: [] as string[],
    setItem: [] as Array<{ key: string; value: string }>,
    removeItem: [] as string[],
    clear: 0,
  };

  return {
    mock: {
      getItem: vi.fn((key: string) => {
        calls.getItem.push(key);
        return store.get(key) ?? null;
      }),
      setItem: vi.fn((key: string, value: string) => {
        calls.setItem.push({ key, value });
        store.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        calls.removeItem.push(key);
        store.delete(key);
      }),
      clear: vi.fn(() => {
        calls.clear++;
        store.clear();
      }),
      get length() {
        return store.size;
      },
      key: vi.fn((index: number) => {
        return Array.from(store.keys())[index] ?? null;
      }),
    },
    calls,
    store,
    reset() {
      store.clear();
      calls.getItem = [];
      calls.setItem = [];
      calls.removeItem = [];
      calls.clear = 0;
    },
  };
}

/**
 * Install localStorage mock on window object
 */
export function installLocalStorageMock() {
  const mockStorage = createLocalStorageMock();
  Object.defineProperty(window, "localStorage", {
    value: mockStorage.mock,
    writable: true,
  });
  return mockStorage;
}
