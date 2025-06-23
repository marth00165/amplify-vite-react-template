// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';

import Dashboard from './pages/Dashboard.tsx';
import Login from './pages/Login.tsx';

export default function App() {
  const { user } = useAuthenticator((context) => [context.user]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={user ? <Navigate to='/dashboard' replace /> : <Login />}
        />
        <Route
          path='/dashboard'
          element={user ? <Dashboard /> : <Navigate to='/' replace />}
        />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
}
