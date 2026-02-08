import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  foodChallengeTheme,
  formatPercentage,
} from '../utils/foodChallengeUtils';
import {
  getTrackerByIdPublic,
  SimpleTracker,
} from '../api/foodChallengeSimplified';
import { ProgressBar } from '../components/common';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${foodChallengeTheme.colors.background};
  padding: ${foodChallengeTheme.spacing.lg};
`;

const PageContent = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: ${foodChallengeTheme.colors.white};
  border: 1px solid ${foodChallengeTheme.colors.border};
  border-radius: ${foodChallengeTheme.borderRadius.lg};
  padding: ${foodChallengeTheme.spacing.xl};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${foodChallengeTheme.spacing.lg};
  padding-bottom: ${foodChallengeTheme.spacing.md};
  border-bottom: 2px solid ${foodChallengeTheme.colors.secondary};
`;

const PageTitle = styled.h1`
  margin: 0;
  color: ${foodChallengeTheme.colors.primary};
  font-size: ${foodChallengeTheme.typography.h1.fontSize};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${foodChallengeTheme.colors.primary};
  cursor: pointer;
  font-size: 1.5rem;
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

const LoadingContainer = styled.div`
  text-align: center;
  padding: ${foodChallengeTheme.spacing.xl};
  color: ${foodChallengeTheme.colors.textSecondary};
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${foodChallengeTheme.spacing.xl};
  color: ${foodChallengeTheme.colors.error};
  background: #fff0f0;
  border-radius: ${foodChallengeTheme.borderRadius.md};
  border: 1px solid ${foodChallengeTheme.colors.error};
`;

const ProgressSection = styled.div`
  margin-bottom: ${foodChallengeTheme.spacing.xl};
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${foodChallengeTheme.spacing.sm};
  font-weight: bold;
  color: ${foodChallengeTheme.colors.textPrimary};
`;

const ProgressValue = styled.span`
  color: ${foodChallengeTheme.colors.primary};
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

const ActivitySection = styled.div`
  margin-top: ${foodChallengeTheme.spacing.lg};
`;

const ActivityTitle = styled.h2`
  color: ${foodChallengeTheme.colors.textPrimary};
  font-size: ${foodChallengeTheme.typography.h3.fontSize};
  margin: 0 0 ${foodChallengeTheme.spacing.md} 0;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${foodChallengeTheme.spacing.md};
`;

const ActivityItem = styled.div`
  background: ${foodChallengeTheme.colors.background};
  padding: ${foodChallengeTheme.spacing.md};
  border-radius: ${foodChallengeTheme.borderRadius.md};
  border-left: 4px solid ${foodChallengeTheme.colors.primary};
`;

const ActivityTime = styled.div`
  font-size: 0.85rem;
  color: ${foodChallengeTheme.colors.textSecondary};
  margin-bottom: ${foodChallengeTheme.spacing.xs};
`;

const ActivityQuantity = styled.div`
  color: ${foodChallengeTheme.colors.textPrimary};
  font-weight: 600;
`;

const EmptyStateMessage = styled.div`
  text-align: center;
  padding: ${foodChallengeTheme.spacing.lg};
  color: ${foodChallengeTheme.colors.textSecondary};
  font-style: italic;
`;

