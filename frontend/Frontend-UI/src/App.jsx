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
import BuyerPage from './pages/BuyerPage';
import MakerPlacePage from './pages/BuyerPage/MakerPlacePage';
import EvMarketplace from './pages/EvPage/Marketplace';
import Detailpage from './pages/BuyerPage/DetailPage';
import PaymentPage from './pages/BuyerPage/PaymentPage';
import WalletPage from './pages/BuyerPage/WalletPage';
import CertificatePage from './pages/BuyerPage/CertificatePage';
import ProfilePage from './pages/EvPage/Profile';
import EvOwner from './pages/EvPage';
import JourneyList from './pages/EvPage/JourneyList';
import CreateListingPage from './pages/EvPage/Listing';
import Dashboard from './Components/CvaComponents/Dashboard';
import PendingVerifications from './Components/CvaComponents/PendingVerifications';
import ReviewJourneyDetail from './Components/CvaComponents/ReviewJourneyDetail';
import VerifiedCredits from './Components/CvaComponents/VerifiedCredits';
import Report from './Components/CvaComponents/Report';
import DetailPage from './Components/CvaComponents/DetailPage';
import ProtectedRoute from './Components/EVComponents/ProtectedRoute';
import Wallet from './pages/EvPage/Wallet';
import AdminPage from './pages/AdminPage';
import AdminDashboard from './Components/AdminComponents/AdminDashboard';
import UserManagement from './Components/AdminComponents/UserManagement';
import Transactions from './Components/AdminComponents/Transactions';
import WalletManagement from './Components/AdminComponents/WalletManagement';
import PlatformReport from './Components/AdminComponents/PlatformReport';


function App() {
  const location = useLocation();

  // Hide Navbar & Footer for specific pages
  const hideLayout = location.pathname === '/cva' || 
                     location.pathname.startsWith('/admin') ||
                     location.pathname === '/buyer' ||
                     location.pathname.startsWith('/marketplace') ||
                     location.pathname === '/payment' ||
                     location.pathname === '/wallet' ||
                     location.pathname === '/certificate' ||
                     location.pathname === '/ev-dashboard' ||
                     location.pathname === '/ev-dashboard/journeys' ||
                     location.pathname === '/ev-dashboard/wallet' ||
                     location.pathname === '/ev-dashboard/Listing' ||
                     location.pathname === '/ev-dashboard/profile' ||
                     location.pathname === '/ev-dashboard/marketplace' ||
                     location.pathname === '/Marketplace' ||
                     location.pathname === '/cva/dashboard' ||
                     location.pathname === '/cva/pending' ||
                     location.pathname === '/cva/review' ||
                     location.pathname === '/cva/verified-credits' ||
                     location.pathname === '/cva/reports';

  return (
    <>  
      {!hideLayout && <Navbar />}

      <Routes>
        {/* --- Public Routes --- */}
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
        
        {/* --- Public Marketplace Routes --- */}
        <Route path="/marketplace" element={<MakerPlacePage />} />
        <Route path="/marketplace/:listingId" element={<Detailpage />} />
        <Route path="/ev-dashboard/marketplace" element={<EvMarketplace />} />
        
        {/* --- Buyer Routes (Protected - BUYER Role) --- */}
        <Route 
          path="/buyer" 
          element={
            <ProtectedRoute requiredRole="BUYER">
              <BuyerPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payment" 
          element={
            <ProtectedRoute requiredRole="BUYER">
              <PaymentPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wallet" 
          element={
            <ProtectedRoute requiredRole="BUYER">
              <WalletPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/certificate" 
          element={
            <ProtectedRoute requiredRole="BUYER">
              <CertificatePage />
            </ProtectedRoute>
          } 
        />
        
        {/* --- EV Owner Routes (Protected - EV_OWNER Role) --- */}
        <Route 
          path="/ev-dashboard" 
          element={
            <ProtectedRoute requiredRole="EV_OWNER">
              <EvOwner />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/ev-dashboard/profile" 
          element={
            <ProtectedRoute requiredRole="EV_OWNER">
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/ev-dashboard/journeys" 
          element={
            <ProtectedRoute requiredRole="EV_OWNER">
              <JourneyList />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/ev-dashboard/wallet" 
          element={
            <ProtectedRoute requiredRole="EV_OWNER">
              <Wallet />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/ev-dashboard/listing" 
          element={
            <ProtectedRoute requiredRole="EV_OWNER">
              <CreateListingPage />
            </ProtectedRoute>
          }
        />

        {/* --- CVA Routes (Protected - CVA Role) --- */}
        <Route 
          path="/cva" 
          element={
            <ProtectedRoute requiredRole="CVA">
              <CvaPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pending" element={<PendingVerifications />} />
          <Route path="review/:journeyId" element={<ReviewJourneyDetail />} />
          <Route path="verified-credits" element={<VerifiedCredits />} />
          <Route path="reports" element={<Report />} />
          <Route path="detail/:journeyId" element={<DetailPage />} />
        </Route>

        {/* --- Admin Routes (Protected - ADMIN Role) --- */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="wallets-cash-flow" element={<WalletManagement />} />
          <Route path="platform-reports" element={<PlatformReport />} />
        </Route>
      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

export default App;
