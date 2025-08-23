/*
todo: 
- add props interface if needed
- create an application that is romantic and fun
- use this page to practice typescript and react
*/

import React, { useState } from 'react';

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
];

const getRandomCompliment = (exclude: string) => {
  let compliment = exclude;
  while (compliment === exclude && compliments.length > 1) {
    compliment = compliments[Math.floor(Math.random() * compliments.length)];
  }
  return compliment;
};

const Kim: React.FC = () => {
  const [compliment, setCompliment] = useState(compliments[0]);

  const handleSurprise = () => {
    setCompliment(getRandomCompliment(compliment));
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)',
        color: '#fff',
        padding: '2rem',
        borderRadius: '16px',
        textAlign: 'center',
        maxWidth: 420,
        margin: '2rem auto',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}
    >
      <h1
        style={{
          fontFamily: 'cursive',
          fontSize: '2.2rem',
          marginBottom: '0.5rem',
        }}
      >
        Kim's Daily Affirmations
      </h1>
      <h2 style={{ fontWeight: 400, marginBottom: '2rem' }}>
        A little reminder just for you 💛
      </h2>
      <p style={{ fontSize: '1.25rem', margin: '2rem 0', minHeight: 48 }}>
        {compliment}
      </p>
      <button
        onClick={handleSurprise}
        style={{
          background: '#fff',
          color: '#ff4e50',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem 1.5rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        Give Me a Compliment!
      </button>
      <div style={{ marginTop: '2rem', fontSize: '2rem' }}>🌷😊</div>
    </div>
  );
};

export default Kim;
