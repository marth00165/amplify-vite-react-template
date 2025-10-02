import React, { useState } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  max-width: 370px;
  width: 100%;
  min-width: 0;
  height: auto;
  max-height: 600px; /* Max height for the entire form */
  background: #fff;
  border: 1px solid #ffffff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(60, 60, 90, 0.12);
  overflow: hidden;
  margin: 1.5rem;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    max-width: none;
    width: 100%;
    margin: 0;
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
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const Group = styled.div`
  padding: 1.2rem;
  border-top: 1px solid #e6e6e6;
`;

const FixedGroup = styled(Group)`
  border-top: 1px solid #e6e6e6;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #23272f;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem;
  font-size: 1rem;
  border: 1px solid #bfc9d1;
  border-radius: 6px;
  box-sizing: border-box;
  background: #f7fafd;
  margin-bottom: 1rem;

  &:focus {
    border: 1.5px solid #4b4b4b;
    outline: none;
    background: #fff;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: #23272f;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #3a3f4a;
  }
`;

const ZoneSection = styled.div`
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  position: relative;
`;

const ZoneHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ZoneName = styled.div`
  font-weight: 600;
`;

const FareTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;

  th,
  td {
    padding: 0.5rem;
    font-size: 0.9rem;
    text-align: left;
  }

  th {
    font-weight: 600;
    color: #23272f;
    border-bottom: 1px solid #e6e6e6;
  }
`;

const FareInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  font-size: 0.9rem;
  border: 1px solid #bfc9d1;
  border-radius: 4px;
  box-sizing: border-box;
  background: #f7fafd;

  &:focus {
    border: 1.5px solid #4b4b4b;
    outline: none;
    background: #fff;
  }
`;

const DeleteButton = styled.button`
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background: #c82333;
  }
`;

interface Zone {
  name: string;
  zone: number;
  fares: {
    type: string;
    purchase: string;
    trips: number;
    price: number;
  }[];
}

interface CustomizeFormProps {
  onSave: (fares: any) => void;
}

const fareTypes = [
  { id: 'weekday', name: 'Weekday' },
  { id: 'evening_weekend', name: 'Evening/Weekend' },
  { id: 'anytime', name: 'Anytime' },
];

