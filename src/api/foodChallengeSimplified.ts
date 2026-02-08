import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// Simplified type exports
export type FoodTracker = Schema['FoodTracker']['type'];
export type ConsumptionLog = Schema['ConsumptionLog']['type'];

// Simplified tracker type for use in UI - different from FoodTracker schema
export interface SimpleTracker {
  id: string;
  name: string;
  goal: number;
  startDate: string;
  endDate?: string;
  isPublic?: boolean;
  consumptionLogs: Array<{
    id: string;
    quantity: number;
    notes?: string;
    consumedAt?: string;
  }>;
  totalConsumed: number;
  progressPercentage: number;
  createdAt: string;
}

export interface ConsumptionLogData {
  trackerId: string;
  foodItemName: string;
  foodItemValue: number;
  quantity: number;
  unit: string;
  consumedAt: string;
  notes?: string;
}

// ============ TRACKER OPERATIONS ============

export const createTracker = async (trackerData: {
  name: string;
  goal: number;
  startDate: string;
  endDate?: string;
  isPublic?: boolean;
}): Promise<FoodTracker | null> => {
  try {
    const response = await client.models.FoodTracker.create({
      name: trackerData.name,
      goal: trackerData.goal,
      startDate: trackerData.startDate,
      endDate: trackerData.endDate || '',
      datasetId: 'hotdog', // Static value since we load from JSON
      isActive: true,
      isPublic: trackerData.isPublic || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    console.error('Error creating tracker:', error);
    throw error;
  }
};

export const getUserTrackers = async (): Promise<SimpleTracker[]> => {
  try {
    console.log('=== FETCHING USER TRACKERS (SIMPLIFIED) ===');
    const response = await client.models.FoodTracker.list();
    const trackers = response.data || [];
    console.log('Found', trackers.length, 'trackers');

    // Fetch consumption logs for each tracker
    const trackersWithData = await Promise.all(
      trackers.map(async (tracker) => {
        const logsResponse = await client.models.ConsumptionLog.list({
          filter: { trackerId: { eq: tracker.id } },
        });

        const logs = logsResponse.data || [];

        // Calculate total consumed (sum of all quantity * foodItemValue)
        const totalConsumed = logs.reduce((sum, log) => {
          // The quantity field now stores the converted hot_dog_unit value
          return sum + log.quantity;
        }, 0);

        const progressPercentage =
          tracker.goal > 0
            ? Math.min((totalConsumed / tracker.goal) * 100, 100)
            : 0;

        return {
          ...tracker,
          consumptionLogs: logs,
          totalConsumed,
          progressPercentage,
        } as SimpleTracker;
      }),
    );

    console.log('=== FINISHED FETCHING TRACKERS ===');
    return trackersWithData;
  } catch (error) {
    console.error('Error fetching user trackers:', error);
    throw error;
  }
};

export const deleteTracker = async (trackerId: string): Promise<void> => {
  try {
    // First, delete all consumption logs
    const logsResponse = await client.models.ConsumptionLog.list({
      filter: { trackerId: { eq: trackerId } },
    });

    await Promise.all(
      (logsResponse.data || []).map((log) =>
        client.models.ConsumptionLog.delete({ id: log.id }),
      ),
    );

    // Then delete the tracker
    await client.models.FoodTracker.delete({ id: trackerId });
  } catch (error) {
    console.error('Error deleting tracker:', error);
    throw error;
  }
};

export const updateTrackerVisibility = async (
  trackerId: string,
  isPublic: boolean,
): Promise<boolean> => {
  try {
    const response = await client.models.FoodTracker.update({
      id: trackerId,
      isPublic: isPublic,
      updatedAt: new Date().toISOString(),
    });
    return !!response.data;
  } catch (error) {
    console.error('Error updating tracker visibility:', error);
    throw error;
  }
};

// ============ CONSUMPTION LOG OPERATIONS ============

export const createConsumptionLog = async (
  logData: ConsumptionLogData,
): Promise<ConsumptionLog | null> => {
  try {
    console.log('=== CREATING CONSUMPTION LOG ===');
    console.log('Log data:', logData);

    // Calculate the total in hot_dog_units
    const totalValue = logData.quantity * logData.foodItemValue;

    console.log(
      `${logData.quantity} × ${logData.foodItemValue} = ${totalValue} hot_dog_units`,
    );

    const response = await client.models.ConsumptionLog.create({
      trackerId: logData.trackerId,
      foodItemId: logData.foodItemName, // Store name in foodItemId field
      quantity: totalValue, // Store total converted value
      unit: 'hot_dog_unit',
      consumedAt: logData.consumedAt,
      notes: logData.notes || `${logData.quantity} × ${logData.foodItemName}`,
      createdAt: new Date().toISOString(),
    });

    console.log('Created log:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating consumption log:', error);
    throw error;
  }
};

export const deleteConsumptionLog = async (logId: string): Promise<void> => {
  try {
    await client.models.ConsumptionLog.delete({ id: logId });
  } catch (error) {
    console.error('Error deleting consumption log:', error);
    throw error;
  }
};

// ============ SOCIAL / FOLLOW OPERATIONS ============

export const followTracker = async (trackerId: string): Promise<boolean> => {
  try {
    const response = await client.models.TrackerFollow.create({
      trackerId,
      userId: '', // Will be auto-filled by Amplify owner
      createdAt: new Date().toISOString(),
    });
    return !!response.data;
  } catch (error) {
    console.error('Error following tracker:', error);
    throw error;
  }
};

export const unfollowTracker = async (followId: string): Promise<boolean> => {
  try {
    await client.models.TrackerFollow.delete({ id: followId });
    return true;
  } catch (error) {
    console.error('Error unfollowing tracker:', error);
    throw error;
  }
};

export const getFollowedTrackers = async (): Promise<SimpleTracker[]> => {
  try {
    // Get all follows for current user
    const followsResponse = await client.models.TrackerFollow.list();
    const follows = followsResponse.data || [];

    if (follows.length === 0) return [];

    // Fetch each followed tracker with its data
    const trackersWithData = await Promise.all(
      follows.map(async (follow) => {
        const trackerResponse = await client.models.FoodTracker.get({
          id: follow.trackerId,
        });

        if (!trackerResponse.data) return null;

        const tracker = trackerResponse.data;

        // Fetch consumption logs
        const logsResponse = await client.models.ConsumptionLog.list({
          filter: { trackerId: { eq: tracker.id } },
        });

        const logs = logsResponse.data || [];

        const totalConsumed = logs.reduce((sum, log) => sum + log.quantity, 0);

        const progressPercentage =
          tracker.goal > 0
            ? Math.min((totalConsumed / tracker.goal) * 100, 100)
            : 0;

        return {
          ...tracker,
          consumptionLogs: logs,
          totalConsumed,
          progressPercentage,
        } as SimpleTracker;
      }),
    );

    return trackersWithData.filter((t) => t !== null) as SimpleTracker[];
  } catch (error) {
    console.error('Error fetching followed trackers:', error);
    throw error;
  }
};

export const isFollowingTracker = async (
  trackerId: string,
): Promise<{ isFollowing: boolean; followId?: string }> => {
  try {
    const followsResponse = await client.models.TrackerFollow.list({
      filter: { trackerId: { eq: trackerId } },
    });

    const follows = followsResponse.data || [];
    const follow = follows.find((f) => f.trackerId === trackerId);

    return {
      isFollowing: !!follow,
      followId: follow?.id,
    };
  } catch (error) {
    console.error('Error checking follow status:', error);
    return { isFollowing: false };
  }
};

export const getPublicTrackers = async (params?: {
  searchQuery?: string;
  sortBy?: 'progress' | 'goal' | 'timeRemaining';
}): Promise<SimpleTracker[]> => {
  try {
    // Fetch all public trackers
    const response = await client.models.FoodTracker.list({
      filter: { isPublic: { eq: true } },
    });

    const trackers = response.data || [];

    // Fetch consumption logs for each tracker
    const trackersWithData = await Promise.all(
      trackers.map(async (tracker) => {
        const logsResponse = await client.models.ConsumptionLog.list({
          filter: { trackerId: { eq: tracker.id } },
        });

        const logs = logsResponse.data || [];

        const totalConsumed = logs.reduce((sum, log) => sum + log.quantity, 0);

        const progressPercentage =
          tracker.goal > 0
            ? Math.min((totalConsumed / tracker.goal) * 100, 100)
            : 0;

        return {
          ...tracker,
          consumptionLogs: logs,
          totalConsumed,
          progressPercentage,
        } as SimpleTracker;
      }),
    );

    // Filter by search query if provided
    let filtered = trackersWithData;
    if (params?.searchQuery) {
      const query = params.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          (t as any).owner?.toLowerCase().includes(query),
      );
    }

    // Sort by specified field
    if (params?.sortBy === 'progress') {
      filtered.sort((a, b) => b.progressPercentage - a.progressPercentage);
    } else if (params?.sortBy === 'goal') {
      filtered.sort((a, b) => b.goal - a.goal);
    } else if (params?.sortBy === 'timeRemaining') {
      filtered.sort((a, b) => {
        const aEnd = new Date(a.endDate || 0).getTime();
        const bEnd = new Date(b.endDate || 0).getTime();
        return aEnd - bEnd;
      });
    }

    return filtered;
  } catch (error) {
    console.error('Error fetching public trackers:', error);
    throw error;
  }
};

// Public version of getTrackerById that works with unauthenticated users
export const getTrackerByIdPublic = async (
  trackerId: string,
): Promise<SimpleTracker | null> => {
  try {
    // Use the public API key for unauthenticated access
    const publicClient = generateClient<Schema>({
      authMode: 'apiKey',
    });

    const response = await publicClient.models.FoodTracker.get({
      id: trackerId,
    });

    if (!response.data) {
      return null;
    }

    const tracker = response.data;

    // Fetch consumption logs for this tracker using public client
    const logsResponse = await publicClient.models.ConsumptionLog.list({
      filter: { trackerId: { eq: tracker.id } },
    });

    const logs = logsResponse.data || [];

    const totalConsumed = logs.reduce((sum, log) => sum + log.quantity, 0);

    const progressPercentage =
      tracker.goal > 0
        ? Math.min((totalConsumed / tracker.goal) * 100, 100)
        : 0;

    return {
      ...tracker,
      consumptionLogs: logs,
      totalConsumed,
      progressPercentage,
    } as SimpleTracker;
  } catch (error) {
    console.error('Error fetching tracker by ID:', error);
    return null;
  }
};

export const getTrackerById = async (
  trackerId: string,
): Promise<SimpleTracker | null> => {
  try {
    const response = await client.models.FoodTracker.get({
      id: trackerId,
    });

    if (!response.data) {
      return null;
    }

    const tracker = response.data;

    // Fetch consumption logs for this tracker
    const logsResponse = await client.models.ConsumptionLog.list({
      filter: { trackerId: { eq: tracker.id } },
    });

    const logs = logsResponse.data || [];

    const totalConsumed = logs.reduce((sum, log) => sum + log.quantity, 0);

    const progressPercentage =
      tracker.goal > 0
        ? Math.min((totalConsumed / tracker.goal) * 100, 100)
        : 0;

    return {
      ...tracker,
      consumptionLogs: logs,
      totalConsumed,
      progressPercentage,
    } as SimpleTracker;
  } catch (error) {
    console.error('Error fetching tracker by ID:', error);
    return null;
  }
};
