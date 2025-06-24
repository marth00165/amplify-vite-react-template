import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from '../../amplify/data/resource';

const MainContent = styled.div`
  padding: 2rem;
  color: white;
`;

const client = generateClient<Schema>();

export default function Dashboard() {
  const { user } = useAuthenticator();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    async function fetchWallet() {
      if (!user?.signInDetails?.loginId) return;

      const userId = user.signInDetails.loginId;

      const wallet = await client.models.Wallet.list({
        filter: { userId: { eq: userId } },
      });

      if (wallet.items.length > 0) {
        setBalance(wallet.items[0].balance);
      } else {
        // If wallet doesn't exist yet, create it with zero balance
        const newWallet = await client.models.Wallet.create({
          userId,
          balance: 0,
        });
        setBalance(newWallet.balance);
      }
    }

    fetchWallet();
  }, [user]);

  return (
    <MainContent>
      <h1>Welcome to your Dashboard</h1>
      <p>
        Your Wallet Balance:{' '}
        {balance !== null ? `$${balance.toFixed(2)}` : 'Loading...'}
      </p>
    </MainContent>
  );
}
