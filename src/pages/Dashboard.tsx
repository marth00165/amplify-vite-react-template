import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuthenticator } from '@aws-amplify/ui-react';
import {
  addTransaction,
  getWalletBalance,
  getTransactions,
  deleteTransaction,
} from '../api/transactions';
import { Button } from '../components/themed-components';
import AddExpenseModal from '../components/addExpenseModal';
import TransactionList from '../components/transactionList';
import GoalsSection from '../components/goals/goalsSection';
import { useUser } from '../context/UserContext';

const DashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 2rem;
  padding: 2rem;
  color: white;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  background: rgba(82, 82, 140, 0.2);
  padding: 1.5rem;
  border-radius: 8px;
`;

const MainContent = styled.div`
  background: rgba(82, 82, 140, 0.1);
  padding: 2rem;
  border-radius: 8px;
`;

const RightColumn = styled.div`
  background: rgba(82, 82, 140, 0.2);
  padding: 1.5rem;
  border-radius: 8px;
`;

const AddButton = styled(Button)``;

export default function Dashboard() {
  const { currentUser } = useUser();
  const [balance, setBalance] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);

  // Load balance when user changes
  useEffect(() => {
    async function fetchBalance() {
      if (!currentUser?.cognitoId) return;

      try {
        const balance = await getWalletBalance(currentUser.cognitoId);
        setBalance(balance);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    }

    fetchBalance();
  }, [currentUser]);

  const fetchTransactions = useCallback(async (userId: string, limit = 10) => {
    setTransactionsLoading(true);
    try {
      const result = await getTransactions(userId, limit);

      setTransactions(result.transactions);
      setNextToken(result.nextToken ?? undefined);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  // Load transactions when user changes
  useEffect(() => {
    if (!currentUser?.cognitoId) return;
    fetchTransactions(currentUser.cognitoId);
  }, [currentUser, fetchTransactions]);

  // Load more transactions
  const loadMoreTransactions = useCallback(async () => {
    if (!nextToken || !currentUser?.cognitoId) return;

    setTransactionsLoading(true);
    try {
      const result = await getTransactions(
        currentUser.cognitoId,
        10,
        nextToken
      );
      setTransactions((prev) => [...prev, ...result.transactions]);
      setNextToken(result.nextToken ?? undefined);
    } catch (error) {
      console.error('Error loading more transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  }, [nextToken, currentUser]);

  // Add transaction
  const handleAddTransaction = async (
    data: {
      type: 'income' | 'expense';
      amount: number;
      vendor: string;
      notes: string;
    },
    keepOpen: boolean
  ) => {
    if (!currentUser?.cognitoId) return;

    try {
      const newBalance = await addTransaction(
        currentUser.cognitoId,
        data.type,
        data.amount,
        data.vendor,
        data.notes
      );

      if (newBalance !== null) {
        setBalance(newBalance);
        // Refetch transactions instead of adding a temporary one
        await fetchTransactions(currentUser.cognitoId);
      }

      if (!keepOpen) {
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    }
  };

  const handleDeleteTransaction = async (transaction: any) => {
    if (!currentUser?.cognitoId) return;

    // Confirm before deleting
    const confirm = window.confirm(
      `Are you sure you want to delete this ${
        transaction.type
      } of $${transaction.amount.toFixed(2)}?`
    );
    if (!confirm) return;

    try {
      const newBalance = await deleteTransaction(
        transaction.id,
        currentUser.cognitoId,
        transaction.type as 'income' | 'expense',
        transaction.amount
      );

      if (newBalance !== null) {
        setBalance(newBalance);
        // Remove the transaction from the list
        setTransactions((prev) => prev.filter((t) => t.id !== transaction.id));
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <LeftColumn>
        <h2>Recent Transactions</h2>
        <TransactionList
          transactions={transactions}
          isLoading={transactionsLoading}
          nextToken={nextToken}
          onLoadMore={loadMoreTransactions}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </LeftColumn>
      <MainContent>
        <h1>Welcome to your Dashboard</h1>
        <p>
          Your Wallet Balance:{' '}
          {balance !== null ? `$${balance.toFixed(2)}` : 'Loading...'}
        </p>
        <AddButton onClick={() => setShowModal(true)}>
          Add Transaction
        </AddButton>
        <AddExpenseModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddTransaction}
        />
      </MainContent>
      <RightColumn>
        {currentUser?.cognitoId && (
          <GoalsSection userId={currentUser.cognitoId} />
        )}
      </RightColumn>
    </DashboardLayout>
  );
}
