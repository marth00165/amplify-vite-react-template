import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { updateUserAttributes, fetchUserAttributes } from 'aws-amplify/auth';
import {
  Button,
  Field,
  ModalBackdrop,
  ModalContent,
} from '../themed-components';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const CloseButton = styled(Button)`
  background: rgba(255, 255, 255, 0.2);
  margin-right: 10px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const SaveButton = styled(Button)``;

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate?: () => void; // Add this callback prop
}

export default function UserProfileModal({
  isOpen,
  onClose,
  onProfileUpdate,
}: UserProfileModalProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch the current user attributes when the modal opens
    const loadUserAttributes = async () => {
      try {
        const attributes = await fetchUserAttributes();
        setUsername(attributes.preferred_username || '');
      } catch (error) {
        console.error('Error fetching user attributes:', error);
      }
    };

    if (isOpen) {
      loadUserAttributes();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!username.trim()) return;

    setIsLoading(true);
    try {
      // Update the user's preferred_username attribute
      await updateUserAttributes({
        userAttributes: {
          preferred_username: username.trim(),
        },
      });

      // Call the callback to notify parent component
      if (onProfileUpdate) {
        onProfileUpdate();
      }

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>Edit Profile</h2>

        <Field>
          <label>Username:</label>
          <input
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder='Enter your username'
          />
        </Field>

        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          More profile options coming soon!
        </p>

        <ButtonContainer>
          <CloseButton onClick={onClose}>Cancel</CloseButton>
          <SaveButton onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </SaveButton>
        </ButtonContainer>
      </ModalContent>
    </ModalBackdrop>
  );
}
