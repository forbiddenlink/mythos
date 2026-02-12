import { vi } from 'vitest';

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
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage.mock,
    writable: true,
  });
  return mockStorage;
}

/**
 * Date mocking utilities
 */
export function mockDate(date: Date | string) {
  const mockDateObj = new Date(date);
  vi.useFakeTimers();
  vi.setSystemTime(mockDateObj);
  return {
    restore: () => vi.useRealTimers(),
    advanceByDays: (days: number) => {
      const current = new Date();
      current.setDate(current.getDate() + days);
      vi.setSystemTime(current);
    },
    advanceByHours: (hours: number) => {
      const current = new Date();
      current.setHours(current.getHours() + hours);
      vi.setSystemTime(current);
    },
  };
}

/**
 * Get an ISO date string for a date relative to today
 */
export function getRelativeDate(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split('T')[0];
}

/**
 * Next.js router mock
 */
export function createRouterMock() {
  const pushMock = vi.fn();
  const replaceMock = vi.fn();
  const backMock = vi.fn();
  const forwardMock = vi.fn();
  const prefetchMock = vi.fn();
  const refreshMock = vi.fn();

  return {
    push: pushMock,
    replace: replaceMock,
    back: backMock,
    forward: forwardMock,
    prefetch: prefetchMock,
    refresh: refreshMock,
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
    basePath: '',
    isReady: true,
    isLocaleDomain: false,
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    isFallback: false,
    reset() {
      pushMock.mockClear();
      replaceMock.mockClear();
      backMock.mockClear();
      forwardMock.mockClear();
      prefetchMock.mockClear();
      refreshMock.mockClear();
    },
  };
}

/**
 * Mock the next/navigation module
 */
export function mockNextNavigation() {
  const router = createRouterMock();
  vi.mock('next/navigation', () => ({
    useRouter: () => router,
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
  }));
  return router;
}

/**
 * Fetch mock helper
 */
export function mockFetch(responseData: unknown, options?: { status?: number; ok?: boolean }) {
  const { status = 200, ok = true } = options || {};
  return vi.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(responseData),
      text: () => Promise.resolve(JSON.stringify(responseData)),
    })
  );
}

/**
 * Wait for all pending promises and timers
 */
export async function flushPromisesAndTimers() {
  await vi.runAllTimersAsync();
  await new Promise(resolve => setTimeout(resolve, 0));
}
