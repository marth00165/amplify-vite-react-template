import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { Link } from 'react-router-dom';
import UserProfileModal from './profile/userProfileModal';
import ProfileDropdown from './profile/ProfileDropdown';
import { getWalletBalance } from '../api/transactions';

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

const BrandLink = styled(Link)`
  text-decoration: none !important;
  color: white;
  font-size: 1.5rem;
  transition: text-shadow 0.3s ease;

  &:hover,
  &:focus,
  &:active,
  &:visited {
    text-decoration: none !important;
    text-shadow: 0 0 10px rgba(82, 82, 140, 0.8), 0 0 20px rgba(2, 2, 9, 0.5);
  }
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

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [displayName, setDisplayName] = useState('User');
  const [email, setEmail] = useState('');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const { signOut, user } = useAuthenticator();

  // Load user attributes
  const loadUserAttributes = useCallback(async () => {
    try {
      const attributes = await fetchUserAttributes();
      if (attributes.preferred_username) {
        setDisplayName(attributes.preferred_username);
      } else if (user?.signInDetails?.loginId) {
        // Fall back to email address (before the @)
        setDisplayName(user.signInDetails.loginId.split('@')[0]);
      }

      // Set email
      if (attributes.email) {
        setEmail(attributes.email);
      } else if (user?.signInDetails?.loginId) {
        setEmail(user.signInDetails.loginId);
      }
    } catch (error) {
      console.error('Error fetching user attributes:', error);
    }
  }, [user]);

  // Fetch wallet balance
  const fetchWalletBalance = useCallback(async () => {
    if (!user?.signInDetails?.loginId) return;

    try {
      const balance = await getWalletBalance(user.signInDetails.loginId);
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWalletBalance(0); // Default to 0 if there's an error
    }
  }, [user]);

  useEffect(() => {
    loadUserAttributes();
    fetchWalletBalance();
  }, [loadUserAttributes, fetchWalletBalance]);

  const handleEditProfile = () => {
    setIsOpen(false);
    setShowProfileModal(true);
  };

  const handleProfileUpdate = () => {
    loadUserAttributes();
  };

  // First letter of display name for the profile icon
  const profileInitial = displayName?.[0]?.toUpperCase() || 'U';
  return (
    <>
      <NavbarContainer>
        <BrandLink to='/'>
          💰 {user ? `${displayName}'s` : ''} Severance Survivor
        </BrandLink>
        <Profile>
          {user && (
            <ProfileIcon onClick={() => setIsOpen(!isOpen)}>
              {profileInitial}
            </ProfileIcon>
          )}

          {isOpen && (
            <ProfileDropdown
              displayName={displayName}
              email={email}
              walletBalance={walletBalance}
              onEditProfile={handleEditProfile}
              onSignOut={signOut}
              onClose={() => setIsOpen(false)}
            />
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
