import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { foodChallengeTheme } from '../../theme';
import { Card } from '../themed-components';
import { SimpleTracker } from '../../api/foodChallengeSimplified';

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
`;

const ModalWrapper = styled.div`
  position: relative;
  z-index: 1001;
  margin: 20px;
`;

const ModalContent = styled(Card)`
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${foodChallengeTheme.spacing.lg};
  padding-bottom: ${foodChallengeTheme.spacing.md};
  border-bottom: 2px solid ${foodChallengeTheme.colors.secondary};
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${foodChallengeTheme.colors.primary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${foodChallengeTheme.colors.primary};
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`;

const ProgressSection = styled.div`
  margin-bottom: ${foodChallengeTheme.spacing.xl};
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${foodChallengeTheme.spacing.sm};
  font-weight: bold;
  color: ${foodChallengeTheme.colors.text};
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 24px;
  background-color: #e0e0e0;
  border-radius: ${foodChallengeTheme.borderRadius.md};
  overflow: hidden;
  position: relative;
`;

const ProgressBar = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${(props) => props.percentage}%;
  background: linear-gradient(
    90deg,
    ${foodChallengeTheme.colors.primary},
    ${foodChallengeTheme.colors.secondary}
  );
  border-radius: ${foodChallengeTheme.borderRadius.md};
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.75rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${foodChallengeTheme.spacing.md};
  margin-bottom: ${foodChallengeTheme.spacing.lg};
`;

const StatCard = styled.div`
  background-color: ${foodChallengeTheme.colors.background};
  padding: ${foodChallengeTheme.spacing.md};
  border-radius: ${foodChallengeTheme.borderRadius.md};
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${foodChallengeTheme.colors.textSecondary};
  margin-bottom: ${foodChallengeTheme.spacing.xs};
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${foodChallengeTheme.colors.primary};
`;

const SearchSection = styled.div`
  display: flex;
  gap: ${foodChallengeTheme.spacing.md};
  margin-bottom: ${foodChallengeTheme.spacing.lg};
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: ${foodChallengeTheme.spacing.sm};
  border: 2px solid ${foodChallengeTheme.colors.secondary};
  border-radius: ${foodChallengeTheme.borderRadius.md};
  font-size: ${foodChallengeTheme.typography.body.fontSize};

  &:focus {
    outline: none;
    border-color: ${foodChallengeTheme.colors.primary};
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-bottom: ${foodChallengeTheme.spacing.lg};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
`;

const TableHeader = styled.thead`
  background-color: ${foodChallengeTheme.colors.background};
  border-bottom: 2px solid ${foodChallengeTheme.colors.secondary};
`;

const TableHeaderCell = styled.th`
  padding: ${foodChallengeTheme.spacing.md};
  text-align: left;
  color: ${foodChallengeTheme.colors.primary};
  font-weight: bold;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #e0e0e0;

  &:hover {
    background-color: #fafafa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: ${foodChallengeTheme.spacing.md};
  color: ${foodChallengeTheme.colors.text};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${foodChallengeTheme.spacing.xl};
  color: ${foodChallengeTheme.colors.textSecondary};
`;

const ChartSection = styled.div`
  margin: ${foodChallengeTheme.spacing.xl} 0;
  padding: ${foodChallengeTheme.spacing.lg};
  background-color: ${foodChallengeTheme.colors.background};
  border-radius: ${foodChallengeTheme.borderRadius.md};
`;

const ChartTitle = styled.h3`
  margin: 0 0 ${foodChallengeTheme.spacing.md} 0;
  color: ${foodChallengeTheme.colors.primary};
`;

const ChartContainer = styled.div`
  display: flex;
  gap: ${foodChallengeTheme.spacing.md};
  overflow-x: auto;
  padding-bottom: ${foodChallengeTheme.spacing.md};
  height: 200px;
  align-items: flex-end;
`;

const BarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${foodChallengeTheme.spacing.sm};
  flex: 0 0 auto;
  min-width: 40px;
`;

const Bar = styled.div<{ height: number }>`
  width: 30px;
  height: ${(props) => props.height}px;
  background: linear-gradient(
    180deg,
    ${foodChallengeTheme.colors.primary},
    ${foodChallengeTheme.colors.secondary}
  );
  border-radius: ${foodChallengeTheme.borderRadius.md};
  transition: all 0.3s ease;
  position: relative;

  &:hover::after {
    content: attr(data-value);
    position: absolute;
    bottom: 105%;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${foodChallengeTheme.colors.primary};
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
  }
`;

const BarLabel = styled.div`
  font-size: 0.75rem;
  color: ${foodChallengeTheme.colors.textSecondary};
  text-align: center;
  white-space: nowrap;
  max-width: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface Props {
  isOpen: boolean;
  tracker: SimpleTracker | null;
  onClose: () => void;
}

export const TrackerDetailsModal: React.FC<Props> = ({
  isOpen,
  tracker,
  onClose,
}) => {
  const [searchFood, setSearchFood] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [sortDesc, setSortDesc] = useState(true);

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    if (!tracker) return [];

    let filtered = [...(tracker.consumptionLogs || [])];

    // Apply text filters
    if (searchFood.trim()) {
      const query = searchFood.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.notes?.toLowerCase().includes(query) ||
          log.id?.toLowerCase().includes(query),
      );
    }

    if (searchDate.trim()) {
      filtered = filtered.filter((log) => log.consumedAt?.includes(searchDate));
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const aVal = new Date(a.consumedAt || 0).getTime();
        const bVal = new Date(b.consumedAt || 0).getTime();
        return sortDesc ? bVal - aVal : aVal - bVal;
      } else if (sortBy === 'amount') {
        const aVal = a.quantity || 0;
        const bVal = b.quantity || 0;
        return sortDesc ? bVal - aVal : aVal - bVal;
      } else {
        const aVal = a.notes?.toLowerCase() || '';
        const bVal = b.notes?.toLowerCase() || '';
        return sortDesc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
    });

    return filtered;
  }, [tracker, searchFood, searchDate, sortBy, sortDesc]);

  // Calculate daily progress
  const dailyProgress = useMemo(() => {
    if (!tracker) return {};

    const progress: Record<string, number> = {};

    (tracker.consumptionLogs || []).forEach((log) => {
      if (log.consumedAt) {
        const date = log.consumedAt.split('T')[0];
        progress[date] = (progress[date] || 0) + log.quantity;
      }
    });

    return progress;
  }, [tracker]);

  const handleSortClick = (column: 'date' | 'amount' | 'name') => {
    if (sortBy === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(column);
      setSortDesc(true);
    }
  };

  if (!isOpen || !tracker) return null;

  const totalDays = Object.keys(dailyProgress).length;
  const averagePerDay =
    totalDays > 0 ? (tracker.totalConsumed / totalDays).toFixed(2) : '0.00';

  return (
    <Backdrop onClick={onClose}>
      <ModalWrapper onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{tracker.name} - Details</ModalTitle>
            <CloseButton onClick={onClose}>✕</CloseButton>
          </ModalHeader>

          {/* Progress Section */}
          <ProgressSection>
            <ProgressLabel>
              <span>Progress</span>
              <span>
                {tracker.totalConsumed.toFixed(1)} / {tracker.goal} units (
                {tracker.progressPercentage.toFixed(1)}%)
              </span>
            </ProgressLabel>
            <ProgressBarContainer>
              <ProgressBar percentage={tracker.progressPercentage}>
                {tracker.progressPercentage > 10 &&
                  `${tracker.progressPercentage.toFixed(0)}%`}
              </ProgressBar>
            </ProgressBarContainer>
          </ProgressSection>

          {/* Stats Grid */}
          <StatsGrid>
            <StatCard>
              <StatLabel>Total Consumed</StatLabel>
              <StatValue>{tracker.totalConsumed.toFixed(2)}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Goal</StatLabel>
              <StatValue>{tracker.goal}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Days Tracked</StatLabel>
              <StatValue>{totalDays}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Avg per Day</StatLabel>
              <StatValue>{averagePerDay}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Items Logged</StatLabel>
              <StatValue>{tracker.consumptionLogs?.length || 0}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Remaining</StatLabel>
              <StatValue>
                {Math.max(0, tracker.goal - tracker.totalConsumed).toFixed(2)}
              </StatValue>
            </StatCard>
          </StatsGrid>

          {/* Daily Progress Chart */}
          {totalDays > 0 && (
            <ChartSection>
              <ChartTitle>Daily Progress</ChartTitle>
              <ChartContainer>
                {Object.entries(dailyProgress)
                  .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                  .map(([date, amount]) => {
                    const maxDaily = Math.max(...Object.values(dailyProgress));
                    const heightPercentage = (amount / maxDaily) * 150; // Max height 150px
                    return (
                      <BarWrapper key={date}>
                        <Bar
                          height={heightPercentage}
                          title={`${amount.toFixed(2)} units`}
                        />
                        <BarLabel>{date.split('-')[2]}</BarLabel>
                      </BarWrapper>
                    );
                  })}
              </ChartContainer>
            </ChartSection>
          )}

          {/* Search Section */}
          <SearchSection>
            <SearchInput
              type='text'
              placeholder='Search by food item...'
              value={searchFood}
              onChange={(e) => setSearchFood(e.target.value)}
            />
            <SearchInput
              type='date'
              placeholder='Filter by date'
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
          </SearchSection>

          {/* Consumption Log Table */}
          {filteredLogs.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell onClick={() => handleSortClick('name')}>
                      Food Item
                      {sortBy === 'name' && (
                        <span>{sortDesc ? ' ↓' : ' ↑'}</span>
                      )}
                    </TableHeaderCell>
                    <TableHeaderCell onClick={() => handleSortClick('amount')}>
                      Amount
                      {sortBy === 'amount' && (
                        <span>{sortDesc ? ' ↓' : ' ↑'}</span>
                      )}
                    </TableHeaderCell>
                    <TableHeaderCell onClick={() => handleSortClick('date')}>
                      Date & Time
                      {sortBy === 'date' && (
                        <span>{sortDesc ? ' ↓' : ' ↑'}</span>
                      )}
                    </TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.notes || 'Unknown'}</TableCell>
                      <TableCell>{log.quantity.toFixed(2)} units</TableCell>
                      <TableCell>
                        {log.consumedAt
                          ? new Date(log.consumedAt).toLocaleString()
                          : 'No date'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <EmptyState>
              {tracker.consumptionLogs?.length === 0
                ? 'No consumption logs yet'
                : 'No logs match your search'}
            </EmptyState>
          )}
        </ModalContent>
      </ModalWrapper>
    </Backdrop>
  );
};
