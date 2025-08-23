// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

import Navbar from './components/navbar';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import SignInPage from './pages/SignInPage';
import ProtectedRoute from './routes/protectedRoute';

// Example public page
import Landing from './pages/Landing';
import Kim from './pages/Kim';

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path='/landing' element={<Landing />} />
          <Route path='/signin' element={<SignInPage />} />
          <Route path='/kim' element={<Kim />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<Dashboard />} />
            <Route path='/profile' element={<ProfilePage />} />
          </Route>

          {/* Optional catch-all */}
          <Route path='*' element={<Landing />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}
