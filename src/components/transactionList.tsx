import styled from 'styled-components';
import { Button } from './themed-components';

const TransactionListContainer = styled.div`
  margin-top: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const TransactionItem = styled.div`
  padding: 0.75rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem 0.5rem;
  margin-left: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 0, 0, 0.2);
    color: white;
  }
`;

const LoadMoreButton = styled(Button)`
  width: 100%;
  margin-top: 1rem;
  background: rgba(82, 82, 140, 0.5);
`;

interface Transaction {
  id: string;
  vendor: string;
  amount: number;
  type: 'income' | 'expense';
  createdAt: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  nextToken?: string;
  onLoadMore: () => void;
  onDeleteTransaction?: (transaction: Transaction) => Promise<void>;
}

export default function TransactionList({
  transactions,
  isLoading,
  nextToken,
  onLoadMore,
  onDeleteTransaction,
}: TransactionListProps) {
  return (
    <TransactionListContainer>
      {isLoading && transactions.length === 0 ? (
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  color: transaction.type === 'income' ? '#4caf50' : '#f44336',
                  fontWeight: 'bold',
                }}
              >
                ${transaction.amount.toFixed(2)}
              </div>
              {onDeleteTransaction && (
                <DeleteButton
                  onClick={() => onDeleteTransaction(transaction)}
                  title='Delete transaction'
                >
                  🗑️
                </DeleteButton>
              )}
            </div>
          </TransactionItem>
        ))
      )}
      {nextToken && (
        <LoadMoreButton onClick={onLoadMore} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Load More'}
        </LoadMoreButton>
      )}
    </TransactionListContainer>
  );
}
