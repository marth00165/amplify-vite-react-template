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
}): Promise<FoodTracker | null> => {
  try {
    const response = await client.models.FoodTracker.create({
      name: trackerData.name,
      goal: trackerData.goal,
      startDate: trackerData.startDate,
      endDate: trackerData.endDate || '',
      datasetId: 'hotdog', // Static value since we load from JSON
      isActive: true,
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
