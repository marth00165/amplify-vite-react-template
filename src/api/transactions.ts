import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// Define Transaction interface for better type safety
export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  vendor: string;
  notes?: string;
  createdAt: string;
}

export async function createTransaction(
  userId: string,
  type: 'income' | 'expense',
  amount: number,
  vendor: string,
  notes: string
): Promise<Transaction> {
  try {
    const result = await client.models.Transaction.create({
      userId,
      type,
      amount,
      vendor,
      notes,
      createdAt: new Date().toISOString(),
    });
    
    return result.data as Transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

export async function updateWalletBalance(
  userId: string, 
  amount: number, 
  type: 'income' | 'expense'
): Promise<number> {
  try {
    const wallets = await client.models.Wallet.list({
      filter: { userId: { eq: userId } },
    });

    if (wallets.data.length > 0) {
      // Update existing wallet
      const oldBalance = wallets.data[0].balance;
      const adjustment = type === 'income' ? amount : -amount;

      await client.models.Wallet.update({
        id: wallets.data[0].id,
        balance: (oldBalance ?? 0) + adjustment,
      });

      return (oldBalance ?? 0) + adjustment;
    } else {
      // Create new wallet if it doesn't exist
      const newWallet = await client.models.Wallet.create({
        userId,
        balance: type === 'income' ? amount : -amount
      });
      
      // Add null check before accessing balance
      if (!newWallet.data) {
        throw new Error('Failed to create wallet');
      }
      
      return newWallet.data.balance;
    }
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    throw error;
  }
}

export async function addTransaction(
  userId: string,
  type: 'income' | 'expense',
  amount: number,
  vendor: string,
  notes: string
): Promise<number> {
  try {
    // Create the transaction
    await createTransaction(userId, type, amount, vendor, notes);
    return await updateWalletBalance(userId, amount, type);
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
}

// Update getWalletBalance function to use the User/Wallet relationship
export async function getWalletBalance(userId: string): Promise<number> {
  try {
    const wallets = await client.models.Wallet.list({
      filter: { userId: { eq: userId } }
    });
    
    if (wallets.data.length > 0) {
      return wallets.data[0].balance;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
}

/**
 * Get all transactions for a specific user
 * @param userId The user ID to fetch transactions for
 * @param limit Optional maximum number of transactions to retrieve (default: 20)
 * @param nextToken Optional pagination token for retrieving next set of results
 * @returns Object containing transaction data and next pagination token
 */
export async function getTransactions(
  userId: string, 
  limit = 20, 
  nextToken?: string | null
): Promise<{
  transactions: Transaction[];
  nextToken: string | null;
}> {
  try {
    const transactions = await client.models.Transaction.list({
      filter: { userId: { eq: userId } },
      limit,
      nextToken: nextToken || undefined, // Ensure we pass undefined and not null to the API
    });

    // Sort transactions by createdAt descending (most recent first)
    const sortedTransactions = transactions.data.sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );

    return {
      transactions: sortedTransactions as Transaction[],
      nextToken: transactions.nextToken || null // Convert undefined to null
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { transactions: [], nextToken: null };
  }
}

// Get a single transaction by ID
export async function getTransactionById(id: string): Promise<Transaction | null> {
  try {
    const transaction = await client.models.Transaction.get({ id });
    return transaction.data as Transaction;
  } catch (error) {
    console.error('Error fetching transaction by ID:', error);
    return null;
  }
}

// Delete a transaction and update wallet balance
export async function deleteTransaction(
  transactionId: string, 
  userId: string, 
  type: 'income' | 'expense', 
  amount: number
): Promise<number> {
  try {
    // Delete the transaction
    await client.models.Transaction.delete({ id: transactionId });
    
    // Update wallet balance by reversing the transaction
    // For income, we subtract; for expense, we add back
    const reverseType = type === 'income' ? 'expense' : 'income';
    return await updateWalletBalance(userId, amount, reverseType);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}