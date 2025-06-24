import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export interface Subtask {
  id: string;
  name: string;
  isCompleted: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  completionDate?: string | undefined;
  subtasks?: Subtask[];
  isCompleted: boolean;
}

export async function createGoal(
  userId: string,
  title: string,
  description?: string,
  completionDate?: string | undefined,
  subtasks: Subtask[] = []
) {
  
  // If Goal model doesn't exist, show an error
  if (!client.models || !client.models.Goal) {
    console.error('Goal model not available! Available models:', Object.keys(client.models || {}));
    throw new Error('Goal model not available. Backend may need to be deployed.');
  }
  
  // Don't use "none" for undefined values, just pass null
  const finalCompletionDate = completionDate || null;

  try {
    // First create the goal without subtasks
    const newGoal = await client.models.Goal.create({
      userId,
      title,
      description,
      completionDate: finalCompletionDate,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    });
    
    
    // Then create any subtasks
    if (subtasks.length > 0 && newGoal.data) {
      
      for (const subtask of subtasks) {
        // Skip empty subtask names
        if (!subtask.name.trim()) continue;
        
        await client.models.Subtask.create({
          name: subtask.name,
          isCompleted: subtask.isCompleted,
          goalSubtasksId: newGoal.data.id,
        });
      }
    }
    
    return newGoal;
  } catch (error) {
    console.error('Error in createGoal:', error);
    throw error;
  }
}

// Add function to create a subtask
export async function addSubtask(goalId: string, name: string) {
  return await client.models.Subtask.create({
    name,
    isCompleted: false,
    goalSubtasksId: goalId,
  });
}

// Add function to update a subtask
export async function updateSubtask(id: string, data: { name?: string; isCompleted?: boolean }) {
  return await client.models.Subtask.update({
    id,
    ...data,
  });
}

// Add function to delete a subtask
export async function deleteSubtask(id: string) {
  return await client.models.Subtask.delete({ id });
}

// Update getGoals to include subtasks
export async function getGoals(userId: string) {
  try {
    const goals = await client.models.Goal.list({
      filter: { userId: { eq: userId } },
      // Fix the selection set format to use nested object notation
      selectionSet: [
        'id', 
        'title', 
        'description', 
        'completionDate', 
        'isCompleted', 
        'createdAt',
        'subtasks.*',
      ]
    });
    
    
    // Transform the data to match your Goal interface
    const transformedGoals = goals.data.map(goal => {
      return {
        ...goal,
        subtasks: goal.subtasks|| []
      };
    });
    
    return transformedGoals;
  } catch (error) {
    console.error('Error in getGoals:', error);
    throw error;
  }
}

// Update updateGoal if needed for other changes
export async function updateGoal(
  id: string,
  data: {
    title?: string;
    description?: string;
    completionDate?: string | undefined;
    isCompleted?: boolean;
  }
) {
  return await client.models.Goal.update({
    id,
    ...data,
  });
}

export async function deleteGoal(id: string) {
  return await client.models.Goal.delete({ id });
}

export async function toggleGoalCompletion(id: string, currentStatus: boolean) {
  return await client.models.Goal.update({
    id,
    isCompleted: !currentStatus,
  });
}