export function CustomizeForm({ onSave }: CustomizeFormProps) {
  const [title, setTitle] = useState('Regional Rail Fares');
  const [zones, setZones] = useState<Zone[]>([
    {
      name: 'CCP/1',
      zone: 1,
      fares: [
        {
          type: 'weekday',
          purchase: 'advance_purchase',
          trips: 1,
          price: 4.75,
        },
        { type: 'weekday', purchase: 'onboard_purchase', trips: 1, price: 6.0 },
        {
          type: 'evening_weekend',
          purchase: 'advance_purchase',
          trips: 1,
          price: 3.75,
        },
        {
          type: 'evening_weekend',
          purchase: 'onboard_purchase',
          trips: 1,
          price: 5.0,
        },
        {
          type: 'anytime',
          purchase: 'advance_purchase',
          trips: 10,
          price: 38.0,
        },
      ],
    },
  ]);

  const handleAddZone = () => {
    setZones([
      ...zones,
      {
        name: `Zone ${zones.length + 1}`,
        zone: zones.length + 1,
        fares: [
          { type: 'weekday', purchase: 'advance_purchase', trips: 1, price: 0 },
          { type: 'weekday', purchase: 'onboard_purchase', trips: 1, price: 0 },
          {
            type: 'evening_weekend',
            purchase: 'advance_purchase',
            trips: 1,
            price: 0,
          },
          {
            type: 'evening_weekend',
            purchase: 'onboard_purchase',
            trips: 1,
            price: 0,
          },
          {
            type: 'anytime',
            purchase: 'advance_purchase',
            trips: 10,
            price: 0,
          },
        ],
      },
    ]);
  };

  const handleZoneChange = (
    index: number,
    field: keyof Zone,
    value: string | number
  ) => {
    const newZones = [...zones];
    newZones[index] = {
      ...newZones[index],
      [field]: value,
    };
    setZones(newZones);
  };

  const getFarePrice = (zone: Zone, type: string, purchase: string): number => {
    const fare = zone.fares.find(
      (f) => f.type === type && f.purchase === purchase
    );
    return fare?.price || 0;
  };

  const setFarePrice = (
    zoneIndex: number,
    type: string,
    purchase: string,
    price: number
  ) => {
    const newZones = [...zones];
    const fareIndex = newZones[zoneIndex].fares.findIndex(
      (f) => f.type === type && f.purchase === purchase
    );

    if (fareIndex >= 0) {
      newZones[zoneIndex].fares[fareIndex].price = price;
    } else {
      const trips = type === 'anytime' ? 10 : 1;
      newZones[zoneIndex].fares.push({ type, purchase, trips, price });
    }

    setZones(newZones);
  };

  const handleDeleteZone = (indexToDelete: number) => {
    if (zones.length <= 1) return;

    setZones(
      zones
        .filter((_, index) => index !== indexToDelete)
        .map((zone, index) => ({
          ...zone,
          zone: index + 1,
        }))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customFares = {
      title,
      info: {
        weekday: 'Valid Monday through Friday, 4:00 a.m. - 7:00 p.m.',
        evening_weekend:
          'Valid weekdays after 7:00 p.m., all day Saturday, Sunday and major holidays',
        anytime: 'Valid anytime, must purchase in multiples of 10',
        advance_purchase:
          'Tickets available for purchase at all SEPTA offices.',
        onboard_purchase:
          'Tickets available for purchase from a train conductor aboard SEPTA regional rail trains.',
      },
      zones: zones.map((zone) => ({
        ...zone,
        zone: Number(zone.zone),
      })),
    };
    onSave(customFares);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Header>Customize Fare Structure</Header>

      <ScrollableContent>
        <Group>
          <Label htmlFor='title'>Title</Label>
          <Input
            id='title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Enter title'
          />
        </Group>

        {zones.map((zone, zoneIndex) => (
          <Group key={zoneIndex}>
            <ZoneSection>
              <ZoneHeader>
                <ZoneName>Zone {zone.zone}</ZoneName>
                <DeleteButton
                  type='button'
                  onClick={() => handleDeleteZone(zoneIndex)}
                  disabled={zones.length <= 1}
                >
                  Delete
                </DeleteButton>
              </ZoneHeader>

              <Input
                value={zone.name}
                onChange={(e) =>
                  handleZoneChange(zoneIndex, 'name', e.target.value)
                }
                placeholder='Zone name'
              />

              <FareTable>
                <thead>
                  <tr>
                    <th>Fare Type</th>
                    <th>Station Kiosk</th>
                    <th>Onboard</th>
                  </tr>
                </thead>
                <tbody>
                  {fareTypes.map((fareType) => (
                    <tr key={fareType.id}>
                      <td>{fareType.name}</td>
                      <td>
                        <FareInput
                          type='number'
                          step='0.01'
                          value={getFarePrice(
                            zone,
                            fareType.id,
                            'advance_purchase'
                          )}
                          onChange={(e) =>
                            setFarePrice(
                              zoneIndex,
                              fareType.id,
                              'advance_purchase',
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </td>
                      <td>
                        {fareType.id !== 'anytime' ? (
                          <FareInput
                            type='number'
                            step='0.01'
                            value={getFarePrice(
                              zone,
                              fareType.id,
                              'onboard_purchase'
                            )}
                            onChange={(e) =>
                              setFarePrice(
                                zoneIndex,
                                fareType.id,
                                'onboard_purchase',
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        ) : (
                          <small>N/A</small>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </FareTable>
            </ZoneSection>
          </Group>
        ))}
      </ScrollableContent>

      <FixedGroup>
        <Button type='button' onClick={handleAddZone}>
          Add Zone
        </Button>
      </FixedGroup>

      <FixedGroup>
        <Button type='submit'>Save Fare Structure</Button>
      </FixedGroup>
    </Form>
  );
}

export default CustomizeForm;
