import styled from 'styled-components';

export const Button = styled.button`
  background: #52528c;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: #7c9eb2;
  }
`;

export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100; // Higher than navbar's z-index of 1000
`;

export const ModalContent = styled.div`
  background: #7c9eb2;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  color: white;
`;

export const Field = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.25rem;
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
  }
`;

export const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;
