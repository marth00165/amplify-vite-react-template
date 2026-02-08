import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { foodChallengeTheme } from '../theme';
import {
  getPublicTrackers,
  followTracker,
  unfollowTracker,
  isFollowingTracker,
  type SimpleTracker,
} from '../api/foodChallengeSimplified';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${foodChallengeTheme.spacing.lg};
  padding-top: 100px;
`;

const PageHeader = styled.div`
  margin-bottom: ${foodChallengeTheme.spacing.xl};
`;

const PageTitle = styled.h1`
  color: ${foodChallengeTheme.colors.primary};
  margin-bottom: ${foodChallengeTheme.spacing.sm};
`;

const PageDescription = styled.p`
  color: ${foodChallengeTheme.colors.textSecondary};
  font-size: 1.1rem;
`;

const SearchSection = styled.div`
  display: flex;
  gap: ${foodChallengeTheme.spacing.md};
  margin-bottom: ${foodChallengeTheme.spacing.lg};
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: ${foodChallengeTheme.spacing.md};
  border: 2px solid ${foodChallengeTheme.colors.secondary};
  border-radius: ${foodChallengeTheme.borderRadius.md};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${foodChallengeTheme.colors.primary};
  }
`;

const SortSelect = styled.select`
  padding: ${foodChallengeTheme.spacing.md};
  border: 2px solid ${foodChallengeTheme.colors.secondary};
  border-radius: ${foodChallengeTheme.borderRadius.md};
  font-size: 1rem;
  background-color: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${foodChallengeTheme.colors.primary};
  }
`;

const TrackerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${foodChallengeTheme.spacing.md};
`;

const TrackerCard = styled.div`
  background: white;
  border: 2px solid ${foodChallengeTheme.colors.secondary};
  border-radius: ${foodChallengeTheme.borderRadius.lg};
  padding: ${foodChallengeTheme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${foodChallengeTheme.spacing.lg};
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TrackerInfo = styled.div`
  flex: 1;
`;

const TrackerName = styled.h3`
  color: ${foodChallengeTheme.colors.primary};
  margin: 0 0 ${foodChallengeTheme.spacing.sm} 0;
`;

const TrackerStats = styled.div`
  display: flex;
  gap: ${foodChallengeTheme.spacing.lg};
  flex-wrap: wrap;
  margin-top: ${foodChallengeTheme.spacing.sm};
