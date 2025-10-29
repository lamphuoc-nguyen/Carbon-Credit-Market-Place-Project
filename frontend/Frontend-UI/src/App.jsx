import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import LoginForm from './pages/LoginForm';
import Navbar from './Components/Navbar';
import RegisterForm from './pages/RegisterForm';
import SelectRolePage from './pages/SelectRolePage';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import CompleteRegistrationPage from './pages/CompleteRegistrationPage';
import Footer from './Components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CvaPage from './pages/CvaPage';
import EvOwner from './pages/EvPage';
import ProtectedRoute from './Components/ProtectedRoute';
import DebugAuthPage from './pages/DebugAuthPage';
import ProfilePage from './pages/EvPage/Profile';
import JourneyList from './pages/EvPage/JourneyList';
import ReviewJourneyDetail from './Components/CvaComponents/ReviewJourneyDetail';
import PendingVerifications from './Components/CvaComponents/PendingVerifications';
import Dashboard from './Components/CvaComponents/Dashboard';
import VerifiedCredits from './Components/CvaComponents/VerifiedCredits';
import Report from './Components/CvaComponents/Report';
import WalletPage from './pages/EvPage/Wallet';
import CreateListingPage from './pages/EvPage/Listing';

function App() {
  const location = useLocation();

  // Ẩn Navbar & Footer nếu đang ở trang /cva hoặc /ev-dashboard
  const hideLayout = location.pathname === '/cva';
  const hideLayoutEV = location.pathname === '/ev-dashboard';
  const hideLayoutJourneyList = location.pathname === '/ev-dashboard/journeys';
  const hideLayoutWallet = location.pathname === '/ev-dashboard/wallet';

  return (
    <>
      {!hideLayout && !hideLayoutEV && !hideLayoutJourneyList && !hideLayoutWallet && <Navbar />}

      

      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/select-role" element={<SelectRolePage />} />
        <Route path="/auth/callback" element={<OAuth2CallbackPage />} />
        <Route path="/complete-registration" element={<CompleteRegistrationPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/ev-dashboard/profile" element={<ProfilePage />} />
        <Route path="/ev-dashboard/vehicles" element={<EvOwner />} />
        <Route path="/ev-dashboard/journeys" element={<JourneyList />} />
        <Route path="/ev-dashboard/marketplace" element={<EvOwner />} />
        <Route path="/ev-dashboard/wallet" element={<WalletPage />} />
        <Route path="/ev-dashboard/listing" element={<CreateListingPage />} />

        {/* Debug Page - Remove in production */}
        <Route path="/debug-auth" element={<DebugAuthPage />} />
        
        {/* Protected Routes */}
         {/* --- CVA Routes --- */}
        <Route path="/cva" element={<CvaPage />}> {/* PARENT Route */}

          {/* CHILD Routes */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="pending" element={<PendingVerifications />} />

          <Route path="review/:journeyId" element={<ReviewJourneyDetail />} />
          {/* Add other child routes like verified-credits, reports here */}
          <Route path="verified-credits" element={<VerifiedCredits />} />
          <Route path="reports" element={<Report />} />

        </Route> {/* End of PARENT Route */}
        <Route 
          path="/ev-dashboard" 
          element={
            <ProtectedRoute requiredRole="EV_OWNER">
              <EvOwner />
            </ProtectedRoute>
          } 
        />
      </Routes>


      {!hideLayout && !hideLayoutEV && <Footer />}
      
    </>
  );
}

export default App;
