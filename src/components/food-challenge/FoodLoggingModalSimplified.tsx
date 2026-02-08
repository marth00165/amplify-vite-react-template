import React, { useState } from 'react';
import styled from 'styled-components';
import { foodChallengeTheme } from '../../theme';
import { createConsumptionLog } from '../../api/foodChallengeSimplified';
import { useHotDogData } from '../../hooks/useHotDogData';
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

const Select = styled.select`
  padding: ${foodChallengeTheme.spacing.sm};
  border: 2px solid ${foodChallengeTheme.colors.secondary};
  border-radius: ${foodChallengeTheme.borderRadius.md};
  font-size: ${foodChallengeTheme.typography.body.fontSize};
  background-color: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${foodChallengeTheme.colors.primary};
  }
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

const Total = styled.div`
  font-size: 1.1em;
  font-weight: bold;
  color: ${foodChallengeTheme.colors.primary};
  padding: ${foodChallengeTheme.spacing.md};
  background-color: ${foodChallengeTheme.colors.background};
  border-radius: ${foodChallengeTheme.borderRadius.md};
  text-align: center;
`;

interface Props {
  trackerId: string;
  isOpen: boolean;
  onLogged: (
    trackerId: string,
    foodItemName: string,
    foodItemValue: number,
    quantity: number,
  ) => void;
  onClose: () => void;
}

export const FoodLoggingModalSimplified: React.FC<Props> = ({
  trackerId,
  isOpen,
  onLogged,
  onClose,
}) => {
  const { data: hotDogData, loading: dataLoading } = useHotDogData();
  const [selectedItem, setSelectedItem] = useState<{
    name: string;
    value: number;
  } | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [consumedAt, setConsumedAt] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTotal = (): number => {
    if (!selectedItem || !quantity) return 0;
    const qty = parseFloat(quantity);
    return Number.isNaN(qty) ? 0 : qty * selectedItem.value;
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) {
      setError('Please select a food item');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (!consumedAt) {
      setError('Please select a date');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const qty = parseFloat(quantity);
      await createConsumptionLog({
        trackerId,
        foodItemName: selectedItem.name,
        foodItemValue: selectedItem.value,
        quantity: qty,
        unit: 'hot_dog_unit',
        consumedAt,
      });

      // Call optimistic update callback
      onLogged(trackerId, selectedItem.name, selectedItem.value, qty);

      // Clear form and close
      setSelectedItem(null);
      setQuantity('1');
      setConsumedAt(new Date().toISOString().split('T')[0]);
      handleClose();
    } catch (err) {
      console.error('Error logging food:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to log food consumption',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (dataLoading) {
    return isOpen ? (
      <Backdrop onClick={handleClose}>
        <ModalWrapper onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <Card>
            <p>Loading food items...</p>
          </Card>
        </ModalWrapper>
      </Backdrop>
    ) : null;
  }

  return isOpen ? (
    <Backdrop onClick={handleClose}>
      <ModalWrapper onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <Card style={{ minWidth: '400px', maxWidth: '500px' }}>
          <h2>Log Food Consumption</h2>

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
              <Label>Select Food Item</Label>
              <Select
                value={selectedItem ? selectedItem.name : ''}
                onChange={(e) => {
                  const selected = hotDogData?.items.find(
                    (item) => item.name === e.target.value,
                  );
                  setSelectedItem(selected || null);
                }}
                disabled={isLoading}
              >
                <option value=''>-- Choose an item --</option>
                {hotDogData?.items.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name} ({item.value} units)
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Quantity</Label>
              <Input
                type='number'
                min='0.1'
                step='0.1'
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isLoading}
                placeholder='Enter quantity'
              />
            </FormGroup>

            <FormGroup>
              <Label>Date Consumed</Label>
              <Input
                type='date'
                value={consumedAt}
                onChange={(e) => setConsumedAt(e.target.value)}
                disabled={isLoading}
              />
            </FormGroup>

            <Total>Total: {calculateTotal().toFixed(2)} hot_dog_units</Total>

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
                {isLoading ? 'Logging...' : 'Log Food'}
              </Button>
            </ButtonGroup>
          </Form>
        </Card>
      </ModalWrapper>
    </Backdrop>
  ) : null;
};
