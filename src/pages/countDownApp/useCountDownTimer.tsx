import { useEffect, useRef, useState, useCallback } from 'react';

export type UseCountDownTimerReturn = {
  seconds: number;
  isComplete: boolean;
  isRunning: boolean;
  play: () => void;
  pause: () => void;
  reset: (nextSeconds?: number) => void;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
};

export function useCountDownTimer(
  initialSeconds: number = 0,
  onComplete?: () => void
): UseCountDownTimerReturn {
  const [seconds, setSeconds] = useState<number>(initialSeconds);
  const [playing, setPlaying] = useState<boolean>(false);

  const onCompleteRef = useRef<(() => void) | undefined>(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setSeconds(initialSeconds);
    setPlaying(false);
  }, [initialSeconds]);

  const endAtRef = useRef<number | null>(null);

  const play = useCallback(() => {
    if (seconds <= 0) return;
    endAtRef.current = Date.now() + seconds * 1000;
    setPlaying(true);
  }, [seconds]);

  const pause = useCallback(() => {
    setPlaying(false);
    if (endAtRef.current) {
      const remainingMs = Math.max(0, endAtRef.current - Date.now());
      setSeconds(Math.ceil(remainingMs / 1000));
      endAtRef.current = null;
    }
  }, []);

  const reset = useCallback(
    (nextSeconds: number = initialSeconds) => {
      setPlaying(false);
      endAtRef.current = null;
      setSeconds(nextSeconds);
    },
    [initialSeconds]
  );

  useEffect(() => {
    if (!playing) return;

    const tick = () => {
      if (endAtRef.current === null) return;
      const remainingMs = Math.max(0, endAtRef.current - Date.now());
      const next = Math.ceil(remainingMs / 1000);
      setSeconds(next);
      if (next <= 0) {
        setPlaying(false);
        endAtRef.current = null;
        onCompleteRef.current?.();
      }
    };

    tick();
    const id = setInterval(tick, 1000);

    return () => clearInterval(id);
  }, [playing]);

  return {
    seconds,
    isComplete: seconds <= 0,
    isRunning: playing,
    play,
    pause,
    reset,
    setSeconds,
  };
}

export default useCountDownTimer;
