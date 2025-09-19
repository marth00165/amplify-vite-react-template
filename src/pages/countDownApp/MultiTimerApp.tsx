import { useState } from 'react';
import styled from 'styled-components';
import Timer from './Timer';

const Outer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 8px;
`;

const AddButton = styled.button`
  position: sticky;
  top: 0;
  left: 0;
  margin: 0 auto 24px auto;
  display: block;
  background: #ff4e50;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 0.6rem 1.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background 0.15s;
  &:disabled {
    background: #ffd1d1;
    color: #fff;
    cursor: not-allowed;
  }
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(140px, 1fr));
  gap: 16px;
  justify-items: center;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

type TimerData = { id: number; initialSeconds: number };

export default function MultiTimerApp() {
  const [timers, setTimers] = useState<TimerData[]>([
    { id: Date.now(), initialSeconds: 60 },
  ]);

  const handleAdd = () => {
    if (timers.length < 9) {
      setTimers((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), initialSeconds: 60 },
      ]);
    }
  };

  const handleRemove = (id: number) => {
    setTimers((prev) => prev.filter((timer) => timer.id !== id));
  };

  return (
    <Outer>
      <AddButton onClick={handleAdd} disabled={timers.length >= 9}>
        Add
      </AddButton>
      <Container>
        {timers.map((timer) => (
          <Timer
            key={timer.id}
            initialSeconds={timer.initialSeconds}
            small
            onClose={() => handleRemove(timer.id)}
          />
        ))}
      </Container>
    </Outer>
  );
}
