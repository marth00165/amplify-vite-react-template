import styled from 'styled-components';
import { Goal } from '../../api/goals';

const GoalItemContainer = styled.div<{
  isCompleted: boolean;
  isPastDue: boolean;
}>`
  padding: 0.75rem;
  border-radius: 6px;
  background: ${(props) =>
    props.isCompleted
      ? 'rgba(76, 175, 80, 0.2)'
      : props.isPastDue
      ? 'rgba(244, 67, 54, 0.2)'
      : 'rgba(255, 255, 255, 0.1)'};
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.isCompleted
        ? 'rgba(76, 175, 80, 0.3)'
        : props.isPastDue
        ? 'rgba(244, 67, 54, 0.3)'
        : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const Checkbox = styled.input`
  margin-right: 0.75rem;
  cursor: pointer;
  width: 18px;
  height: 18px;
`;

const Title = styled.div<{ isCompleted: boolean }>`
  text-decoration: ${(props) => (props.isCompleted ? 'line-through' : 'none')};
  opacity: ${(props) => (props.isCompleted ? 0.7 : 1)};
  flex-grow: 1;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem 0.5rem;
  margin-left: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 0, 0, 0.2);
    color: white;
  }
`;

const DueDate = styled.div<{ isPastDue: boolean }>`
  font-size: 0.75rem;
  color: ${(props) =>
    props.isPastDue ? '#f44336' : 'rgba(255, 255, 255, 0.7)'};
  margin-right: 0.5rem;
`;

interface GoalItemProps {
  goal: Goal;
  onToggle: (id: string, currentStatus: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (goal: Goal) => void;
}

export default function GoalItem({
  goal,
  onToggle,
  onDelete,
  onEdit,
}: GoalItemProps) {
  const isPastDue = goal.completionDate
    ? new Date(goal.completionDate) < new Date() && !goal.isCompleted
    : false;

  const completedSubtasks =
    goal.subtasks?.filter((task) => task.isCompleted).length || 0;
  const totalSubtasks = goal.subtasks?.length || 0;

  return (
    <GoalItemContainer
      isCompleted={goal.isCompleted}
      isPastDue={isPastDue}
      onClick={() => onEdit(goal)}
    >
      <Checkbox
        type='checkbox'
        checked={goal.isCompleted}
        onChange={(e) => {
          e.stopPropagation();
          onToggle(goal.id, goal.isCompleted);
        }}
      />
      <Title isCompleted={goal.isCompleted}>
        {goal.title}
        {totalSubtasks > 0 && (
          <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem' }}>
            ({completedSubtasks}/{totalSubtasks})
          </span>
        )}
      </Title>

      {goal.completionDate && (
        <DueDate isPastDue={isPastDue}>
          {isPastDue ? 'Past due: ' : 'Due: '}
          {new Date(goal.completionDate).toLocaleDateString()}
        </DueDate>
      )}

      <DeleteButton
        onClick={(e) => {
          e.stopPropagation();
          onDelete(goal.id);
        }}
        title='Delete goal'
      >
        🗑️
      </DeleteButton>
    </GoalItemContainer>
  );
}
