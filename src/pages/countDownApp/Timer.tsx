import React, { useState } from 'react';
import styled from 'styled-components';
import {
  useCountDownTimer,
  UseCountDownTimerReturn,
} from './useCountDownTimer';

const Container = styled.div`
  max-width: 320px;
  margin: 2rem auto;
  text-align: center;
  background: #fffbe7;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 2rem 1rem;
`;

const TimerDisplay = styled.div`
  font-size: 2.5rem;
  margin: 1rem 0;
  color: #ff4e50;
`;

const InputRow = styled.div`
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Input = styled.input`
  width: 80px;
  font-size: 1.2rem;
  text-align: center;
  padding: 0.4rem;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  margin-left: 8px;
  background: #ff4e50;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.15s;
  &:disabled {
    background: #ffd1d1;
    color: #fff;
    cursor: not-allowed;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const CompleteMsg = styled.div`
  color: #ff4e50;
  margin-top: 12px;
  font-weight: bold;
`;

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
    setInput(e.target.value.replace(/^0+/, '') || '');
  };

  const handleSet = () => {
    reset(Number(input) || 0);
    setSeconds(Number(input) || 0);
  };

  return (
    <Container>
      <h2>Countdown Timer</h2>
      <TimerDisplay>{seconds}s</TimerDisplay>
      <InputRow>
        <Input
          type='number'
          min={0}
          value={input}
          onChange={handleInputChange}
          placeholder='Seconds'
        />
        <Button onClick={handleSet}>Set</Button>
      </InputRow>
      <ButtonRow>
        <Button onClick={play} disabled={isRunning || seconds <= 0}>
          Start
        </Button>
        <Button onClick={pause} disabled={!isRunning}>
          Pause
        </Button>
        <Button onClick={() => reset(Number(input) || 0)}>Reset</Button>
      </ButtonRow>
      {isComplete && <CompleteMsg>Time's up!</CompleteMsg>}
    </Container>
  );
}

export default Timer;
