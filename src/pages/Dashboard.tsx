import styled from 'styled-components';

const MainContent = styled.div`
  padding: 2rem;
  color: white;
`;

export default function Dashboard() {
  return (
    <MainContent>
      <h1>Welcome to your Dashboard</h1>
      <p>Start adding transactions and manage your wallet here.</p>
    </MainContent>
  );
}
