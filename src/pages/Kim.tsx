/*
todo: 
- add props interface if needed
- create an application that is romantic and fun
- use this page to practice typescript and react
*/

import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const compliments = [
  'You have a way of making people feel comfortable.',
  'Your laugh is genuinely contagious.',
  "You always know how to brighten someone's day.",
  'You notice the little things that matter.',
  'You make ordinary days feel special.',
  'You have a great sense of humor.',
  'You are thoughtful and kind.',
  'You make even simple moments memorable.',
  'You bring out the best in people.',
  'You have a smile that makes others smile too.',
  'You have the biggest forehead ever.',
  "You're top 3 funniest people dead or alive.",
  'You literally are a super athlete.',
  'I want to feed you all the food in the world.',
];

const getRandomCompliment = (exclude: string) => {
  let compliment = exclude;
  while (compliment === exclude && compliments.length > 1) {
    compliment = compliments[Math.floor(Math.random() * compliments.length)];
  }
  return compliment;
};

const popIn = keyframes`
  0% { transform: scale(0.7); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const Background = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #f9d423 0%, #ff4e50 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
`;

const Content = styled.div`
  margin: 5px;

  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  padding: 2.5rem 1.5rem 2rem 1.5rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 600px) {
    border-radius: 0;
    padding: 1.5rem 0.5rem 1.2rem 0.5rem;
    max-width: 100vw;
    margin-top: 70px; // Pushes card below navbar
  }
`;

const Title = styled.h1`
  font-family: cursive;
  font-size: 2.1rem;
  margin-bottom: 0.5rem;
  color: #fffbe7;

  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.h2`
  font-weight: 400;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  color: #fffbe7;

  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;

const ComplimentButton = styled.button`
  background: #fff;
  color: #ff4e50;
  border: none;
  border-radius: 8px;
  padding: 0.9rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  font-size: 1.15rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 2.5rem;
  width: 100%;
  max-width: 320px;
  transition: transform 0.1s;

  &:active {
    transform: scale(0.97);
  }
`;

const PopupOverlay = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Popup = styled.div`
  background: white;
  color: #ff4e50;
  border-radius: 18px;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  max-width: 90vw;
  width: 340px;
  text-align: center;
  position: relative;
  animation: ${popIn} 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  font-size: 1.2rem;

  @media (max-width: 600px) {
    width: 95vw;
    padding: 1.2rem 0.5rem 1rem 0.5rem;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 14px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #ff4e50;
  cursor: pointer;
  font-weight: bold;
`;

const ComplimentText = styled.div`
  margin: 1.5rem 0 0.5rem 0;
  font-weight: 500;
  color: #ff4e50;
`;

const Emoji = styled.div`
  font-size: 2rem;
  margin-top: 1rem;
`;

const AutoCloseNote = styled.div`
  font-size: 0.9rem;
  margin-top: 1.2rem;
  color: #ff4e50;
`;

const Kim: React.FC = () => {
  const [compliment, setCompliment] = useState(compliments[0]);
  const [showPopup, setShowPopup] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSurprise = () => {
    setCompliment(getRandomCompliment(compliment));
    setShowPopup(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowPopup(false), 10000);
  };

  const handleClose = () => {
    setShowPopup(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <Background>
      <Content>
        <Title>Kim's Daily Affirmations</Title>
        <Subtitle>A little reminder just for you 💛</Subtitle>
        <ComplimentButton
          onClick={handleSurprise}
          aria-label='Show me a compliment'
        >
          Give Me a Compliment!
        </ComplimentButton>
        {showPopup && (
          <PopupOverlay>
            <Popup>
              <CloseButton onClick={handleClose} aria-label='Close compliment'>
                ×
              </CloseButton>
              <ComplimentText>{compliment}</ComplimentText>
              <Emoji>🌷😊</Emoji>
              <AutoCloseNote>
                This will close automatically in 10 seconds.
              </AutoCloseNote>
            </Popup>
          </PopupOverlay>
        )}
      </Content>
    </Background>
  );
};

export default Kim;
