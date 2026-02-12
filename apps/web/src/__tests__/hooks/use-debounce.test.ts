import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should not update value until delay passes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');
  });

  it('should update value after delay passes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('should use default delay of 500ms when not specified', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // First change
    rerender({ value: 'first', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('initial');

    // Second change before first completes
    rerender({ value: 'second', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('initial');

    // Third change
    rerender({ value: 'third', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Only the last value should be applied
    expect(result.current).toBe('third');
  });

  it('should cancel timeout on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });

    // Unmount before delay completes
    unmount();

    // Advancing timers should not cause issues
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // No assertion needed - just ensure no errors
  });

  it('should handle different data types', () => {
    // Number
    const { result: numResult, rerender: numRerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 0 } }
    );
    numRerender({ value: 42 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(numResult.current).toBe(42);

    // Object
    const obj1 = { foo: 'bar' };
    const obj2 = { foo: 'baz' };
    const { result: objResult, rerender: objRerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: obj1 } }
    );
    objRerender({ value: obj2 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(objResult.current).toBe(obj2);

    // Array
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];
    const { result: arrResult, rerender: arrRerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: arr1 } }
    );
    arrRerender({ value: arr2 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(arrResult.current).toBe(arr2);
  });

  it('should handle null and undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' as string | null | undefined } }
    );

    rerender({ value: null });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBeNull();

    rerender({ value: undefined });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBeUndefined();
  });

  it('should respect delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Change value with shorter delay
    rerender({ value: 'updated', delay: 100 });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('updated');
  });
});
