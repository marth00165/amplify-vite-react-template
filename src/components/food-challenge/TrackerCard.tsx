import React from 'react';
import styled from 'styled-components';
import { Card, Button, ProgressBar, EmptyState } from './BaseComponents';
import {
  foodChallengeTheme,
  formatPercentage,
} from '../../utils/foodChallengeUtils';
import type { SimpleTracker } from '../../api/foodChallengeSimplified';

interface TrackerCardProps {
  tracker: SimpleTracker;
  onLogFood: (trackerId: string) => void;
  onViewDetails: (trackerId: string) => void;
  onDelete: (trackerId: string, trackerName: string) => void;
}

const StyledCard = styled(Card)`
  position: relative;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const TrackerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${foodChallengeTheme.spacing.md};
`;

const TrackerName = styled.h3`
  margin: 0;
  color: ${foodChallengeTheme.colors.textPrimary};
  font-size: ${foodChallengeTheme.typography.h3.fontSize};
  font-weight: ${foodChallengeTheme.typography.h3.fontWeight};
  line-height: 1.3;
  flex: 1;
  margin-right: ${foodChallengeTheme.spacing.md};
`;

const StatusBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => !['status'].includes(prop),
})<{ status: 'active' | 'completed' | 'expired' }>`
  padding: ${foodChallengeTheme.spacing.sm} ${foodChallengeTheme.spacing.md};
  border-radius: ${foodChallengeTheme.borderRadius.sm};
  font-size: ${foodChallengeTheme.typography.caption.fontSize};
  font-weight: 600;
  text-transform: uppercase;

  ${(props) => {
    switch (props.status) {
      case 'active':
        return `
          background: ${foodChallengeTheme.colors.primaryLight};
          color: ${foodChallengeTheme.colors.primary};
        `;
      case 'completed':
        return `
          background: ${foodChallengeTheme.colors.secondaryLight};
          color: ${foodChallengeTheme.colors.secondary};
        `;
      case 'expired':
        return `
          background: ${foodChallengeTheme.colors.errorLight};
          color: ${foodChallengeTheme.colors.error};
        `;
      default:
        return '';
    }
  }}
`;

const TrackerInfo = styled.div`
  margin-bottom: ${foodChallengeTheme.spacing.md};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${foodChallengeTheme.spacing.sm};

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: ${foodChallengeTheme.colors.textSecondary};
  font-size: ${foodChallengeTheme.typography.body.fontSize};
`;

const InfoValue = styled.span`
  color: ${foodChallengeTheme.colors.textPrimary};
  font-weight: 600;
  font-size: ${foodChallengeTheme.typography.body.fontSize};
`;

const ProgressSection = styled.div`
  margin-bottom: ${foodChallengeTheme.spacing.md};
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${foodChallengeTheme.spacing.sm};
`;

const ProgressText = styled.span`
  color: ${foodChallengeTheme.colors.textSecondary};
  font-size: ${foodChallengeTheme.typography.body.fontSize};
`;

const ProgressValue = styled.span.withConfig({
  shouldForwardProp: (prop) => !['isGoalMet'].includes(prop),
})<{ isGoalMet?: boolean }>`
  font-weight: 600;
  font-size: ${foodChallengeTheme.typography.body.fontSize};
  color: ${(props) =>
    props.isGoalMet
      ? foodChallengeTheme.colors.secondary
      : foodChallengeTheme.colors.textPrimary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${foodChallengeTheme.spacing.sm};
  margin-top: ${foodChallengeTheme.spacing.md};

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const RecentActivity = styled.div`
  margin-top: ${foodChallengeTheme.spacing.md};
  padding-top: ${foodChallengeTheme.spacing.md};
  border-top: 1px solid ${foodChallengeTheme.colors.border};
`;

const ActivityHeader = styled.h4`
  margin: 0 0 ${foodChallengeTheme.spacing.sm} 0;
  color: ${foodChallengeTheme.colors.textSecondary};
  font-size: ${foodChallengeTheme.typography.caption.fontSize};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActivityLog = styled.div`
  font-size: ${foodChallengeTheme.typography.caption.fontSize};
  color: ${foodChallengeTheme.colors.textSecondary};
  line-height: 1.4;
`;

