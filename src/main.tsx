// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import { Authenticator, ThemeProvider } from '@aws-amplify/ui-react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import '@aws-amplify/ui-react/styles.css';
import { theme } from './theme.ts';

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Authenticator.Provider>
        <StyledThemeProvider theme={theme}>
          <App />
        </StyledThemeProvider>
      </Authenticator.Provider>
    </ThemeProvider>
  </React.StrictMode>
);
