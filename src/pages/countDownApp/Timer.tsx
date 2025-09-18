import React, { useState } from 'react';
import {
  useCountDownTimer,
  UseCountDownTimerReturn,
} from './useCountDownTimer';

export function Timer() {
  const [input, setInput] = useState<string>('60');
  const {
    seconds,
    isComplete,
    isRunning,
    play,
    pause,
    reset,
    setSeconds,
  }: UseCountDownTimerReturn = useCountDownTimer(Number(input) || 0, () => {
    alert("Time's up!");
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value.replace(/^0+/, '') || ''); // Remove leading zeros
  };

  const handleSet = () => {
    reset(Number(input) || 0);
    setSeconds(Number(input) || 0);
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
        <button onClick={() => reset(Number(input) || 0)}>Reset</button>
      </div>
      {isComplete && (
        <div style={{ color: 'red', marginTop: 12 }}>Time's up!</div>
      )}
    </div>
  );
}

export default Timer;