export const TrackerCard: React.FC<TrackerCardProps> = ({
  tracker,
  onLogFood,
  onViewDetails,
  onDelete,
}) => {
  const currentUnits = tracker.totalConsumed;
  const progressPercentage = tracker.progressPercentage;
  const isGoalMet = currentUnits >= tracker.goal;

  const getStatus = (): 'active' | 'completed' | 'expired' => {
    if (isGoalMet) return 'completed';

    const now = new Date();
    if (!tracker.endDate) return 'active'; // No end date means always active
    const end = new Date(tracker.endDate);

    if (now > end) return 'expired';
    return 'active';
  };

  const status = getStatus();
  const canLogFood = status === 'active' && !isGoalMet;

  // Get most recent consumption logs (last 3)
  const recentLogs = tracker.consumptionLogs
    .sort(
      (a, b) =>
        new Date(b.consumedAt || new Date()).getTime() -
        new Date(a.consumedAt || new Date()).getTime(),
    )
    .slice(0, 3);

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
    <StyledCard>
      <TrackerHeader>
        <TrackerName>{tracker.name}</TrackerName>
        <StatusBadge status={status}>{status}</StatusBadge>
      </TrackerHeader>

      <TrackerInfo>
        <InfoRow>
          <InfoLabel>Dataset:</InfoLabel>
          <InfoValue>Hot Dog Challenge</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Duration:</InfoLabel>
          <InfoValue>
            {formatDate(tracker.startDate)}{' '}
            {tracker.endDate ? `- ${formatDate(tracker.endDate)}` : '- Ongoing'}
          </InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Base Unit:</InfoLabel>
          <InfoValue>hot_dog_unit</InfoValue>
        </InfoRow>
      </TrackerInfo>

      <ProgressSection>
        <ProgressLabel>
          <ProgressText>Progress</ProgressText>
          <ProgressValue isGoalMet={isGoalMet}>
            {currentUnits.toFixed(1)} / {tracker.goal} hot_dog_unit
          </ProgressValue>
        </ProgressLabel>
        <ProgressBar
          percentage={Math.min(progressPercentage, 100)}
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
          {formatPercentage(progressPercentage)} Complete
        </div>
      </ProgressSection>

      {tracker.consumptionLogs.length > 0 ? (
        <RecentActivity>
          <ActivityHeader>Recent Activity</ActivityHeader>
          <ActivityLog>
            {recentLogs.map((log, index) => (
              <div
                key={log.id}
                style={{
                  marginBottom: index < recentLogs.length - 1 ? '8px' : '0',
                }}
              >
                <div>
                  {log.notes || `${log.quantity.toFixed(1)} hot_dog_units`}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: foodChallengeTheme.colors.textSecondary,
                  }}
                >
                  {log.consumedAt ? formatDateTime(log.consumedAt) : 'No date'}{' '}
                  • {log.quantity.toFixed(2)} hot_dog_units
                </div>
              </div>
            ))}
            {tracker.consumptionLogs.length > 3 && (
              <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                +{tracker.consumptionLogs.length - 3} more entries
              </div>
            )}
          </ActivityLog>
        </RecentActivity>
      ) : (
        <EmptyState
          title='No food logged yet'
          description='Start logging food to track your progress'
        />
      )}

      <ActionButtons>
        {canLogFood && (
          <Button variant='primary' onClick={() => onLogFood(tracker.id)}>
            Log Food
          </Button>
        )}
        <Button variant='outline' onClick={() => onViewDetails(tracker.id)}>
          View Details
        </Button>
        <Button
          variant='outline'
          onClick={() => onDelete(tracker.id, tracker.name)}
          style={{
            color: foodChallengeTheme.colors.error,
            borderColor: foodChallengeTheme.colors.error,
          }}
        >
          Delete
        </Button>
      </ActionButtons>
    </StyledCard>
  );
};
