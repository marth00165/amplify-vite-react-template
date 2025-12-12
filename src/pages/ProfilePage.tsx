import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../context/UserContext';
import { updateUserProfile } from '../api/user';

// Styled components
const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 100px 20px 20px 20px;
`;

const ProfileTitle = styled.h1`
  margin-bottom: 20px;
  color: white;
`;

const ProfileCard = styled.div`
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  background: rgba(82, 82, 140, 0.2);
`;

const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

const ProfileImageContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ProfileImage = styled.img<{ clickable?: boolean }>`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  border: 2px solid #444;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
  transition: all 0.2s;
  display: block;

  &:hover {
    ${(props) =>
      props.clickable &&
      `
      transform: scale(1.05);
      border-color: #52528c;
    `}
  }
`;

const ProfileDetails = styled.div`
  flex-grow: 1;
  color: white;

  h2 {
    margin-bottom: 15px;
  }

  p {
    margin: 8px 0;
  }
`;

const EditButton = styled.button`
  background-color: #52528c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
  font-weight: bold;

  &:hover {
    background-color: #6e6eb8;
  }
`;

const LoadingMessage = styled.div`
  color: white;
  text-align: center;
  padding: 20px;
  font-size: 18px;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  text-align: center;
  padding: 20px;
  font-size: 18px;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 8px;
`;

const EditControls = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const EditField = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }

  input {
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #444;
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const CancelButton = styled(EditButton)`
  background-color: rgba(255, 255, 255, 0.2);

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

const ProfilePage: React.FC = () => {
  const { currentUser, isLoading, error, refreshUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    profilePicture: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when user is loaded
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        displayName: currentUser.displayName || '',
        profilePicture: (currentUser as any).profilePicture || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSaving(true);
    try {
      await updateUserProfile(currentUser.id, formData);
      await refreshUser();
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingMessage>Loading profile...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>Error: {error.message}</ErrorMessage>;
  }

  if (!currentUser) {
    return <LoadingMessage>No user data available</LoadingMessage>;
  }

  return (
    <ProfileContainer>
      <ProfileTitle>My Profile</ProfileTitle>
      <ProfileCard>
        <ProfileContent>
          <ProfileImageContainer>
            <ProfileImage
              src={
                (isEditing
                  ? formData.profilePicture
                  : (currentUser as any).profilePicture) ||
                'https://via.placeholder.com/150?text=Profile'
              }
              alt='Profile'
              clickable={!isEditing}
              onClick={() => !isEditing && setIsEditing(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/150?text=Profile';
              }}
            />
          </ProfileImageContainer>
          <ProfileDetails>
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <EditField>
                  <label>Username:</label>
                  <input
                    type='text'
                    name='username'
                    value={formData.username}
                    onChange={handleChange}
                  />
                </EditField>
                <EditField>
                  <label>Display Name:</label>
                  <input
                    type='text'
                    name='displayName'
                    value={formData.displayName}
                    onChange={handleChange}
                  />
                </EditField>
                <EditField>
                  <label>Profile Picture URL:</label>
                  <input
                    type='url'
                    name='profilePicture'
                    value={formData.profilePicture}
                    onChange={handleChange}
                    placeholder='https://example.com/your-image.jpg'
                  />
                </EditField>
                <p>
                  <strong>Email:</strong> {currentUser.email} (Cannot be changed
                  here)
                </p>

                <EditControls>
                  <CancelButton onClick={() => setIsEditing(false)}>
                    Cancel
                  </CancelButton>
                  <EditButton type='submit' disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </EditButton>
                </EditControls>
              </form>
            ) : (
              <>
                <h2>{currentUser.displayName || currentUser.username}</h2>
                <p>
                  <strong>Username:</strong> {currentUser.username}
                </p>
                <p>
                  <strong>Email:</strong> {currentUser.email}
                </p>
                <p>
                  <strong>Member Since:</strong>{' '}
                  {new Date(currentUser.createdAt).toLocaleDateString()}
                </p>
                <EditButton onClick={() => setIsEditing(true)}>
                  Edit Profile
                </EditButton>
              </>
            )}
          </ProfileDetails>
        </ProfileContent>
      </ProfileCard>
    </ProfileContainer>
  );
};

export default ProfilePage;
