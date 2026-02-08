import React from 'react';
import styled from 'styled-components';
import { TrackerDashboard } from '../components/food-challenge/TrackerDashboard';
import { foodChallengeTheme } from '../utils/foodChallengeUtils';

const Container = styled.div`
  min-height: 100vh;
  background: ${foodChallengeTheme.colors.background};
  padding: ${foodChallengeTheme.spacing.lg} ${foodChallengeTheme.spacing.md};
  padding-top: 100px;
`;

const Header = styled.div`
  max-width: ${foodChallengeTheme.layout.maxWidth};
  margin: 0 auto ${foodChallengeTheme.spacing.xl} auto;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0 0 ${foodChallengeTheme.spacing.md} 0;
  color: ${foodChallengeTheme.colors.textPrimary};
  font-size: ${foodChallengeTheme.typography.h1.fontSize};
  font-weight: ${foodChallengeTheme.typography.h1.fontWeight};
`;

const Description = styled.p`
  margin: 0;
  color: ${foodChallengeTheme.colors.textSecondary};
  font-size: ${foodChallengeTheme.typography.body.fontSize};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const FoodChallengePage: React.FC = () => {
  return (
    <Container>
      <Header>
        <Title>🌭 Food Challenge Tracker</Title>
        <Description>
          Track your food consumption challenges with precise measurements and
          progress monitoring. Create challenges, log meals using real unit
          conversions, and see your progress over time.
        </Description>
      </Header>
      <TrackerDashboard />
    </Container>
  );
};

export default FoodChallengePage;
