import { Link } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #23272f;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #ffffff;
  max-width: 600px;
  margin: 0 auto;
`;

const AppGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const AppCard = styled(Link)`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
`;

const CardImage = styled.div<{ bgColor: string }>`
  height: 160px;
  background-color: ${(props) => props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardIcon = styled.span`
  font-size: 4rem;
  color: white;
`;

const CardContent = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h2`
  font-size: 1.4rem;
  margin: 0 0 0.5rem;
  color: #23272f;
`;

const CardDescription = styled.p`
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
  margin: 0;
  flex-grow: 1;
`;

const CardFooter = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-weight: 600;
  color: #52528c;
  font-size: 0.9rem;
`;

type AppInfo = {
  path: string;
  title: string;
  description: string;
  icon: string;
  color: string;
};

export default function Landing() {
  const apps: AppInfo[] = [
    {
      path: '/ticketPriceGenerator',
      title: 'Fare Calculator',
      description:
        'Calculate transportation fares with customizable pricing and zones.',
      icon: '🎫',
      color: '#52528c',
    },
    {
      path: '/timer',
      title: 'Multi Timer App',
      description:
        'Create and manage multiple countdown timers simultaneously.',
      icon: '⏱️',
      color: '#3a7ca5',
    },
    {
      path: '/stateManagement',
      title: 'State Management',
      description: 'Practice examples using React state management techniques.',
      icon: '🔄',
      color: '#7c9eb2',
    },
    {
      path: '/apiConcepts',
      title: 'API Concepts',
      description: 'Learn and test various API interaction patterns.',
      icon: '🌐',
      color: '#372554',
    },
    {
      path: '/dashboard',
      title: 'User Dashboard',
      description: 'Access your personalized dashboard (requires login).',
      icon: '📊',
      color: '#6a7a94',
    },
    {
      path: '/profile',
      title: 'User Profile',
      description: 'View and edit your profile settings (requires login).',
      icon: '👤',
      color: '#7c9eb2',
    },
  ];

  return (
    <PageContainer>
      <Header>
        <Title>AWS Amplify React App</Title>
        <Subtitle>
          Explore the different applications and examples available in this
          project
        </Subtitle>
      </Header>

      <AppGrid>
        {apps.map((app) => (
          <AppCard to={app.path} key={app.path}>
            <CardImage bgColor={app.color}>
              <CardIcon>{app.icon}</CardIcon>
            </CardImage>
            <CardContent>
              <CardTitle>{app.title}</CardTitle>
              <CardDescription>{app.description}</CardDescription>
              <CardFooter>Launch Application →</CardFooter>
            </CardContent>
          </AppCard>
        ))}
      </AppGrid>
    </PageContainer>
  );
}