`;

const Stat = styled.div`
  font-size: 0.9rem;
  color: ${foodChallengeTheme.colors.text};

  strong {
    color: ${foodChallengeTheme.colors.primary};
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: ${foodChallengeTheme.spacing.sm};
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${(props) => props.percentage}%;
  background: linear-gradient(
    90deg,
    ${foodChallengeTheme.colors.primary},
    ${foodChallengeTheme.colors.secondary}
  );
  transition: width 0.3s ease;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${foodChallengeTheme.spacing.sm};
  align-items: center;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${foodChallengeTheme.spacing.sm} ${foodChallengeTheme.spacing.md};
  border: none;
  border-radius: ${foodChallengeTheme.borderRadius.md};
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  background-color: ${(props) =>
    props.variant === 'secondary'
      ? '#e0e0e0'
      : foodChallengeTheme.colors.primary};
  color: ${(props) => (props.variant === 'secondary' ? '#333' : 'white')};
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${foodChallengeTheme.spacing.xxl};
  color: ${foodChallengeTheme.colors.textSecondary};
  font-size: 1.1rem;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${foodChallengeTheme.spacing.xxl};
  color: ${foodChallengeTheme.colors.textSecondary};
`;

export const FindTrackers: React.FC = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [trackers, setTrackers] = useState<SimpleTracker[]>([]);
  const [filteredTrackers, setFilteredTrackers] = useState<SimpleTracker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'progress' | 'goal' | 'timeRemaining'>(
    'progress',
  );
  const [isLoading, setIsLoading] = useState(true);
  const [followStates, setFollowStates] = useState<
    Record<string, { isFollowing: boolean; followId?: string }>
  >({});
  const [followingInProgress, setFollowingInProgress] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    loadTrackers();
  }, [sortBy]);

  useEffect(() => {
    filterTrackers();
  }, [searchQuery, trackers]);

  useEffect(() => {
    if (user && trackers.length > 0) {
      checkFollowStates();
    }
  }, [user, trackers]);

  const loadTrackers = async () => {
    try {
      setIsLoading(true);
      const publicTrackers = await getPublicTrackers({ sortBy });
      setTrackers(publicTrackers);
      setFilteredTrackers(publicTrackers);
    } catch (error) {
      console.error('Error loading public trackers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFollowStates = async () => {
    const states: Record<string, { isFollowing: boolean; followId?: string }> =
      {};

    await Promise.all(
      trackers.map(async (tracker) => {
        const status = await isFollowingTracker(tracker.id);
        states[tracker.id] = status;
      }),
    );

    setFollowStates(states);
  };

  const filterTrackers = () => {
    if (!searchQuery.trim()) {
      setFilteredTrackers(trackers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = trackers.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        (t as any).owner?.toLowerCase().includes(query),
    );
    setFilteredTrackers(filtered);
  };

  const handleFollow = async (trackerId: string) => {
    if (!user) {
      alert('Please sign in to follow trackers');
      return;
    }

    setFollowingInProgress((prev) => new Set(prev).add(trackerId));

    try {
      await followTracker(trackerId);
      setFollowStates((prev) => ({
        ...prev,
        [trackerId]: { isFollowing: true },
      }));
    } catch (error) {
      console.error('Error following tracker:', error);
      alert('Failed to follow tracker');
    } finally {
      setFollowingInProgress((prev) => {
        const next = new Set(prev);
        next.delete(trackerId);
        return next;
      });
    }
  };

  const handleUnfollow = async (trackerId: string) => {
    const followId = followStates[trackerId]?.followId;
    if (!followId) return;

    setFollowingInProgress((prev) => new Set(prev).add(trackerId));

    try {
      await unfollowTracker(followId);
      setFollowStates((prev) => ({
        ...prev,
        [trackerId]: { isFollowing: false },
      }));
    } catch (error) {
      console.error('Error unfollowing tracker:', error);
      alert('Failed to unfollow tracker');
    } finally {
      setFollowingInProgress((prev) => {
        const next = new Set(prev);
        next.delete(trackerId);
        return next;
      });
    }
  };

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return 'No end date';
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff < 0) return 'Completed';
    if (diff === 0) return 'Today';
    return `${diff} day${diff !== 1 ? 's' : ''} left`;
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Find Trackers</PageTitle>
        <PageDescription>
          Discover and follow public food challenge trackers from the community
        </PageDescription>
      </PageHeader>

      <SearchSection>
        <SearchInput
          type='text'
          placeholder='Search by tracker name or owner...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <SortSelect
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value='progress'>Sort by Progress</option>
          <option value='goal'>Sort by Goal</option>
          <option value='timeRemaining'>Sort by Time Remaining</option>
        </SortSelect>
      </SearchSection>

      {isLoading ? (
        <LoadingState>Loading public trackers...</LoadingState>
      ) : filteredTrackers.length === 0 ? (
        <EmptyState>
          {searchQuery
            ? 'No trackers match your search'
            : 'No public trackers available'}
        </EmptyState>
      ) : (
        <TrackerList>
          {filteredTrackers.map((tracker) => (
            <TrackerCard key={tracker.id}>
              <TrackerInfo>
                <TrackerName>{tracker.name}</TrackerName>
                <TrackerStats>
                  <Stat>
                    <strong>Progress:</strong>{' '}
                    {tracker.progressPercentage.toFixed(1)}%
                  </Stat>
                  <Stat>
                    <strong>Goal:</strong> {tracker.goal} units
                  </Stat>
                  <Stat>
                    <strong>Consumed:</strong>{' '}
                    {tracker.totalConsumed.toFixed(1)} units
                  </Stat>
                  <Stat>
                    <strong>{getDaysRemaining(tracker.endDate)}</strong>
                  </Stat>
                </TrackerStats>
                <ProgressBar>
                  <ProgressFill percentage={tracker.progressPercentage} />
                </ProgressBar>
              </TrackerInfo>
              <ActionButtons>
                {user ? (
                  followStates[tracker.id]?.isFollowing ? (
                    <Button
                      variant='secondary'
                      onClick={() => handleUnfollow(tracker.id)}
                      disabled={followingInProgress.has(tracker.id)}
                    >
                      {followingInProgress.has(tracker.id)
                        ? 'Unfollowing...'
                        : 'Unfollow'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleFollow(tracker.id)}
                      disabled={followingInProgress.has(tracker.id)}
                    >
                      {followingInProgress.has(tracker.id)
                        ? 'Following...'
                        : 'Follow'}
                    </Button>
                  )
                ) : (
                  <Button
                    onClick={() => alert('Please sign in to follow trackers')}
                  >
                    Sign in to Follow
                  </Button>
                )}
              </ActionButtons>
            </TrackerCard>
          ))}
        </TrackerList>
      )}
    </PageContainer>
  );
};
