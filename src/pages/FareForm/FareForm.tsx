import React, { useState } from 'react';
import styled from 'styled-components';
import { useFares } from '../../hooks/useFares';
import { calcFare, formatUSD } from '../../utils/calcFare';

const Form = styled.form`
  max-width: 370px;
  width: 100%;
  min-width: 0;
  height: auto;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #ffffff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(60, 60, 90, 0.12);
  overflow: hidden;

  @media (max-width: 768px) {
    max-width: none;
    width: 100%;
    margin: 0;
    min-height: 100vh;
    box-shadow: none;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  background: #23272f;
  color: #fff;
  padding: 1.1rem 1.2rem;
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: 0.03em;

  img {
    height: 28px;
    margin-right: 0.7rem;
  }

  @media (max-width: 500px) {
    font-size: 1rem;
    padding: 1rem 0.7rem;
  }
`;

const Group = styled.div`
  padding: 1.2rem 1.2rem 0.7rem 1.2rem;
  border-top: 1px solid #e6e6e6;
  background: transparent;

  @media (max-width: 768px) {
    padding: 1.2rem 1rem;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #23272f;
  letter-spacing: 0.01em;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  border: 1px solid #bfc9d1;
  border-radius: 8px;
  box-sizing: border-box;
  background: #f7fafd;
  transition: border 0.2s;
  appearance: none;
  background-image: url('data:image/svg+xml,...'); // Add a custom dropdown arrow
  background-repeat: no-repeat;
  background-position: right 0.8rem center;

  @media (max-width: 768px) {
    padding: 0.9rem;
    font-size: 1.1rem;
  }
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 0.6rem;
  font-size: 1rem;
  border: 1px solid ${(props) => (props.hasError ? '#dc3545' : '#bfc9d1')};
  border-radius: 6px;
  box-sizing: border-box;
  background: ${(props) => (props.hasError ? '#fff8f8' : '#f7fafd')};
  transition: border 0.2s;

  &:focus {
    border: 1.5px solid #4b4b4b;
    outline: none;
    background: #fff;
  }
`;

const HelperText = styled.div`
  font-size: 0.92rem;
  color: #7a869a;
  margin-top: 0.3rem;
`;

const ErrorText = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const RadioGroup = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 0.5rem 0;
  width: 100%;
  border: none;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const Legend = styled.legend`
  margin-bottom: 0.8rem;
  font-weight: 600;
  color: #23272f;
`;

const RadioLabel = styled.label`
  font-weight: 400;
  color: #23272f;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0;

  input[type='radio'] {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Result = styled.div`
  margin-top: auto;
  background: #23272f;
  color: #fff;
  text-align: center;
  padding: 1.5rem 1.2rem 2rem;
  border-radius: 0 0 18px 18px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
    border-radius: 0;
  }
`;

const ResultLabel = styled.small`
  display: block;
  margin-bottom: 0.3rem;
  font-size: 0.93rem;
  color: #bfc9d1;
`;

const Price = styled.span`
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin: 0.2rem 0 0.5rem; // Added bottom margin
`;

const Message = styled.div`
  font-size: 0.85rem;
  margin: 0.5rem auto 0;
  color: #bfc9d1;
  padding: 0 1rem;
  max-width: 280px;
  word-wrap: break-word;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    max-width: 320px;
    line-height: 1.5;
  }
