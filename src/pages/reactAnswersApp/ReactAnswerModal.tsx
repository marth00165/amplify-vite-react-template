/*
simple modal that takes answer and question as props and displays them

should take bullets as a prop and display them as a list in the answer section
*/

import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: ${(props) => props.theme.colors.surface};
  padding: ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.borderRadius.md};
  box-shadow: ${(props) => props.theme.shadows.md};
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.2s ease-out;
  will-change: transform, opacity;

  @keyframes slideIn {
    from {
      transform: translateY(-20px) scale(0.95);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
`;

const Question = styled.h2`
  margin-top: 0;
  color: ${(props) => props.theme.colors.primary};
`;

const Answer = styled.p`
  color: ${(props) => props.theme.colors.text};
`;

const CloseButton = styled.button`
  background: ${(props) => props.theme.colors.error};
  color: ${(props) => props.theme.colors.white};
  border: none;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  font-size: ${(props) => props.theme.typography.fontSizes.md};
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
  cursor: pointer;
  float: right;
  transition: all 0.2s ease-in-out;
  will-change: background-color, transform;

  &:hover {
    background: ${(props) => props.theme.colors.error};
    opacity: 0.9;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const BulletContainer = styled.ul`
  margin-top: 10px;
  padding-left: 20px;
  color: ${(props) => props.theme.colors.text};
`;

type qaItem = {
  question: string;
  answer: string;
  bullets?: string[];
};

interface ReactAnswerModalProps {
  qaItem: qaItem;
  onClose: () => void;
}

const ReactAnswerModal: React.FC<ReactAnswerModalProps> = React.memo(
  ({ qaItem, onClose }) => {
    const { question, answer } = qaItem;
    const bullets = qaItem.bullets || [];

    // Handle backdrop click to close modal
    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <ModalOverlay onClick={handleBackdropClick}>
        <ModalContent>
          <CloseButton onClick={onClose}>Close</CloseButton>
          <Question>{question}</Question>
          <Answer>{answer}</Answer>
          {bullets.length > 0 && (
            <BulletContainer>
              {bullets.map((bullet, index) => (
                <li key={index}>{bullet}</li>
              ))}
            </BulletContainer>
          )}
        </ModalContent>
      </ModalOverlay>
    );
  }
);

export default ReactAnswerModal;
