import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Card, EmptyState } from './BaseComponents';
import { CreateTrackerModalSimplified } from './CreateTrackerModalSimplified';
import { TrackerCard } from './TrackerCard';
import { FoodLoggingModalSimplified } from './FoodLoggingModalSimplified';
import { TrackerDetailsModal } from './TrackerDetailsModal';
import { foodChallengeTheme } from '../../utils/foodChallengeUtils';
import {
  getUserTrackers,
  deleteTracker,
  type SimpleTracker,
} from '../../api/foodChallengeSimplified';

interface TrackerDashboardProps {}

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${foodChallengeTheme.spacing.lg};
  padding-top: 100px;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${foodChallengeTheme.spacing.xl};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${foodChallengeTheme.spacing.md};
    align-items: stretch;
  }
`;

const DashboardTitle = styled.h1`
  color: ${foodChallengeTheme.colors.textPrimary};
  font-size: ${foodChallengeTheme.typography.h1.fontSize};
  font-weight: ${foodChallengeTheme.typography.h1.fontWeight};
  margin: 0;
`;

const TrackersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${foodChallengeTheme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: ${foodChallengeTheme.colors.textSecondary};
`;

export const TrackerDashboard: React.FC<TrackerDashboardProps> = () => {
  const [trackers, setTrackers] = useState<SimpleTracker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [foodLoggingModal, setFoodLoggingModal] = useState<{
    isOpen: boolean;
    tracker: SimpleTracker | null;
  }>({
    isOpen: false,
    tracker: null,
  });
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    tracker: SimpleTracker | null;
  }>({
    isOpen: false,
    tracker: null,
  });

  const fetchTrackers = async () => {
    try {
      setIsLoading(true);
      const userTrackers = await getUserTrackers();
      setTrackers(userTrackers);
      setError(null);
    } catch (err) {
      setError('Failed to load trackers. Please try again.');
      console.error('Error fetching trackers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackers();
  }, []);

  const handleTrackerCreated = async (newTracker: SimpleTracker) => {
    // Optimistic update - add tracker immediately to UI
    setTrackers((prevTrackers) => [...prevTrackers, newTracker]);
    setIsCreateModalOpen(false);

    // Refresh to get accurate server data
    await fetchTrackers();
  };

  const handleFoodLogged = (
    trackerId: string,
    foodItemName: string,
    foodItemValue: number,
    quantity: number,
  ) => {
    // Optimistically update the specific tracker
    setTrackers((prevTrackers) =>
      prevTrackers.map((tracker) => {
        if (tracker.id === trackerId) {
          const totalValue = quantity * foodItemValue;
          const newTotalConsumed = tracker.totalConsumed + totalValue;
          const newProgressPercentage = Math.min(
            (newTotalConsumed / tracker.goal) * 100,
            100,
          );

          return {
            ...tracker,
            totalConsumed: newTotalConsumed,
            progressPercentage: newProgressPercentage,
            consumptionLogs: [
              ...(tracker.consumptionLogs as any[]),
              {
                trackerId,
                foodItemId: foodItemName,
                quantity: totalValue,
                unit: 'hot_dog_unit',
                consumedAt: new Date().toISOString(),
                notes: `${quantity} × ${foodItemName}`,
              } as any,
            ],
          };
        }
        return tracker;
      }),
    );

    // Close modal immediately (no background refresh - trust optimistic update)
    setFoodLoggingModal({ isOpen: false, tracker: null });
  };

  const handleLogFood = (trackerId: string) => {
    const tracker = trackers.find((t) => t.id === trackerId);
    if (tracker) {
      setFoodLoggingModal({ isOpen: true, tracker });
    }
  };

  const handleViewDetails = (trackerId: string) => {
    const tracker = trackers.find((t) => t.id === trackerId);
    if (tracker) {
      setDetailsModal({ isOpen: true, tracker });
    }
  };

  const handleDeleteTracker = async (
    trackerId: string,
    trackerName: string,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${trackerName}"?\n\nThis will permanently delete the tracker and all its consumption logs. This action cannot be undone.`,
    );

    if (confirmed) {
      try {
        // Optimistically remove from UI
        setTrackers((prevTrackers) =>
          prevTrackers.filter((t) => t.id !== trackerId),
        );

        await deleteTracker(trackerId);
      } catch (error) {
        console.error('Error deleting tracker:', error);
        setError('Failed to delete tracker. Please try again.');
        // Revert optimistic update by refreshing
        await fetchTrackers();
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardContainer>
        <LoadingContainer>Loading your trackers...</LoadingContainer>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <Card>
          <div
            style={{
              color: foodChallengeTheme.colors.error,
              textAlign: 'center',
            }}
          >
            {error}
            <br />
            <Button
              variant='outline'
              onClick={fetchTrackers}
              style={{ marginTop: foodChallengeTheme.spacing.md }}
            >
              Try Again
            </Button>
          </div>
        </Card>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>Food Challenge Trackers</DashboardTitle>
        <Button variant='primary' onClick={() => setIsCreateModalOpen(true)}>
          Create Tracker
        </Button>
      </DashboardHeader>

      {trackers.length === 0 ? (
        <Card>
          <EmptyState
            title='No Trackers Yet'
            description='Create your first food challenge tracker to start logging your progress toward a goal.'
            action={{
              label: 'Create Your First Tracker',
              onClick: () => setIsCreateModalOpen(true),
            }}
          />
        </Card>
      ) : (
        <TrackersGrid>
          {trackers.map((tracker) => (
            <TrackerCard
              key={tracker.id}
              tracker={tracker}
              onLogFood={handleLogFood}
              onViewDetails={handleViewDetails}
              onDelete={handleDeleteTracker}
            />
          ))}
        </TrackersGrid>
      )}

      <CreateTrackerModalSimplified
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleTrackerCreated}
      />

      {foodLoggingModal.tracker && (
        <FoodLoggingModalSimplified
          trackerId={foodLoggingModal.tracker.id}
          isOpen={foodLoggingModal.isOpen}
          onClose={() => setFoodLoggingModal({ isOpen: false, tracker: null })}
          onLogged={handleFoodLogged}
        />
      )}

      <TrackerDetailsModal
        isOpen={detailsModal.isOpen}
        tracker={detailsModal.tracker}
        onClose={() => setDetailsModal({ isOpen: false, tracker: null })}
      />
    </DashboardContainer>
  );
};
