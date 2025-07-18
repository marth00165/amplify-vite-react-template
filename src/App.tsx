import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

import Navbar from './components/navbar';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/profile' element={<ProfilePage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}
