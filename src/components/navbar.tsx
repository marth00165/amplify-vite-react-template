import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import UserProfileModal from './profile/userProfileModal';

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #52528c;
  padding: 1rem 2rem;
  z-index: 1000;
`;

const Brand = styled.h1`
  color: white;
  font-size: 1.5rem;
`;

const Profile = styled.div`
  position: relative;
`;

const ProfileIcon = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: black;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-weight: bold;
  cursor: pointer;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const DropdownButton = styled.button`
  background: #7c9eb2;
  color: white;
  border: none;
  padding: 1rem;
  cursor: pointer;
  text-align: left;
  width: 100px;
  height: 50px;
  margin: 5px;
  font-size: 10px;
  &:hover {
    background: #52528c;
  }
`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [displayName, setDisplayName] = useState('User');
  const { signOut, user } = useAuthenticator();

  // Convert to a callback so we can reuse it
  const loadUserAttributes = useCallback(async () => {
    try {
      const attributes = await fetchUserAttributes();
      if (attributes.preferred_username) {
        setDisplayName(attributes.preferred_username);
      } else if (user?.signInDetails?.loginId) {
        // Fall back to email address (before the @)
        setDisplayName(user.signInDetails.loginId.split('@')[0]);
      }
    } catch (error) {
      console.error('Error fetching user attributes:', error);
    }
  }, [user]);

  useEffect(() => {
    loadUserAttributes();
  }, [loadUserAttributes]);

  const handleEditProfile = () => {
    setIsOpen(false); // Close dropdown
    setShowProfileModal(true); // Open profile modal
  };

  // Handler for when profile is updated in the modal
  const handleProfileUpdate = () => {
    // Reload user attributes to update the display name
    loadUserAttributes();
  };

  // First letter of display name for the profile icon
  const profileInitial = displayName?.[0]?.toUpperCase() || 'U';

  return (
    <>
      <NavbarContainer>
        <Brand>💰 {displayName}'s Severance Survivor</Brand>
        <Profile>
          <ProfileIcon onClick={() => setIsOpen(!isOpen)}>
            {profileInitial}
          </ProfileIcon>
          {isOpen && (
            <Dropdown>
              <DropdownButton onClick={handleEditProfile}>
                Edit Profile
              </DropdownButton>
              <DropdownButton onClick={signOut}>Log out</DropdownButton>
            </Dropdown>
          )}
        </Profile>
      </NavbarContainer>
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
}
