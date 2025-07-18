import { createContext, useContext, ReactNode } from 'react';
import { useUserManagement } from '../hooks/useUserManagement';
import { UserProfile } from '../api/user';

interface UserContextType {
  isLoading: boolean;
  currentUser: UserProfile | null;
  error: Error | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const userManagement = useUserManagement();

  return (
    <UserContext.Provider value={userManagement}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
