import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Dropdown = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  background: #1f1f3d;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 220px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 12px;
`;

const UserInfoSection = styled.div`
  padding: 10px;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 10px;
`;

const UserEmail = styled.div`
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 5px;
`;

const WalletBalance = styled.div`
  display: flex;
  justify-content: space-between;
  background: rgba(82, 82, 140, 0.3);
  padding: 8px 10px;
  border-radius: 4px;
  margin: 8px 0;
  user-select: none;
  cursor: default;

  span:first-child {
    font-size: 12px;
    opacity: 0.8;
  }

  span:last-child {
    font-weight: bold;
  }
`;

const DropdownButton = styled.button`
  background: #7c9eb2;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  text-align: center;
  width: 100%;
  border-radius: 4px;
  margin: 5px 0;
  font-size: 12px;
  transition: background-color 0.2s;

  &:hover {
    background: #52528c;
  }
`;

// Add a styled link for the username
const UserNameLink = styled(Link)`
  text-decoration: none !important;
  color: white;
  font-size: 1 rem;
  transition: text-shadow 0.3s ease;

  &:hover,
  &:focus,
  &:active,
  &:visited {
    text-decoration: none !important;
    text-shadow: 0 0 10px rgba(82, 82, 140, 0.8),
      0 0 20px rgba(237, 164, 38, 0.5);
  }
`;

interface ProfileDropdownProps {
  displayName: string;
  email: string;
  walletBalance: number | null;
  onEditProfile: () => void;
  onSignOut: () => void;
  onClose: () => void;
}

export default function ProfileDropdown({
  displayName,
  email,
  walletBalance,
  onEditProfile,
  onSignOut,
  onClose,
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <Dropdown ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
      <UserInfoSection>
        <UserNameLink to='/profile' onClick={onClose}>
          {displayName}
        </UserNameLink>
        <UserEmail>{email}</UserEmail>
        <WalletBalance>
          <span>Current Balance:</span>
          <span>
            {walletBalance !== null
              ? `$${walletBalance.toFixed(2)}`
              : 'Loading...'}
          </span>
        </WalletBalance>
      </UserInfoSection>
      <DropdownButton onClick={onEditProfile}>Edit Profile</DropdownButton>
      <DropdownButton onClick={onSignOut}>Log out</DropdownButton>
    </Dropdown>
  );
}
