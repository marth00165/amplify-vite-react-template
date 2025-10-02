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
  justify-content: center;
  width: 100%;
  height: fit-content;
`;

export default function Dashboard() {
  return (
    <DashboardLayout>
      <FormSection>
        <FareForm />
      </FormSection>
      <FormSection>
        <CustomizeForm />
      </FormSection>
    </DashboardLayout>
  );
}
