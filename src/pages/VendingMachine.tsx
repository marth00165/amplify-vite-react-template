import { useState } from 'react';
import styled from 'styled-components';
import { useUser } from '../context/UserContext';

const PageContainer = styled.div`
  padding: 100px 20px 20px 20px;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xl};
`;

const Title = styled.h1`
  color: white;
  margin: 0;
  font-size: 2.5rem;
  font-weight: 600;
  text-align: center;
`;

const BalanceSection = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  background: ${(props) => props.theme.colors.surface};
  padding: ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadows.sm};
`;

const BalanceDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const BalanceText = styled.p`
  margin: 0;
  font-size: ${(props) => props.theme.typography.fontSizes.lg};
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
  color: ${(props) => props.theme.colors.text};
`;

const AddedAmount = styled.p`
  margin: 0;
  color: ${(props) => props.theme.colors.success};
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
  font-size: ${(props) => props.theme.typography.fontSizes.md};
`;

const ReturnButton = styled.button`
  background: ${(props) => props.theme.colors.warning};
  color: ${(props) => props.theme.colors.white};
  border: none;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSizes.md};
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e0a800;
    transform: translateY(-1px);
  }
`;

const CoinsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${(props) => props.theme.spacing.md};
`;

const CoinButton = styled.button`
  width: 150px;
  height: 60px;
  background: ${(props) => props.theme.colors.success};
  color: ${(props) => props.theme.colors.white};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.lg};
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #16a34a;
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadows.md};
  }
`;

const MenuContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${(props) => props.theme.spacing.md};
`;

const MenuButton = styled.button<{ disabled: boolean }>`
  width: 120px;
  height: 70px;
  background: ${(props) =>
    props.disabled
      ? props.theme.colors.textSecondary
      : props.theme.colors.white};
  color: ${(props) =>
    props.disabled ? props.theme.colors.white : props.theme.colors.text};
  border: 2px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  font-weight: ${(props) => props.theme.typography.fontWeights.medium};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colors.primaryLight};
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadows.md};
  }
`;

const PurchaseMessage = styled.div`
  background: ${(props) => props.theme.colors.success};
  color: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  text-align: center;
  font-size: ${(props) => props.theme.typography.fontSizes.lg};
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
  box-shadow: ${(props) => props.theme.shadows.md};
`;

interface Coin {
  name: string;
  value: number;
}

interface Item {
  name: string;
  price: number;
}

const CoinButtonComponent = ({
  coin,
  handleCoinSelect,
}: {
  coin: Coin;
  handleCoinSelect: (value: number) => void;
}) => {
  const { name, value } = coin;
  return (
    <CoinButton onClick={() => handleCoinSelect(value)}>
      {name} - ${value}
    </CoinButton>
  );
};

const MenuItem = ({
  item,
  buyItem,
  disabled,
}: {
  item: Item;
  buyItem: (item: Item) => void;
  disabled: boolean;
}) => {
  const { name, price } = item;

  return (
    <MenuButton disabled={disabled} onClick={() => buyItem(item)}>
      {name} - ${price}
    </MenuButton>
  );
};

function VendingMachine() {
  const { currentUser } = useUser();

  const getTitle = () => {
    if (currentUser?.displayName) {
      return `${currentUser.displayName}'s Vending Machine`;
    } else if (currentUser?.username) {
      return `${currentUser.username}'s Vending Machine`;
    }
    return 'Vending Machine App';
  };

  const testdata = {
    items: [
      {
        name: 'Candy',
        price: 1.0,
      },
      {
        name: 'Soda',
        price: 1.5,
      },
      {
        name: 'Chips',
        price: 2.0,
      },
      {
        name: 'Sandwich',
        price: 5.0,
      },
    ],
    coins: [
      {
        name: 'Nickel',
        value: 0.05,
      },
      {
        name: 'Dime',
        value: 0.1,
      },
      {
        name: 'Quarter',
        value: 0.25,
      },
    ],
  };

  const [balance, setBalance] = useState(0.0);
  const [boughtItem, setBoughtItem] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<number | null>(null);

  const handleCoinSelect = (value: number) => {
    setRecentlyAdded(value);
    setTimeout(() => {
      setRecentlyAdded(null);
    }, 1000);
    setBoughtItem(null);
    setBalance((prev) => prev + value);
  };

  const returnChange = () => {
    if (balance !== 0) {
      setBalance(0);
    } else {
      alert('No Change Available!');
    }
  };

  const buyItem = (item: Item) => {
    if (balance < item.price) {
      returnChange();
    }
    setBalance((prev) => prev - item.price);
    setBoughtItem(item.name);

    setTimeout(() => {
      setBoughtItem(null);
    }, 10000);
  };

  const renderMenu = () => {
    const { items } = testdata;

    return (
      <MenuContainer>
        {items.map((item) => (
          <MenuItem
            disabled={item.price > balance}
            key={item.name}
            item={item}
            buyItem={buyItem}
          />
        ))}
      </MenuContainer>
    );
  };

  return (
    <PageContainer>
      <Title>{getTitle()}</Title>

      <BalanceSection>
        <BalanceDisplay>
          <BalanceText>Balance ${balance.toFixed(2)}</BalanceText>
          {recentlyAdded && (
            <AddedAmount>+${recentlyAdded.toFixed(2)}</AddedAmount>
          )}
        </BalanceDisplay>
        <ReturnButton onClick={returnChange}>Return Change</ReturnButton>
      </BalanceSection>

      <CoinsContainer>
        {testdata.coins.map((coin) => (
          <CoinButtonComponent
            key={coin.value}
            coin={coin}
            handleCoinSelect={handleCoinSelect}
          />
        ))}
      </CoinsContainer>

      {renderMenu()}

      {boughtItem && (
        <PurchaseMessage>
          Here is your {boughtItem}, and your change is ${balance.toFixed(2)}
        </PurchaseMessage>
      )}
    </PageContainer>
  );
}

export default VendingMachine;
