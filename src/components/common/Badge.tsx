import React from 'react';
import styled from 'styled-components';
import { foodChallengeTheme } from '../../utils/foodChallengeUtils';

interface StatusBadgeProps {
  status: 'active' | 'completed' | 'expired';
}

interface VisibilityBadgeProps {
  isPublic?: boolean;
  onClick?: () => void;
}

const BaseBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
  letter-spacing: 0.5px;
`;

const StyledStatusBadge = styled(BaseBadge).withConfig({
  shouldForwardProp: (prop) => !['status'].includes(prop),
})<StatusBadgeProps>`
  ${(props) => {
    switch (props.status) {
      case 'active':
        return `
          background: ${foodChallengeTheme.colors.primaryLight};
          color: ${foodChallengeTheme.colors.primary};
        `;
      case 'completed':
        return `
          background: ${foodChallengeTheme.colors.secondaryLight};
          color: ${foodChallengeTheme.colors.secondary};
        `;
      case 'expired':
        return `
          background: ${foodChallengeTheme.colors.errorLight};
          color: ${foodChallengeTheme.colors.error};
        `;
      default:
        return '';
    }
  }}
`;

const StyledVisibilityBadge = styled(BaseBadge).withConfig({
  shouldForwardProp: (prop) => !['isPublic'].includes(prop),
})<VisibilityBadgeProps>`
  cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
  transition: all 0.2s ease;
  background: ${(props) =>
    props.isPublic
      ? foodChallengeTheme.colors.secondaryLight
      : `${foodChallengeTheme.colors.textSecondary}15`};
  color: ${(props) =>
    props.isPublic
      ? foodChallengeTheme.colors.secondary
      : foodChallengeTheme.colors.textSecondary};

  ${(props) =>
    props.onClick &&
    `
    &:hover {
      opacity: 0.8;
      transform: scale(1.05);
    }
  `}
`;

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <StyledStatusBadge status={status}>{status}</StyledStatusBadge>
);

export const VisibilityBadge: React.FC<
  VisibilityBadgeProps & { onClick?: () => void }
> = ({ isPublic, onClick }) => (
  <StyledVisibilityBadge
    isPublic={isPublic}
    onClick={onClick}
    title={
      onClick ? `Click to make ${isPublic ? 'private' : 'public'}` : undefined
    }
  >
    {isPublic ? '🌐 Public' : '🔒 Private'}
  </StyledVisibilityBadge>
);
