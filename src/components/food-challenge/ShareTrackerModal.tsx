import React, { useState } from 'react';
import styled from 'styled-components';
import { foodChallengeTheme } from '../../utils/foodChallengeUtils';
import { Card } from '../themed-components';

interface ShareTrackerModalProps {
  trackerId: string;
  trackerName: string;
  onClose: () => void;
}

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const ModalWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalContent = styled(Card)`
  max-width: 500px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${foodChallengeTheme.spacing.lg};
  padding-bottom: ${foodChallengeTheme.spacing.md};
  border-bottom: 2px solid ${foodChallengeTheme.colors.secondary};
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${foodChallengeTheme.colors.primary};
  font-size: ${foodChallengeTheme.typography.h2.fontSize};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${foodChallengeTheme.colors.primary};
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`;

const ShareSection = styled.div`
  margin-bottom: ${foodChallengeTheme.spacing.lg};
`;

const ShareLabel = styled.label`
  display: block;
  margin-bottom: ${foodChallengeTheme.spacing.sm};
  color: ${foodChallengeTheme.colors.textPrimary};
  font-weight: 600;
  font-size: ${foodChallengeTheme.typography.body.fontSize};
`;

const LinkContainer = styled.div`
  display: flex;
  gap: ${foodChallengeTheme.spacing.sm};
  align-items: center;
`;

const ShareLink = styled.input`
  flex: 1;
  padding: ${foodChallengeTheme.spacing.md};
  border: 2px solid ${foodChallengeTheme.colors.border};
  border-radius: ${foodChallengeTheme.borderRadius.md};
  font-family: monospace;
  font-size: 0.85rem;
  color: ${foodChallengeTheme.colors.textPrimary};
  background: ${foodChallengeTheme.colors.white};

  &:focus {
    outline: none;
    border-color: ${foodChallengeTheme.colors.primary};
    box-shadow: 0 0 0 3px rgba(227, 5, 0, 0.1);
  }
`;

const CopyButton = styled.button`
  padding: ${foodChallengeTheme.spacing.md} ${foodChallengeTheme.spacing.lg};
  background: ${foodChallengeTheme.colors.primary};
  color: ${foodChallengeTheme.colors.white};
  border: none;
  border-radius: ${foodChallengeTheme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #c10400;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CopyFeedback = styled.div<{ show: boolean }>`
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: opacity 0.3s ease;
  color: ${foodChallengeTheme.colors.success};
  font-size: 0.85rem;
  margin-top: ${foodChallengeTheme.spacing.sm};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${foodChallengeTheme.spacing.md};
  justify-content: flex-end;
  margin-top: ${foodChallengeTheme.spacing.lg};
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

export const ShareTrackerModal: React.FC<ShareTrackerModalProps> = ({
  trackerId,
  trackerName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/foodChallenge/tracker/${trackerId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Backdrop onClick={handleBackdropClick}>
      <ModalWrapper>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Share "{trackerName}"</ModalTitle>
            <CloseButton onClick={onClose}>✕</CloseButton>
          </ModalHeader>

          <ShareSection>
            <ShareLabel>Tracker Link</ShareLabel>
            <LinkContainer>
              <ShareLink
                type='text'
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <CopyButton onClick={handleCopyLink}>
                {copied ? '✓ Copied' : 'Copy'}
              </CopyButton>
            </LinkContainer>
            <CopyFeedback show={copied}>Link copied to clipboard!</CopyFeedback>
          </ShareSection>

          <ButtonGroup>
            <Button variant='secondary' onClick={onClose}>
              Close
            </Button>
          </ButtonGroup>
        </ModalContent>
      </ModalWrapper>
    </Backdrop>
  );
};

export default ShareTrackerModal;
