import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  Goal,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  toggleGoalCompletion,
} from '../../api/goals';
import GoalItem from './goalItem';
import GoalDetailModal from './goalDetailModal';
import { Button } from '../themed-components';

const GoalsSectionContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const GoalsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const GoalsList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 1rem;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const AddGoalButton = styled(Button)`
  margin-top: auto;
  width: 100%;
`;

interface GoalsSectionProps {
  userId: string;
}

export default function GoalsSection({ userId }: GoalsSectionProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const fetchGoals = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const goalsData = await getGoals(userId);
      // Transform the data to ensure compatibility with Goal[] type
      const transformedGoals = Array.isArray(goalsData)
        ? goalsData.map((goal) => {
            // Extract everything except subtasks
            const { subtasks, ...rest } = goal;
            return {
              ...rest,
              // Convert null description to undefined
              description:
                goal.description === null ? undefined : goal.description,
              // Convert null completionDate to undefined
              completionDate:
                goal.completionDate === null ? undefined : goal.completionDate,
              // Ensure subtasks is an array
              subtasks: Array.isArray(goal.subtasks) ? goal.subtasks : [],
            };
          })
        : [];
      setGoals(transformedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleAddGoal = () => {
    setSelectedGoal(null);
    setShowModal(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowModal(true);
  };

  const handleSaveGoal = async (goalData: Partial<Goal>) => {
    try {
      // Filter out empty subtasks
      const validSubtasks =
        goalData.subtasks?.filter((st) => st.name.trim() !== '') || [];

      if (goalData.id) {
        // Update existing goal
        await updateGoal(goalData.id, {
          title: goalData.title,
          description: goalData.description,
          completionDate: goalData.completionDate,
          isCompleted: goalData.isCompleted,
        });

        // Handle subtasks separately (more complex, would need additional API calls)
      } else {
        // Create new goal
        await createGoal(
          userId,
          goalData.title!,
          goalData.description,
          goalData.completionDate,
          validSubtasks
        );
      }

      // Refresh the goals list
      await fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save goal. Please try again.');
    }
  };

  const handleToggleGoal = async (id: string, currentStatus: boolean) => {
    try {
      await toggleGoalCompletion(id, currentStatus);
      setGoals(
        goals.map((goal) =>
          goal.id === id ? { ...goal, isCompleted: !currentStatus } : goal
        )
      );
    } catch (error) {
      console.error('Error toggling goal status:', error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    const confirm = window.confirm(
      'Are you sure you want to delete this goal?'
    );
    if (!confirm) return;

    try {
      await deleteGoal(id);
      setGoals(goals.filter((goal) => goal.id !== id));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  return (
    <GoalsSectionContainer>
      <GoalsHeader>
        <h2>Goals</h2>
      </GoalsHeader>

      <GoalsList>
        {isLoading && goals.length === 0 ? (
          <p>Loading goals...</p>
        ) : goals.length === 0 ? (
          <p>No goals yet. Add your first goal!</p>
        ) : (
          goals.map((goal) => (
            <GoalItem
              key={goal.id}
              goal={goal}
              onToggle={handleToggleGoal}
              onDelete={handleDeleteGoal}
              onEdit={handleEditGoal}
            />
          ))
        )}
      </GoalsList>

      <AddGoalButton onClick={handleAddGoal}>Add Goal</AddGoalButton>

      <GoalDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        goal={selectedGoal}
        onSave={handleSaveGoal}
      />
    </GoalsSectionContainer>
  );
}
