import React, { useState } from 'react';
import styled from 'styled-components';
import {
  useCountDownTimer,
  UseCountDownTimerReturn,
} from './useCountDownTimer';

const Container = styled.div<{ small?: boolean }>`
  max-width: ${({ small }) => (small ? '320px' : '640px')};
  min-width: 0;
  margin: 0 auto;
  text-align: center;
  background: #fffbe7;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: ${({ small }) =>
    small ? '1rem 0.5rem 0.7rem 0.5rem' : '2rem 1rem'};
  position: relative;
`;

const TimerDisplay = styled.div<{ small?: boolean }>`
  font-size: ${({ small }) => (small ? '1.5rem' : '2.5rem')};
  margin: ${({ small }) => (small ? '0.5rem 0' : '1rem 0')};
  color: #ff4e50;
`;

const InputRow = styled.div`
  margin-bottom: 0.4rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Input = styled.input<{ small?: boolean }>`
  width: ${({ small }) => (small ? '48px' : '80px')};
  font-size: ${({ small }) => (small ? '1rem' : '1.2rem')};
  text-align: center;
  padding: 0.2rem;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const Button = styled.button<{ small?: boolean }>`
  margin-left: 6px;
  background: #ff4e50;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: ${({ small }) => (small ? '0.18rem 0.6rem' : '0.5rem 1.2rem')};
  font-size: ${({ small }) => (small ? '0.92rem' : '1rem')};
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  min-width: ${({ small }) => (small ? '44px' : '56px')};
  &:first-child {
    margin-left: 0;
  }
  &:disabled {
    background: #ffd1d1;
    color: #fff;
    cursor: not-allowed;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-top: 0.3rem;
`;

const CompleteMsg = styled.div`
  color: #ff4e50;
  margin-top: 6px;
  font-weight: bold;
  font-size: 0.92rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  background: #ff4e50;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  padding: 0;
  line-height: 1;
`;

export function Timer({
  initialSeconds = 60,
  small = false,
  onClose,
}: {
  initialSeconds?: number;
  small?: boolean;
  onClose?: () => void;
}) {
  const [input, setInput] = useState<string>(String(initialSeconds));
  const {
    seconds,
    isComplete,
    isRunning,
    play,
    pause,
    reset,
    setSeconds,
  }: UseCountDownTimerReturn = useCountDownTimer(Number(input) || 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value.replace(/^0+/, '') || '');
  };

  const handleSet = () => {
    reset(Number(input) || 0);
    setSeconds(Number(input) || 0);
  };

  return (
    <Container small={small}>
      {onClose && (
        <CloseButton onClick={onClose} title='Close timer'>
          ×
        </CloseButton>
      )}
      <TimerDisplay small={small}>{seconds}s</TimerDisplay>
      <InputRow>
        <Input
          type='number'
          min={0}
          value={input}
          onChange={handleInputChange}
          placeholder='Seconds'
          small={small}
        />
        <Button onClick={handleSet} small={small}>
          Set
        </Button>
      </InputRow>
      <ButtonRow>
        <Button
          onClick={play}
          disabled={isRunning || seconds <= 0}
          small={small}
        >
          Start
        </Button>
        <Button onClick={pause} disabled={!isRunning} small={small}>
          Pause
        </Button>
        <Button onClick={() => reset(Number(input) || 0)} small={small}>
          Reset
        </Button>
      </ButtonRow>
      {isComplete && <CompleteMsg>Time's up!</CompleteMsg>}
    </Container>
  );
}

export default Timer;