`;

type FareType = 'weekday' | 'evening_weekend' | 'anytime';
type PurchaseType = 'advance_purchase' | 'onboard_purchase';

interface Fare {
  type: FareType;
  purchase: PurchaseType;
  trips: number;
  price: number;
}

interface Zone {
  zone: number;
  name: string;
  fares: Fare[];
}

interface FaresJson {
  zones: Zone[];
  info: { [key: string]: string };
  title?: string;
  logoUrl?: string;
}

interface FareResult {
  unitPrice: number;
  total: number;
  message: string;
}

export interface FareFormProps {
  customFares?: FaresJson;
}

/*
This component handles user input for fare calculation.
It is a dumb component that relies on the useFares hook for data fetching
and the calcFare utility for fare calculation logic.
*/

export default function FareForm({ customFares }: FareFormProps) {
  const { data: defaultFares, loading, error } = useFares();

  const faresJson = customFares || defaultFares;

  const [zone, setZone] = useState<string>('1');
  const [type, setType] = useState<FareType>('weekday');
  const [purchase, setPurchase] = useState<PurchaseType>('advance_purchase');
  const [rides, setRides] = useState<string>('1');
  const [ridesError, setRidesError] = useState<string>('');

  // Options
  const typeOptions = [
    { label: 'Weekdays', value: 'weekday' },
    { label: 'Evening / Weekend', value: 'evening_weekend' },
    { label: 'Anytime (10-Trip)', value: 'anytime' },
  ];
  const purchaseOptions = [
    { label: 'Station Kiosk', value: 'advance_purchase' },
    { label: 'Onboard', value: 'onboard_purchase' },
  ];

  // Calculate fare
  let fareResult: FareResult = { unitPrice: 0, total: 0, message: '' };
  if (faresJson) {
    const ridesNum = rides === '' ? 0 : Number(rides);
    fareResult = calcFare(
      { zone, type, purchase, rides: ridesNum },
      faresJson as FaresJson
    );
  }

  // Add this new validation function
  const validateRides = (value: string, fareType: FareType) => {
    if (fareType === 'anytime') {
      const numValue = Number(value);
      if (numValue % 10 !== 0) {
        setRidesError('Anytime tickets must be purchased in multiples of 10');
      } else {
        setRidesError('');
      }
    } else {
      setRidesError('');
    }
  };

  // Update the rides change handler to use the validation function
  const handleRidesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRides(value);
    validateRides(value, type);
  };

  // Add validation when fare type changes
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as FareType;
    setType(newType);
    validateRides(rides, newType);
  };

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <Header>
        {customFares?.logoUrl ? (
          <img
            src={customFares.logoUrl}
            alt='Transportation logo'
            onError={(e) => {
              // Fallback to default logo if custom URL fails to load
              (e.target as HTMLImageElement).src = '/img/septa-logo.webp';
            }}
          />
        ) : (
          <img src='/img/septa-logo.webp' alt='SEPTA' />
        )}
        {customFares?.title || 'Regional Rail Fares'}
      </Header>

      <Group>
        <Label htmlFor='zone'>Where are you going?</Label>
        <Select
          id='zone'
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          disabled={loading}
        >
          {faresJson &&
            (faresJson as FaresJson).zones.map((z) => (
              <option key={z.zone} value={z.zone}>
                {z.name}
              </option>
            ))}
        </Select>
      </Group>

      <Group>
        <Label htmlFor='type'>When are you riding?</Label>
        <Select
          id='type'
          value={type}
          onChange={handleTypeChange}
          disabled={loading}
          aria-describedby='type-helper'
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <HelperText id='type-helper'>
          {faresJson && (faresJson as FaresJson).info[type]}
        </HelperText>
      </Group>

      <Group>
        <RadioGroup aria-labelledby='purchase-legend'>
          <Legend id='purchase-legend'>
            Where will you purchase the fare?
          </Legend>
          {purchaseOptions.map((opt) => (
            <RadioLabel key={opt.value}>
              <input
                type='radio'
                name='purchase'
                value={opt.value}
                checked={purchase === opt.value}
                onChange={(e) => setPurchase(e.target.value as PurchaseType)}
                disabled={loading}
              />
              {opt.label}
            </RadioLabel>
          ))}
        </RadioGroup>
      </Group>

      <Group>
        <Label htmlFor='rides'>How many rides will you need?</Label>
        <Input
          id='rides'
          type='number'
          min='0'
          value={rides}
          onChange={handleRidesChange}
          disabled={loading}
          hasError={Boolean(ridesError)}
          aria-invalid={Boolean(ridesError)}
          aria-describedby={ridesError ? 'rides-error' : undefined}
        />
        {ridesError ? (
          <ErrorText id='rides-error' role='alert'>
            {ridesError}
          </ErrorText>
        ) : type === 'anytime' ? (
          <HelperText>
            Anytime tickets must be purchased in multiples of 10
          </HelperText>
        ) : null}
      </Group>

      <Result aria-live='polite'>
        <ResultLabel>
          {loading
            ? 'Loading fares...'
            : error
            ? 'Could not load fares'
            : 'Your fare will cost'}
        </ResultLabel>
        <Price>
          {loading || error ? '$0.00' : formatUSD(fareResult.total)}
        </Price>
        {fareResult.message && !loading && !error && (
          <Message>{fareResult.message}</Message>
        )}
      </Result>
    </Form>
  );
}
