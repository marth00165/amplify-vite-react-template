import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { Link } from 'react-router-dom';
import UserProfileModal from './profile/userProfileModal';
import ProfileDropdown from './profile/ProfileDropdown';
import { getWalletBalance } from '../api/transactions';
import { useUser } from '../context/UserContext';
import { getFollowedTrackers } from '../api/foodChallengeSimplified';

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

const NavContent = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover,
  &:focus {
    text-decoration: none;
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  &.active {
    background: rgba(255, 255, 255, 0.2);
  }
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
  overflow: hidden;
  padding: 0;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [displayName, setDisplayName] = useState('User');
  const [email, setEmail] = useState('');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [followedCount, setFollowedCount] = useState(0);
  const { signOut, user } = useAuthenticator();
  const { currentUser } = useUser();

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

  // Check followed trackers count
  const checkFollowedCount = useCallback(async () => {
    if (!user) return;

    try {
      const followed = await getFollowedTrackers();
      setFollowedCount(followed.length);
    } catch (error) {
      console.error('Error fetching followed trackers:', error);
      setFollowedCount(0);
    }
  }, [user]);

  useEffect(() => {
    loadUserAttributes();
    fetchWalletBalance();
    checkFollowedCount();
  }, [loadUserAttributes, fetchWalletBalance, checkFollowedCount]);

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
        <NavContent>
          <BrandLink to='/'>
            💰 {user ? `${displayName}'s` : ''} Severance Survivor
          </BrandLink>
          {user && (
            <NavLinks>
              <NavLink to='/dashboard'>Dashboard</NavLink>
              <NavLink to='/jobs'>Jobs</NavLink>
              <NavLink to='/timer'>Timer</NavLink>
              <NavLink to='/ticketPriceGenerator'>Fares</NavLink>
              <NavLink to='/findTrackers'>Find Trackers</NavLink>
              {followedCount > 0 && (
                <NavLink to='/following'>Following</NavLink>
              )}
            </NavLinks>
          )}
        </NavContent>
        <Profile>
          {user && (
            <ProfileIcon onClick={() => setIsOpen(!isOpen)}>
              {(currentUser as any)?.profilePicture ? (
                <ProfileImage
                  src={(currentUser as any).profilePicture}
                  alt='Profile'
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.textContent = profileInitial;
                  }}
                />
              ) : (
                profileInitial
              )}
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
