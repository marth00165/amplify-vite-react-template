import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

const MainContent = styled.div`
  padding: 2rem;
  color: white;
`;

const AddButton = styled.button`
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

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: #7c9eb2;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  color: white;
`;

const Field = styled.div`
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

export default function Dashboard() {
  const { user } = useAuthenticator();
  const [balance, setBalance] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [amount, setAmount] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function fetchWallet() {
      if (!user?.signInDetails?.loginId) return;

      const userId = user.signInDetails.loginId;

      const wallet = await client.models.Wallet.list({
        filter: { userId: { eq: userId } },
      });

      if (wallet.data.length > 0) {
        setBalance(wallet.data[0].balance);
      } else {
        const newWallet = await client.models.Wallet.create({
          userId,
          balance: 0,
        });
        setBalance(newWallet.data?.balance ?? 0);
      }
    }

    fetchWallet();
  }, [user]);

  const handleAddTransaction = async () => {
    if (!user?.signInDetails?.loginId) return;
    if (!amount || amount === '0') {
      setAmountError('Please enter a valid amount');
      return;
    }

    const userId = user.signInDetails.loginId;
    const numericAmount = Number(amount);

    await client.models.Transaction.create({
      userId,
      type,
      amount: numericAmount,
      vendor,
      notes,
      createdAt: new Date().toISOString(),
    });

    const wallet = await client.models.Wallet.list({
      filter: { userId: { eq: userId } },
    });

    if (wallet.data.length > 0) {
      const oldBalance = wallet.data[0].balance;
      const adjustment = type === 'income' ? numericAmount : -numericAmount;

      await client.models.Wallet.update({
        id: wallet.data[0].id,
        balance: (oldBalance ?? 0) + adjustment,
      });

      setBalance((oldBalance ?? 0) + adjustment);
    }

    setAmount('');
    setAmountError('');
    setVendor('');
    setNotes('');
    setShowModal(false);
  };

  return (
    <MainContent>
      <h1>Welcome to your Dashboard</h1>
      <p>
        Your Wallet Balance:{' '}
        {balance !== null ? `$${balance.toFixed(2)}` : 'Loading...'}
      </p>

      <AddButton onClick={() => setShowModal(true)}>Add Transaction</AddButton>

      {showModal && (
        <ModalBackdrop onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>Add Transaction</h2>
            <Field>
              <label>Type:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value='income'>Income</option>
                <option value='expense'>Expense</option>
              </select>
            </Field>
            <Field>
              <label>Amount:</label>
              <input
                type='number'
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setAmountError(e.target.value ? '' : 'Amount is required');
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
            <AddButton
              onClick={handleAddTransaction}
              disabled={!amount || amount === '0'}
              style={{
                opacity: !amount || amount === '0' ? 0.5 : 1,
                cursor: !amount || amount === '0' ? 'not-allowed' : 'pointer',
              }}
            >
              Save
            </AddButton>
          </ModalContent>
        </ModalBackdrop>
      )}
    </MainContent>
  );
}
