import { useState, useEffect, useCallback } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export function useUserManagement() {
  const { user, authStatus } = useAuthenticator();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const syncUser = useCallback(async () => {
    // Only proceed if the user is authenticated
    if (authStatus !== 'authenticated' || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get Cognito user details
      const cognitoUser = await getCurrentUser();
      const cognitoId = cognitoUser.userId;
      const attributes = await fetchUserAttributes();
      
      // Check if user already exists in our database
      const existingUsers = await client.models.User.list({
        filter: { cognitoId: { eq: cognitoId } }
      });
      
      let dbUser;
      
      if (existingUsers.data.length === 0) {
        // Create a new user record
        console.log('Creating new user record');
        
        const username = attributes.preferred_username || 
                        attributes.email?.split('@')[0] || 
                        `user-${cognitoId.substring(0, 8)}`;
        
        const result = await client.models.User.create({
          cognitoId,
          email: attributes.email || '',
          username,
          displayName: attributes.name || username,
          profilePicture: attributes.picture || '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
        
        dbUser = result.data;
        
        // Create an initial wallet for the user
        await client.models.Wallet.create({
          userId: cognitoId,
          balance: 0
        });
      } else {
        // Update existing user
        dbUser = existingUsers.data[0];
        
        await client.models.User.update({
          id: dbUser.id,
          lastLogin: new Date().toISOString()
        });
      }
      
      setCurrentUser(dbUser);
    } catch (err) {
      console.error('Error syncing user:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [authStatus, user]);

  useEffect(() => {
    syncUser();
  }, [syncUser]);
  
  return { isLoading, currentUser, error, refreshUser: syncUser };
}