import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

const client = generateClient<Schema>();

// Simple user profile interface
export interface UserProfile {
  id: string;
  cognitoId: string;
  email: string;
  username: string;
  displayName?: string;
  createdAt: string;
}

// Get current user from database or create if needed
export async function getOrCreateUser() {
  try {
    // Get Cognito ID
    const cognitoUser = await getCurrentUser();
    const cognitoId = cognitoUser.userId;
    
    // Check if user exists
    const users = await client.models.User.list({
      filter: { cognitoId: { eq: cognitoId } }
    });
    
    // User exists - return it
    if (users.data.length > 0) {
      return users.data[0];
    }
    
    // User doesn't exist - create it
    const attributes = await fetchUserAttributes();
    const email = attributes.email || '';
    const username = attributes.preferred_username || email.split('@')[0];
    
    const newUser = await client.models.User.create({
      cognitoId,
      email,
      username,
      displayName: username,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
    
    // Create wallet for new user
    await client.models.Wallet.create({
      userId: cognitoId,
      balance: 0
    });
    
    return newUser.data;
  } catch (error) {
    console.error('Error getting/creating user:', error);
    throw error;
  }
}

// Get wallet balance for current user
export async function getWalletBalance() {
  try {
    const cognitoUser = await getCurrentUser();
    const cognitoId = cognitoUser.userId;
    
    const wallets = await client.models.Wallet.list({
      filter: { userId: { eq: cognitoId } }
    });
    
    return wallets.data.length > 0 ? wallets.data[0].balance : 0;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return 0;
  }
}

// Update user profile
export async function updateUserProfile(id: string, data: {
  username?: string;
  displayName?: string;
}) {
  try {
    const result = await client.models.User.update({
      id,
      ...data
    });
    return result.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}