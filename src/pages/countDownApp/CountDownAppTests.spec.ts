/// <reference types="vitest/globals" />
import { useCountDownTimer } from './useCountDownTimer';
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.useFakeTimers();

describe('useCountDownTimer', () => {
  it('initializes with the given seconds', () => {
    const { result } = renderHook(() => useCountDownTimer(10));
    expect(result.current.seconds).toBe(10);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.isRunning).toBe(false);
  });

  it('starts countdown when play is called', () => {
    const { result } = renderHook(() => useCountDownTimer(3));
    act(() => {
      result.current.play();
    });
    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.seconds).toBe(2);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.seconds).toBe(0);
    expect(result.current.isComplete).toBe(true);
    expect(result.current.isRunning).toBe(false);
  });

  it('pauses and resumes countdown', () => {
    const { result } = renderHook(() => useCountDownTimer(5));
    act(() => {
      result.current.play();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    act(() => {
      result.current.pause();
    });
    const pausedAt = result.current.seconds;
    expect(result.current.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.seconds).toBe(pausedAt);

    act(() => {
      result.current.play();
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.seconds).toBe(pausedAt - 1);
  });

  it('resets to initial or given seconds', () => {
    const { result } = renderHook(() => useCountDownTimer(4));
    act(() => {
      result.current.play();
      vi.advanceTimersByTime(2000);
      result.current.reset();
    });
    expect(result.current.seconds).toBe(4);
    expect(result.current.isRunning).toBe(false);

    act(() => {
      result.current.reset(7);
    });
    expect(result.current.seconds).toBe(7);
  });

  it('calls onComplete callback when finished', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useCountDownTimer(2, onComplete));
    act(() => {
      result.current.play();
      vi.advanceTimersByTime(2000);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});