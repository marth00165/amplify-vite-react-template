// src/routes/ProtectedRoute.tsx
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute() {
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);
  const location = useLocation();

  if (authStatus === 'configuring') {
    // Optional: show a spinner while Amplify initializes
    return null;
  }

  if (authStatus !== 'authenticated') {
    return <Navigate to='/signin' replace state={{ from: location }} />;
  }

  return <Outlet />;
}
