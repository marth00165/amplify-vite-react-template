import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuthenticator } from '@aws-amplify/ui-react';
import {
  addTransaction,
  getWalletBalance,
  getTransactions,
} from '../api/transactions';
import { Button } from '../components/themed-components';
import AddExpenseModal from '../components/addExpenseModal';

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

const TransactionList = styled.div`
  margin-top: 1rem;
`;

const TransactionItem = styled.div`
  padding: 0.75rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
`;

const LoadMoreButton = styled(Button)`
  width: 100%;
  margin-top: 1rem;
  background: rgba(82, 82, 140, 0.5);
`;

export default function Dashboard() {
  const { user } = useAuthenticator();
  const [balance, setBalance] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);

  const fetchTransactions = useCallback(
    async (limit = 10) => {
      if (!user?.signInDetails?.loginId) return;

      setTransactionsLoading(true);
      try {
        const userId = user.signInDetails.loginId;
        const result = await getTransactions(userId, limit);

        setTransactions(result.transactions);
        setNextToken(result.nextToken ?? undefined);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setTransactionsLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    async function fetchInitialData() {
      if (!user?.signInDetails?.loginId) return;
      const userId = user.signInDetails.loginId;

      const balance = await getWalletBalance(userId);
      setBalance(balance);

      await fetchTransactions();
    }

    fetchInitialData();
  }, [user, fetchTransactions]);

  const loadMoreTransactions = useCallback(async () => {
    if (!nextToken || !user?.signInDetails?.loginId) return;

    setTransactionsLoading(true);
    try {
      const userId = user.signInDetails.loginId;
      const result = await getTransactions(userId, 10, nextToken);

      setTransactions((prev) => [...prev, ...result.transactions]);
      setNextToken(result.nextToken ?? undefined);
    } catch (error) {
      console.error('Error loading more transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  }, [nextToken, user]);

  const handleAddTransaction = async (data: {
    type: 'income' | 'expense';
    amount: number;
    vendor: string;
    notes: string;
  }) => {
    if (!user?.signInDetails?.loginId) return;

    const userId = user.signInDetails.loginId;

    try {
      const newBalance = await addTransaction(
        userId,
        data.type,
        data.amount,
        data.vendor,
        data.notes
      );

      if (newBalance !== null) {
        setBalance(newBalance);

        const newTransaction = {
          id: `temp-${Date.now()}`,
          userId,
          type: data.type,
          amount: data.amount,
          vendor: data.vendor,
          notes: data.notes,
          createdAt: new Date().toISOString(),
        };

        setTransactions((prev) => [newTransaction, ...prev]);

        setTimeout(() => fetchTransactions(), 1000);
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <LeftColumn>
        <h2>Recent Transactions</h2>
        <TransactionList>
          {transactionsLoading && transactions.length === 0 ? (
            <p>Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            transactions.map((transaction) => (
              <TransactionItem key={transaction.id}>
                <div>
                  <div>{transaction.vendor}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div
                  style={{
                    color:
                      transaction.type === 'income' ? '#4caf50' : '#f44336',
                    fontWeight: 'bold',
                  }}
                >
                  ${transaction.amount.toFixed(2)}
                </div>
              </TransactionItem>
            ))
          )}
          {nextToken && (
            <LoadMoreButton
              onClick={loadMoreTransactions}
              disabled={transactionsLoading}
            >
              {transactionsLoading ? 'Loading...' : 'Load More'}
            </LoadMoreButton>
          )}
        </TransactionList>
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
      </MainContent>
      <RightColumn>
        <h2>Coming Soon</h2>
        <p>Additional features will be available here.</p>
      </RightColumn>
      <AddExpenseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddTransaction}
      />
    </DashboardLayout>
  );
}
