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
import StateManagementPractice from './pages/StateManagementPractice';
import ApiConcepts from './pages/ApiConcepts';
import MultiTimerApp from './pages/countDownApp/MultiTimerApp';
import FareForm from './pages/FareForm/Dashboard';
import JobTracker from './pages/JobTracker';
import VendingMachine from './pages/VendingMachine';
import ReactCheatSheet from './pages/reactAnswersApp/ReactCheatSheet';
import MightyCoders from './pages/MightyCoders';
import PokemonLocator from './pages/PokemonHeartGoldLocator';
import FoodChallengePage from './pages/FoodChallengePage';
import { FindTrackers } from './pages/FindTrackers';
import { FollowingPage } from './pages/FollowingPage';
import TrackerPublicPage from './pages/TrackerPublicPage';

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path='/' element={<Landing />} />
          <Route path='/signin' element={<SignInPage />} />
          <Route
            path='/stateManagement'
            element={<StateManagementPractice />}
          />
          <Route path='/apiConcepts' element={<ApiConcepts />} />
          <Route path='/timer' element={<MultiTimerApp />} />
          <Route path='/ticketPriceGenerator' element={<FareForm />} />
          <Route path='/vendingMachine' element={<VendingMachine />} />
          <Route path='/reactCheatSheet' element={<ReactCheatSheet />} />
          <Route path='/pokemonHeartGold' element={<PokemonLocator />} />
          <Route path='/findTrackers' element={<FindTrackers />} />
          <Route
            path='/foodChallenge/tracker/:trackerId'
            element={<TrackerPublicPage />}
          />

          {/* Protected routes with Navbar */}
          <Route
            element={
              <>
                <Navbar />
                <ProtectedRoute />
              </>
            }
          >
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/jobs' element={<JobTracker />} />
            <Route path='/mightyCoders' element={<MightyCoders />} />
            <Route path='/foodChallenge' element={<FoodChallengePage />} />
            <Route path='/following' element={<FollowingPage />} />
          </Route>

          {/* Optional catch-all */}
          <Route path='*' element={<Landing />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}
