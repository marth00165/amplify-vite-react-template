import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export async function createTransaction(
  userId: string,
  type: 'income' | 'expense',
  amount: number,
  vendor: string,
  notes: string
) {
  return await client.models.Transaction.create({
    userId,
    type,
    amount,
    vendor,
    notes,
    createdAt: new Date().toISOString(),
  });
}

export async function updateWalletBalance(
  userId: string, 
  amount: number, 
  type: 'income' | 'expense'
) {
  const wallet = await client.models.Wallet.list({
    filter: { userId: { eq: userId } },
  });

  if (wallet.data.length > 0) {
    const oldBalance = wallet.data[0].balance;
    const adjustment = type === 'income' ? amount : -amount;

    await client.models.Wallet.update({
      id: wallet.data[0].id,
      balance: (oldBalance ?? 0) + adjustment,
    });

    return (oldBalance ?? 0) + adjustment;
  }
  
  return null;
}

export async function addTransaction(
  userId: string,
  type: 'income' | 'expense',
  amount: number,
  vendor: string,
  notes: string
) {
  // Create the transaction
  await createTransaction(userId, type, amount, vendor, notes);
  return await updateWalletBalance(userId, amount, type);
}

export async function getWalletBalance(userId: string) {
  const wallet = await client.models.Wallet.list({
    filter: { userId: { eq: userId } },
  });

  if (wallet.data.length > 0) {
    return wallet.data[0].balance;
  } else {
    const newWallet = await client.models.Wallet.create({
      userId,
      balance: 0,
    });
    return newWallet.data?.balance ?? 0;
  }
}

/**
 * Get all transactions for a specific user
 * @param userId The user ID to fetch transactions for
 * @param limit Optional maximum number of transactions to retrieve (default: 20)
 * @param nextToken Optional pagination token for retrieving next set of results
 * @returns Object containing transaction data and next pagination token
 */
export async function getTransactions(userId: string, limit = 20, nextToken?: string) {
  const transactions = await client.models.Transaction.list({
    filter: { userId: { eq: userId } },
    limit,
    nextToken,
  });

  // Sort transactions by createdAt descending (most recent first)
  const sortedTransactions = transactions.data.sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );

  return {
    transactions: sortedTransactions,
    nextToken: transactions.nextToken
  };
}

// You could also add a function to get a single transaction by ID
export async function getTransactionById(id: string) {
  const transaction = await client.models.Transaction.get({ id });
  return transaction.data;
}

// Add this new function to your transactions.ts file
export async function deleteTransaction(transactionId: string, userId: string, type: 'income' | 'expense', amount: number) {
  // Delete the transaction
  await client.models.Transaction.delete({ id: transactionId });
  
  // Update wallet balance by reversing the transaction
  // For income, we subtract; for expense, we add back
  const reverseType = type === 'income' ? 'expense' : 'income';
  return await updateWalletBalance(userId, amount, reverseType);
}