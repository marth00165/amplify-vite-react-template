// src/pages/SignInPage.tsx
import { useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SignInPage() {
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (authStatus === 'authenticated') {
      navigate(from, { replace: true });
    }
  }, [authStatus, from, navigate]);

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <Authenticator />
    </div>
  );
}
