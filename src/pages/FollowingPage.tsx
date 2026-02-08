import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { foodChallengeTheme } from '../utils/foodChallengeUtils';
import { TrackerCard } from '../components/food-challenge/TrackerCard';
import { TrackerDetailsModal } from '../components/food-challenge/TrackerDetailsModal';
import {
  getFollowedTrackers,
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
  color: ${foodChallengeTheme.colors.textPrimary};
  font-size: ${foodChallengeTheme.typography.h1.fontSize};
  margin-bottom: ${foodChallengeTheme.spacing.sm};
`;

const PageDescription = styled.p`
  color: ${foodChallengeTheme.colors.textSecondary};
  font-size: 1.1rem;
`;

const TrackersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${foodChallengeTheme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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

export const FollowingPage: React.FC = () => {
  const [trackers, setTrackers] = useState<SimpleTracker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    tracker: SimpleTracker | null;
  }>({
    isOpen: false,
    tracker: null,
  });

  useEffect(() => {
    loadFollowedTrackers();
  }, []);

  const loadFollowedTrackers = async () => {
    try {
      setIsLoading(true);
      const followed = await getFollowedTrackers();
      setTrackers(followed);
    } catch (error) {
      console.error('Error loading followed trackers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (trackerId: string) => {
    const tracker = trackers.find((t) => t.id === trackerId);
    if (tracker) {
      setDetailsModal({ isOpen: true, tracker });
    }
  };

  const handleUnfollow = async (trackerId: string, trackerName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to unfollow "${trackerName}"?`,
    );

    if (confirmed) {
      try {
        // Get follow ID
        const followStatus = await isFollowingTracker(trackerId);
        if (followStatus.followId) {
          await unfollowTracker(followStatus.followId);

          // Remove from UI optimistically
          setTrackers((prev) => prev.filter((t) => t.id !== trackerId));
        }
      } catch (error) {
        console.error('Error unfollowing tracker:', error);
        alert('Failed to unfollow tracker. Please try again.');
        // Refresh to sync state
        await loadFollowedTrackers();
      }
    }
  };

  // TrackerCard expects onLogFood and onDelete handlers, but for followed trackers we don't use those
  const handleLogFood = (_trackerId: string) => {
    // Not applicable for followed trackers - they're read-only
    console.log('Cannot log food for followed trackers');
  };

  const handleDelete = (trackerId: string, trackerName: string) => {
    // For followed trackers, "delete" means unfollow
    handleUnfollow(trackerId, trackerName);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Following</PageTitle>
        <PageDescription>
          Trackers you're following from the community
        </PageDescription>
      </PageHeader>

      {isLoading ? (
        <LoadingState>Loading followed trackers...</LoadingState>
      ) : trackers.length === 0 ? (
        <EmptyState>
          You're not following any trackers yet.
          <br />
          Visit the Find Trackers page to discover public trackers!
        </EmptyState>
      ) : (
        <TrackersGrid>
          {trackers.map((tracker) => (
            <TrackerCard
              key={tracker.id}
              tracker={tracker}
              onLogFood={handleLogFood}
              onViewDetails={handleViewDetails}
              onDelete={handleDelete}
            />
          ))}
        </TrackersGrid>
      )}

      <TrackerDetailsModal
        isOpen={detailsModal.isOpen}
        tracker={detailsModal.tracker}
        onClose={() => setDetailsModal({ isOpen: false, tracker: null })}
      />
    </PageContainer>
  );
};
