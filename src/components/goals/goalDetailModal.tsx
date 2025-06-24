import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Goal, Subtask } from '../../api/goals';
import {
  Button,
  Field,
  ModalBackdrop,
  ModalContent,
} from '../themed-components';
import { v4 as uuidv4 } from 'uuid';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const CloseButton = styled(Button)`
  background: rgba(255, 255, 255, 0.2);
  margin-right: 10px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const SaveButton = styled(Button)``;

const SubtaskList = styled.div`
  margin-top: 1rem;
`;

const SubtaskItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const SubtaskCheckbox = styled.input`
  margin-right: 0.5rem;
`;

const SubtaskInput = styled.input`
  flex-grow: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem;
  border-radius: 4px;
  color: white;
`;

const AddSubtaskButton = styled(Button)`
  margin-top: 0.5rem;
  background: rgba(82, 82, 140, 0.5);
  padding: 0.5rem;
  width: 100%;
`;

const RemoveSubtaskButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  margin-left: 0.5rem;

  &:hover {
    color: #f44336;
  }
`;

const GoalModalContent = styled(ModalContent)`
  max-height: 80vh;
  overflow-y: auto;

  @media (max-height: 700px) {
    max-height: 90vh; // More space on smaller screens
  }
`;

interface GoalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onSave: (goal: Partial<Goal>) => Promise<void>;
}

export default function GoalDetailModal({
  isOpen,
  onClose,
  goal,
  onSave,
}: GoalDetailModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setCompletionDate(goal.completionDate || '');
      setSubtasks(goal.subtasks || []);
    }
  }, [goal]);

  const handleSave = async () => {
    if (!title.trim()) return;

    await onSave({
      id: goal?.id,
      title,
      description: description || undefined,
      completionDate: completionDate || undefined,
      subtasks,
    });

    onClose();
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, { id: uuidv4(), name: '', isCompleted: false }]);
  };

  const updateSubtask = (index: number, field: keyof Subtask, value: any) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = { ...newSubtasks[index], [field]: value };
    setSubtasks(newSubtasks);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop onClick={onClose}>
      <GoalModalContent onClick={(e) => e.stopPropagation()}>
        <h2>{goal ? 'Edit Goal' : 'Add Goal'}</h2>

        <Field>
          <label>Title:</label>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Goal title'
          />
        </Field>

        <Field>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Goal description (optional)'
            rows={3}
          />
        </Field>

        <Field>
          <label>Completion Date:</label>
          <input
            type='date'
            value={completionDate}
            onChange={(e) => setCompletionDate(e.target.value)}
          />
        </Field>

        <Field>
          <label>Subtasks:</label>
          <SubtaskList>
            {subtasks.map((subtask, index) => (
              <SubtaskItem key={subtask.id}>
                <SubtaskCheckbox
                  type='checkbox'
                  checked={subtask.isCompleted}
                  onChange={(e) =>
                    updateSubtask(index, 'isCompleted', e.target.checked)
                  }
                />
                <SubtaskInput
                  type='text'
                  value={subtask.name}
                  onChange={(e) => updateSubtask(index, 'name', e.target.value)}
                  placeholder='Subtask name'
                />
                <RemoveSubtaskButton
                  onClick={() => removeSubtask(index)}
                  title='Remove subtask'
                >
                  ✕
                </RemoveSubtaskButton>
              </SubtaskItem>
            ))}
            <AddSubtaskButton onClick={addSubtask}>
              Add Subtask
            </AddSubtaskButton>
          </SubtaskList>
        </Field>

        <ButtonContainer>
          <CloseButton onClick={onClose}>Cancel</CloseButton>
          <SaveButton onClick={handleSave}>Save</SaveButton>
        </ButtonContainer>
      </GoalModalContent>
    </ModalBackdrop>
  );
}
