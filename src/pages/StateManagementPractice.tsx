import React, { useState, useReducer } from 'react';
import styled from 'styled-components';

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin: 10px 0;
`;

const initialState = { names: ['Alice', 'Bob'] };

type Action =
  | { type: 'ADD_NAME'; payload: string }
  | { type: 'REMOVE_NAME'; payload: string };

function reducer(state: typeof initialState, action: Action) {
  switch (action.type) {
    case 'ADD_NAME':
      return { names: [...state.names, action.payload] };
    case 'REMOVE_NAME':
      return { names: state.names.filter((name) => name !== action.payload) };
    default:
      return state;
  }
}

const StateManagementPractice: React.FC = () => {
  // useState example
  const [count, setCount] = useState(0);

  // useReducer example
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: '1rem' }}>
      <h2>useState Example</h2>
      <div>Count: {count}</div>
      <ButtonContainer>
        <button onClick={() => setCount(count + 1)}>+</button>
        <button onClick={() => setCount(count - 1)}>-</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </ButtonContainer>

      <h2 style={{ marginTop: '2rem' }}>useReducer Example</h2>
      <div>Names:</div>
      <ul>
        {state.names.map((name) => (
          <li
            style={{ display: 'flex', justifyContent: 'space-between' }}
            key={name}
          >
            {name}{' '}
            <button
              style={{
                fontSize: '0.8rem',
              }}
              onClick={() => dispatch({ type: 'REMOVE_NAME', payload: name })}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <ButtonContainer>
        <button
          onClick={() => {
            const newName = prompt('Enter a name:');
            if (newName) {
              dispatch({ type: 'ADD_NAME', payload: newName });
            }
          }}
        >
          Add Name
        </button>
      </ButtonContainer>
    </div>
  );
};

export default StateManagementPractice;
