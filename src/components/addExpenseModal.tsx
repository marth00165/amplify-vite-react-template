import { useState } from 'react';
import {
  Button,
  Field,
  ModalBackdrop,
  ModalContent,
} from './themed-components';
import styled from 'styled-components';

const AddButton = styled(Button)``;

const CloseButton = styled(Button)`
  background: rgba(255, 255, 255, 0.2);
  margin-right: 10px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  input {
    margin-right: 0.5rem;
  }
`;

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: {
      type: 'income' | 'expense';
      amount: number;
      vendor: string;
      notes: string;
    },
    keepOpen: boolean
  ) => Promise<void>; // Add keepOpen parameter
  initialType?: 'income' | 'expense';
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  initialType = 'income',
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');
  const [addMultiple, setAddMultiple] = useState(false);

  const handleSubmit = async () => {
    if (!amount || amount === '0') {
      setAmountError('Please enter a valid amount');
      return;
    }

    try {
      await onSubmit(
        {
          type,
          amount: Number(amount),
          vendor,
          notes,
        },
        addMultiple
      ); // Pass the addMultiple state

      // Reset form fields but don't close
      setAmount('');
      setAmountError('');
      setVendor('');
      setNotes('');
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setAmount('');
    setAmountError('');
    setVendor('');
    setNotes('');
    setAddMultiple(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>Add Transaction</h2>
        <Field>
          <label>Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value='income'>Income</option>
            <option value='expense'>Expense</option>
          </select>
        </Field>
        <Field>
          <label>Amount:</label>
          <input
            type='number'
            min='0'
            step='0.01'
            value={amount}
            onChange={(e) => {
              const positiveValue = e.target.value.replace(/^-/, '');
              setAmount(positiveValue);
              setAmountError(positiveValue ? '' : 'Amount is required');
            }}
            onKeyDown={(e) => {
              if (e.key === '-' || e.key === 'e') {
                e.preventDefault();
              }
            }}
          />
          {amountError && (
            <div
              style={{
                color: '#ff6b6b',
                fontSize: '0.8rem',
                marginTop: '0.25rem',
              }}
            >
              {amountError}
            </div>
          )}
        </Field>
        <Field>
          <label>Vendor:</label>
          <input
            type='text'
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          />
        </Field>
        <Field>
          <label>Notes (optional):</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </Field>

        <CheckboxContainer>
          <input
            type='checkbox'
            id='addMultiple'
            checked={addMultiple}
            onChange={() => setAddMultiple(!addMultiple)}
          />
          <label htmlFor='addMultiple'>Keep adding transactions</label>
        </CheckboxContainer>

        <ButtonContainer>
          <CloseButton onClick={handleClose}>Cancel</CloseButton>
          <AddButton
            onClick={handleSubmit}
            disabled={!amount || amount === '0'}
            style={{
              opacity: !amount || amount === '0' ? 0.5 : 1,
              cursor: !amount || amount === '0' ? 'not-allowed' : 'pointer',
            }}
          >
            Save
          </AddButton>
        </ButtonContainer>
      </ModalContent>
    </ModalBackdrop>
  );
}
