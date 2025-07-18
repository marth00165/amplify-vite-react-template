import styled from 'styled-components';
import { Button } from './themed-components';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  position: relative; /* Ensure positioned elements inside have a relative context */
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

const InfoIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 12px;
  margin-left: 8px;
  cursor: help;
  position: relative;
  overflow: visible; /* Allow the tooltip to escape */
`;

// Modified Tooltip for portal approach
const TooltipPortal = styled.div<{ visible: boolean }>`
  position: fixed;
  background: #2a2a4a;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: max-content;
  max-width: 250px;
  z-index: 9999;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.2s;
  pointer-events: none;

  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: #2a2a4a transparent transparent transparent;
  }
`;

interface Transaction {
  id: string;
  vendor: string;
  amount: number;
  type: 'income' | 'expense';
  createdAt: string;
  notes?: string; // Add notes to the interface
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
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to update tooltip position
  const updateTooltipPosition = (iconElement: HTMLElement) => {
    const rect = iconElement.getBoundingClientRect();
    setTooltipPosition({
      top: rect.top - 40, // Position above the icon with some spacing
      left: rect.left + rect.width / 2, // Center the tooltip
    });
  };

  // Handle scroll events to update tooltip position
  useEffect(() => {
    if (!activeTooltip) return;

    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const iconElement = document.getElementById(`info-icon-${activeTooltip}`);
      if (iconElement) {
        updateTooltipPosition(iconElement);
      } else {
        setActiveTooltip(null); // Hide if icon is not found
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [activeTooltip]);

  const handleShowTooltip = (transaction: Transaction, e: React.MouseEvent) => {
    const iconElement = e.currentTarget as HTMLElement;
    updateTooltipPosition(iconElement);
    setTooltipContent(transaction.notes || '');
    setActiveTooltip(transaction.id);
  };

  return (
    <TransactionListContainer ref={containerRef}>
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
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                ${transaction.amount.toFixed(2)}
                {transaction.notes && (
                  <InfoIcon
                    id={`info-icon-${transaction.id}`}
                    onMouseEnter={(e) => handleShowTooltip(transaction, e)}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    i
                  </InfoIcon>
                )}
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

      {/* Render tooltip using portal */}
      {activeTooltip &&
        createPortal(
          <TooltipPortal
            visible={true}
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: 'translateX(-50%)', // Center horizontally
            }}
          >
            {tooltipContent}
          </TooltipPortal>,
          document.body
        )}

      {nextToken && (
        <LoadMoreButton onClick={onLoadMore} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Load More'}
        </LoadMoreButton>
      )}
    </TransactionListContainer>
  );
}
