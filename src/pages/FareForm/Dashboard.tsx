import { useState } from 'react';
import styled from 'styled-components';
import FareForm from './FareForm';
import CustomizeForm from './CustomizeForm';

const DashboardLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  width: min(1200px, 95%);
  margin: 0 auto;
  padding: 2rem 0;
  min-height: 100vh;
  align-items: start;

  @media (max-width: 1024px) {
    gap: 1.5rem;
    padding: 1.5rem 0;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    width: min(600px, 95%);
    gap: 2rem;
    padding: 1rem 0;
  }
`;

const FormSection = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
`;

const ModeSelectContainer = styled.div`
  max-width: 370px;
  width: 100%;
  min-width: 0;
  background: #fff;
  border: 1px solid #ffffff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(60, 60, 90, 0.12);
  overflow: hidden;
  margin: 0 0 1.5rem 0;

  @media (max-width: 768px) {
    max-width: none;
    width: 100%;
    margin: 0 0 1rem 0;
  }
`;

const ModeSelectHeader = styled.div`
  display: flex;
  align-items: center;
  background: #23272f;
  color: #fff;
  padding: 1.1rem 1.2rem;
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: 0.03em;
`;

const ModeSelectContent = styled.div`
  padding: 1.2rem;
`;

const ModeSelect = styled.select`
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  border: 1px solid #bfc9d1;
  border-radius: 8px;
  box-sizing: border-box;
  background: #f7fafd;
  appearance: none;
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23333' viewBox='0 0 16 16'><path d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
`;

export default function Dashboard() {
  const [mode, setMode] = useState<'default' | 'custom'>('default');
  const [customFares, setCustomFares] = useState<any>(null);

  const handleCustomFares = (fares: any) => {
    setCustomFares(fares);
  };

  return (
    <DashboardLayout>
      <FormSection>
        <FareForm customFares={mode === 'custom' ? customFares : undefined} />
      </FormSection>

      <FormSection>
        <ModeSelectContainer>
          <ModeSelectHeader>Mode Selection</ModeSelectHeader>
          <ModeSelectContent>
            <ModeSelect
              value={mode}
              onChange={(e) => setMode(e.target.value as 'default' | 'custom')}
            >
              <option value='default'>Default Fares</option>
              <option value='custom'>Custom Fares</option>
            </ModeSelect>
          </ModeSelectContent>
        </ModeSelectContainer>

        {mode === 'custom' && <CustomizeForm onSave={handleCustomFares} />}
      </FormSection>
    </DashboardLayout>
  );
}
