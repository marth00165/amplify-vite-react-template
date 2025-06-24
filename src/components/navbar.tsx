import { useState } from 'react';
import styled from 'styled-components';
import { useAuthenticator } from '@aws-amplify/ui-react';

const NavbarContainer = styled.nav`
  position: fixed; // ✅ Stay pinned at the top
  top: 0;
  left: 0;
  width: 100%; // ✅ Full width
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #52528c; // airSuperiorityBlue
  padding: 1rem 2rem;
  z-index: 1000; // ✅ Stay above other content
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
  background: #7c9eb2; /* ✅ theme brand primary 10 */
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
    background: #52528c; /* purple-ish hover */
  }
`;
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut, user } = useAuthenticator();

  return (
    <NavbarContainer>
      <Brand>💰 My Wallet App</Brand>
      <Profile>
        <ProfileIcon onClick={() => setIsOpen(!isOpen)}>
          {user?.signInDetails?.loginId?.[0] || 'A'}
        </ProfileIcon>
        {isOpen && (
          <Dropdown>
            <DropdownButton onClick={() => alert('Edit profile soon')}>
              Edit Profile
            </DropdownButton>
            <DropdownButton onClick={signOut}>Log out</DropdownButton>
          </Dropdown>
        )}
      </Profile>
    </NavbarContainer>
  );
}
