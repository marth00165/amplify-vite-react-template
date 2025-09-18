import React, { useState } from 'react';
import {
  useCountDownTimer,
  UseCountDownTimerReturn,
} from './useCountDownTimer';

export function Timer() {
  const [input, setInput] = useState<number>(60);
  const {
    seconds,
    isComplete,
    isRunning,
    play,
    pause,
    reset,
    setSeconds,
  }: UseCountDownTimerReturn = useCountDownTimer(input, () => {
    alert("Time's up!");
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setInput(isNaN(val) ? 0 : val);
  };

  const handleSet = () => {
    reset(input);
    setSeconds(input);
  };

  return (
    <div style={{ maxWidth: 320, margin: '2rem auto', textAlign: 'center' }}>
      <h2>Countdown Timer</h2>
      <div style={{ fontSize: '2.5rem', margin: '1rem 0' }}>{seconds}s</div>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type='number'
          min={0}
          value={input}
          onChange={handleInputChange}
          style={{ width: 80, fontSize: '1.2rem', textAlign: 'center' }}
        />
        <button onClick={handleSet} style={{ marginLeft: 8 }}>
          Set
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button onClick={play} disabled={isRunning || seconds <= 0}>
          Start
        </button>
        <button onClick={pause} disabled={!isRunning}>
          Pause
        </button>
        <button onClick={() => reset(input)}>Reset</button>
      </div>
      {isComplete && (
        <div style={{ color: 'red', marginTop: 12 }}>Time's up!</div>
      )}
    </div>
  );
}

export default Timer;
