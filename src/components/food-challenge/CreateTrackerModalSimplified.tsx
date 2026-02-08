import React, { useState } from 'react';
import styled from 'styled-components';
import { foodChallengeTheme } from '../../theme';
import {
  createTracker,
  SimpleTracker,
} from '../../api/foodChallengeSimplified';
import { Card } from '../themed-components';

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalWrapper = styled.div`
  position: relative;
  z-index: 1001;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${foodChallengeTheme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${foodChallengeTheme.spacing.sm};
`;

const Label = styled.label`
  font-weight: bold;
  color: ${foodChallengeTheme.colors.primary};
  font-size: ${foodChallengeTheme.typography.body.fontSize};
`;

const Input = styled.input`
  padding: ${foodChallengeTheme.spacing.sm};
  border: 2px solid ${foodChallengeTheme.colors.secondary};
  border-radius: ${foodChallengeTheme.borderRadius.md};
  font-size: ${foodChallengeTheme.typography.body.fontSize};

  &:focus {
    outline: none;
    border-color: ${foodChallengeTheme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${foodChallengeTheme.spacing.md};
  justify-content: flex-end;
  margin-top: ${foodChallengeTheme.spacing.md};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${foodChallengeTheme.spacing.sm} ${foodChallengeTheme.spacing.md};
  border: none;
  border-radius: ${foodChallengeTheme.borderRadius.md};
  font-size: ${foodChallengeTheme.typography.body.fontSize};
  font-weight: bold;
  cursor: pointer;
  background-color: ${(props) =>
    props.variant === 'secondary' ? '#ccc' : foodChallengeTheme.colors.primary};
  color: ${(props) => (props.variant === 'secondary' ? '#333' : 'white')};

  &:hover {
    opacity: 0.8;
  }
`;

interface Props {
  isOpen: boolean;
  onCreated: (tracker: SimpleTracker) => void | Promise<void>;
  onClose: () => void;
}

export const CreateTrackerModalSimplified: React.FC<Props> = ({
  isOpen,
  onCreated,
  onClose,
}) => {
  const [name, setName] = useState('Hot Dog Challenge');
  const [goal, setGoal] = useState('21');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [endDate, setEndDate] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a tracker name');
      return;
    }

    if (!goal || parseFloat(goal) <= 0) {
      setError('Please enter a valid goal');
      return;
    }

    if (!startDate) {
      setError('Please select a start date');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newTracker = await createTracker({
        name: name.trim(),
        goal: parseFloat(goal),
        startDate,
        endDate: endDate || undefined,
        isPublic,
      });

      if (!newTracker) {
        throw new Error('Failed to create tracker');
      }

      // Construct optimistic tracker with required fields
      const optimisticTracker: SimpleTracker = {
        id: newTracker.id,
        name: newTracker.name,
        goal: newTracker.goal,
        startDate: newTracker.startDate,
        endDate: newTracker.endDate,
        totalConsumed: 0,
        progressPercentage: 0,
        createdAt: new Date().toISOString(),
        consumptionLogs: [],
      };

      // Call callback with optimistic tracker
      onCreated(optimisticTracker);

      // Reset form
      setName('Hot Dog Challenge');
      setGoal('21');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setIsPublic(false);
      handleClose();
    } catch (err) {
      console.error('Error creating tracker:', err);
      setError(err instanceof Error ? err.message : 'Failed to create tracker');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <Backdrop onClick={handleClose}>
          <ModalWrapper onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Card style={{ minWidth: '400px', maxWidth: '500px' }}>
              <h2>Create New Tracker</h2>

              {error && (
                <div
                  style={{
                    color: 'red',
                    padding: foodChallengeTheme.spacing.md,
                    marginBottom: foodChallengeTheme.spacing.md,
                    backgroundColor: '#ffe0e0',
                    borderRadius: foodChallengeTheme.borderRadius.md,
                  }}
                >
                  {error}
                </div>
              )}

              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Tracker Name</Label>
                  <Input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    placeholder='e.g., Hot Dog Challenge'
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Goal (hot dog units)</Label>
                  <Input
                    type='number'
                    min='1'
                    step='1'
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    disabled={isLoading}
                    placeholder='e.g., 21'
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Start Date</Label>
                  <Input
                    type='date'
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isLoading}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>End Date (optional)</Label>
                  <Input
                    type='date'
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isLoading}
                  />
                </FormGroup>

                <FormGroup>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type='checkbox'
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      disabled={isLoading}
                      style={{ width: 'auto' }}
                    />
                    <span style={{ fontSize: '0.95rem' }}>
                      Make this tracker public (others can view and follow it)
                    </span>
                  </label>
                </FormGroup>

                <ButtonGroup>
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type='submit' disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Tracker'}
                  </Button>
                </ButtonGroup>
              </Form>
            </Card>
          </ModalWrapper>
        </Backdrop>
      )}
    </>
  );
};
