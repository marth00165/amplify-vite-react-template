import React, { useState } from 'react';
import styled from 'styled-components';
import { AiOutlineInfo } from 'react-icons/ai';
import { RxCross2 } from 'react-icons/rx';
import {
  Card,
  Button,
  ProgressBar,
  EmptyState,
  StatusBadge,
  VisibilityBadge,
} from '../common';
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
  onToggleVisibility?: (trackerId: string, currentVisibility: boolean) => void;
}

const StyledCard = styled(Card)`
  position: relative;
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 0 !important;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: ${foodChallengeTheme.spacing.sm};
  padding: ${foodChallengeTheme.spacing.lg};

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${foodChallengeTheme.colors.divider};
    border-radius: 2px;

    &:hover {
      background: ${foodChallengeTheme.colors.textSecondary};
    }
  }
`;

const CardFooter = styled.div`
  position: relative;
  padding: ${foodChallengeTheme.spacing.md} ${foodChallengeTheme.spacing.lg};
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid ${foodChallengeTheme.colors.border};
`;

const TrackerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${foodChallengeTheme.spacing.md};
`;

const HeaderBadges = styled.div`
  display: flex;
  gap: ${foodChallengeTheme.spacing.sm};
  align-items: center;
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

const FloatingActionBar = styled.div`
  position: fixed;
  bottom: ${foodChallengeTheme.spacing.lg};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: ${foodChallengeTheme.spacing.md};
  align-items: center;
  padding: ${foodChallengeTheme.spacing.md} ${foodChallengeTheme.spacing.lg};
  background: ${foodChallengeTheme.colors.white};
  border-radius: 28px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  z-index: 10;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @media (max-width: 480px) {
    flex-direction: column;
    bottom: ${foodChallengeTheme.spacing.md};
    left: ${foodChallengeTheme.spacing.md};
    right: ${foodChallengeTheme.spacing.md};
    transform: none;

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
`;

const InfoIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: ${foodChallengeTheme.colors.white};
  color: ${foodChallengeTheme.colors.primary};
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;

  &:hover {
    background: ${foodChallengeTheme.colors.primary};
    color: ${foodChallengeTheme.colors.white};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: ${foodChallengeTheme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  margin-left: ${foodChallengeTheme.spacing.sm};

  &:hover {
    background: ${foodChallengeTheme.colors.primary};
    color: ${foodChallengeTheme.colors.white};
    transform: scale(1.15);
  }

  &:active {
    transform: scale(0.9);
  }
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

const RecentActivity = styled.div`
  margin-top: ${foodChallengeTheme.spacing.md};
  padding-top: ${foodChallengeTheme.spacing.md};
  border-top: 1px solid ${foodChallengeTheme.colors.divider};
`;

const CompactButton = styled(Button)`
  padding: 6px 14px !important;
  border-radius: 20px !important;
  font-size: 0.85rem !important;
  font-weight: 600;
  flex: 1;
  min-height: auto;
  white-space: nowrap;
  border: 2px solid !important;

  &:focus {
    outline: none;
    box-shadow: none !important;
  }

  /* Ensure outline buttons show white text on hover */
  &:hover:not(:disabled) {
    color: white !important;
  }

  /* Ensure delete button background and text are correct on hover */
  &[style*='borderColor: #e30500'] {
    &:hover:not(:disabled) {
      background: #e30500 !important;
      color: white !important;
    }
  }

  @media (max-width: 480px) {
    flex: auto;
  }
`;

const ActivityHeader = styled.h3`
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
  onToggleVisibility,
}) => {
  const [showActions, setShowActions] = useState(false);
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
      <CardContent>
        <TrackerHeader>
          <TrackerName>{tracker.name}</TrackerName>
          <HeaderBadges>
            {onToggleVisibility && (
              <VisibilityBadge
                isPublic={tracker.isPublic}
                onClick={() =>
                  onToggleVisibility(tracker.id, tracker.isPublic || false)
                }
              />
            )}
            <StatusBadge status={status} />
          </HeaderBadges>
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
              {tracker.endDate
                ? `- ${formatDate(tracker.endDate)}`
                : '- Ongoing'}
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
                    {log.consumedAt
                      ? formatDateTime(log.consumedAt)
                      : 'No date'}{' '}
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
      </CardContent>

      <CardFooter>
        <InfoIconButton
          onClick={() => setShowActions(!showActions)}
          title={showActions ? 'Hide actions' : 'Show actions'}
        >
          <AiOutlineInfo size={20} />
        </InfoIconButton>
      </CardFooter>

      {showActions && (
        <FloatingActionBar>
          {canLogFood && (
            <CompactButton
              variant='primary'
              onClick={() => onLogFood(tracker.id)}
            >
              Log Food
            </CompactButton>
          )}
          <CompactButton
            variant='outline'
            onClick={() => onViewDetails(tracker.id)}
          >
            View Details
          </CompactButton>
          <CompactButton
            variant='outline'
            onClick={() => onDelete(tracker.id, tracker.name)}
            style={{
              color: foodChallengeTheme.colors.error,
              borderColor: foodChallengeTheme.colors.error,
            }}
          >
            Delete
          </CompactButton>
          <CloseButton
            onClick={() => setShowActions(false)}
            title='Close actions'
          >
            <RxCross2 size={18} />
          </CloseButton>
        </FloatingActionBar>
      )}
    </StyledCard>
  );
};
