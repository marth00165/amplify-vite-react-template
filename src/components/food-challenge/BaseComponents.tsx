import React from 'react';
import styled from 'styled-components';
import { foodChallengeTheme } from '../../utils/foodChallengeUtils';

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

interface CardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Button component - flat design, no gradients
const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'fullWidth'].includes(prop),
})<ButtonProps>`
  padding: ${(props) => {
    switch (props.size) {
      case 'sm':
        return `${foodChallengeTheme.spacing.sm} ${foodChallengeTheme.spacing.md}`;
      case 'lg':
        return `${foodChallengeTheme.spacing.lg} ${foodChallengeTheme.spacing.xl}`;
      default:
        return `${foodChallengeTheme.spacing.md} ${foodChallengeTheme.spacing.lg}`;
    }
  }};

  border-radius: ${foodChallengeTheme.borderRadius.md};
  border: 2px solid;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  width: ${(props) => (props.fullWidth ? '100%' : 'auto')};

  ${(props) => {
    switch (props.variant) {
      case 'secondary':
        return `
          background: ${foodChallengeTheme.colors.secondary};
          border-color: ${foodChallengeTheme.colors.secondary};
          color: ${foodChallengeTheme.colors.white};
          
          &:hover:not(:disabled) {
            background: #a64a07;
            border-color: #a64a07;
          }
        `;
      case 'outline':
        return `
          background: transparent;
          border-color: ${foodChallengeTheme.colors.primary};
          color: ${foodChallengeTheme.colors.primary};
          
          &:hover:not(:disabled) {
            background: ${foodChallengeTheme.colors.primary};
            color: ${foodChallengeTheme.colors.white};
          }
        `;
      default:
        return `
          background: ${foodChallengeTheme.colors.primary};
          border-color: ${foodChallengeTheme.colors.primary};
          color: ${foodChallengeTheme.colors.white};
          
          &:hover:not(:disabled) {
            background: #c10400;
            border-color: #c10400;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(227, 5, 0, 0.2);
  }
`;

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => (
  <StyledButton {...props}>{children}</StyledButton>
);

// Card component - flat design, clean
const StyledCard = styled.div.withConfig({
  shouldForwardProp: (prop) => !['padding', 'shadow'].includes(prop),
})<CardProps>`
  background: ${foodChallengeTheme.colors.white};
  border: 1px solid ${foodChallengeTheme.colors.border};
  border-radius: ${foodChallengeTheme.borderRadius.lg};
  padding: ${(props) => {
    switch (props.padding) {
      case 'sm':
        return foodChallengeTheme.spacing.md;
      case 'lg':
        return foodChallengeTheme.spacing.xl;
      default:
        return foodChallengeTheme.spacing.lg;
    }
  }};

  ${(props) => props.shadow && `box-shadow: ${foodChallengeTheme.shadows.md};`}
`;

export const Card: React.FC<CardProps> = ({ children, ...props }) => (
  <StyledCard {...props}>{children}</StyledCard>
);

// Empty State component - shows only when no real data exists
const EmptyStateContainer = styled.div`
  text-align: center;
  padding: ${foodChallengeTheme.spacing.xxl};
`;

const EmptyStateTitle = styled.h2`
  color: ${foodChallengeTheme.colors.textPrimary};
  margin: 0 0 ${foodChallengeTheme.spacing.md} 0;
  font-size: ${foodChallengeTheme.typography.h2.fontSize};
  font-weight: ${foodChallengeTheme.typography.h2.fontWeight};
`;

const EmptyStateDescription = styled.p`
  color: ${foodChallengeTheme.colors.textSecondary};
  margin: 0 0 ${foodChallengeTheme.spacing.lg} 0;
  font-size: ${foodChallengeTheme.typography.body.fontSize};
  line-height: ${foodChallengeTheme.typography.body.lineHeight};
`;

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
}) => (
  <EmptyStateContainer>
    <EmptyStateTitle>{title}</EmptyStateTitle>
    <EmptyStateDescription>{description}</EmptyStateDescription>
    {action && (
      <Button variant='primary' onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </EmptyStateContainer>
);

// Progress Bar component - only shown when consumption logs exist
interface ProgressBarProps {
  percentage: number; // 0-100
  color?: string;
  label?: string;
  showPercentage?: boolean;
}

const ProgressContainer = styled.div`
  margin: ${foodChallengeTheme.spacing.md} 0;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${foodChallengeTheme.spacing.sm};
  font-size: ${foodChallengeTheme.typography.caption.fontSize};
  color: ${foodChallengeTheme.colors.textSecondary};
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  background: ${foodChallengeTheme.colors.divider};
  border-radius: ${foodChallengeTheme.borderRadius.sm};
  overflow: hidden;
`;

const ProgressFill = styled.div.withConfig({
  shouldForwardProp: (prop) => !['progress', 'color'].includes(prop),
})<{ progress: number; color: string }>`
  height: 100%;
  background: ${(props) => props.color};
  width: ${(props) => Math.min(Math.max(props.progress, 0), 100)}%;
  transition: width 0.3s ease;
`;

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color = foodChallengeTheme.colors.primary,
  label,
  showPercentage,
}) => (
  <ProgressContainer>
    {(label || showPercentage) && (
      <ProgressLabel>
        {label && <span>{label}</span>}
        {showPercentage && <span>{Math.round(percentage)}%</span>}
      </ProgressLabel>
    )}
    <ProgressTrack>
      <ProgressFill progress={percentage} color={color} />
    </ProgressTrack>
  </ProgressContainer>
);