export const TrackerPublicPage: React.FC = () => {
  const { trackerId } = useParams<{ trackerId: string }>();
  const navigate = useNavigate();
  const [tracker, setTracker] = useState<SimpleTracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTracker = async () => {
      if (!trackerId) {
        setError('Invalid tracker ID');
        setLoading(false);
        return;
      }

      try {
        const trackerData = await getTrackerByIdPublic(trackerId);
        if (!trackerData) {
          setError('Tracker not found');
        } else if (!trackerData.isPublic) {
          setError('This tracker is not public');
        } else {
          setTracker(trackerData);
        }
      } catch (err) {
        setError('Failed to load tracker');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTracker();
  }, [trackerId]);

  if (loading) {
    return (
      <PageContainer>
        <PageContent>
          <LoadingContainer>Loading tracker...</LoadingContainer>
        </PageContent>
      </PageContainer>
    );
  }

  if (error || !tracker) {
    return (
      <PageContainer>
        <PageContent>
          <PageHeader>
            <PageTitle>Tracker</PageTitle>
            <BackButton onClick={() => navigate('/foodChallenge')}>
              ←
            </BackButton>
          </PageHeader>
          <ErrorContainer>{error || 'Tracker not found'}</ErrorContainer>
        </PageContent>
      </PageContainer>
    );
  }

  const currentUnits = tracker.totalConsumed;
  const isGoalMet = currentUnits >= tracker.goal;

  const recentLogs = tracker.consumptionLogs
    .sort(
      (
        a: SimpleTracker['consumptionLogs'][number],
        b: SimpleTracker['consumptionLogs'][number],
      ) =>
        new Date(b.consumedAt || new Date()).getTime() -
        new Date(a.consumedAt || new Date()).getTime(),
    )
    .slice(0, 10);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year:
        new Date(dateString).getFullYear() !== new Date().getFullYear()
          ? 'numeric'
          : undefined,
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <PageContainer>
      <PageContent>
        <PageHeader>
          <PageTitle>{tracker.name}</PageTitle>
          <BackButton onClick={() => navigate(-1)}>←</BackButton>
        </PageHeader>

        <ProgressSection>
          <ProgressLabel>
            <span>Progress</span>
            <ProgressValue>
              {currentUnits.toFixed(1)} / {tracker.goal} hot_dog_unit
            </ProgressValue>
          </ProgressLabel>
          <ProgressBar
            percentage={Math.min(tracker.progressPercentage, 100)}
            color={
              isGoalMet
                ? foodChallengeTheme.colors.secondary
                : foodChallengeTheme.colors.primary
            }
          />
          <div
            style={{
              textAlign: 'center',
              marginTop: foodChallengeTheme.spacing.sm,
              fontSize: foodChallengeTheme.typography.caption.fontSize,
              color: foodChallengeTheme.colors.textSecondary,
              fontWeight: 600,
            }}
          >
            {formatPercentage(tracker.progressPercentage)} Complete
          </div>
        </ProgressSection>

        <StatsGrid>
          <StatCard>
            <StatLabel>Status</StatLabel>
            <StatValue>{isGoalMet ? '✓ Completed' : 'In Progress'}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Start Date</StatLabel>
            <StatValue style={{ fontSize: '1rem' }}>
              {formatDate(tracker.startDate)}
            </StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Goal</StatLabel>
            <StatValue>{tracker.goal}</StatValue>
          </StatCard>
          {tracker.endDate && (
            <StatCard>
              <StatLabel>End Date</StatLabel>
              <StatValue style={{ fontSize: '1rem' }}>
                {formatDate(tracker.endDate)}
              </StatValue>
            </StatCard>
          )}
        </StatsGrid>

        {tracker.consumptionLogs.length > 0 ? (
          <ActivitySection>
            <ActivityTitle>Recent Activity</ActivityTitle>
            <ActivityList>
              {recentLogs.map(
                (log: SimpleTracker['consumptionLogs'][number]) => (
                  <ActivityItem key={log.id}>
                    <ActivityTime>
                      {log.consumedAt
                        ? formatDateTime(log.consumedAt)
                        : 'No date'}
                    </ActivityTime>
                    <ActivityQuantity>
                      {log.quantity.toFixed(2)} hot_dog_units
                    </ActivityQuantity>
                    {log.notes && (
                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        {log.notes}
                      </div>
                    )}
                  </ActivityItem>
                ),
              )}
              {tracker.consumptionLogs.length > 10 && (
                <EmptyStateMessage>
                  +{tracker.consumptionLogs.length - 10} more entries
                </EmptyStateMessage>
              )}
            </ActivityList>
          </ActivitySection>
        ) : (
          <EmptyStateMessage>No food logged yet</EmptyStateMessage>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default TrackerPublicPage;
