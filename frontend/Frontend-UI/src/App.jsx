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
import Marketplace from './pages/Marketplace'; // Public marketplace for unauthenticated users
import Detailpage from './pages/BuyerPage/DetailPage';
import PaymentPage from './pages/BuyerPage/PaymentPage';
import PaymentSuccessPage from './pages/BuyerPage/PaymentSuccessPage';
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

  // Ẩn Navbar & Footer nếu đang ở trang /cva
  const hideLayout  = location.pathname === '/cva' || 
                      location.pathname.startsWith('/admin') ||
                      location.pathname === '/buyer' ||
                      location.pathname === '/marketplace' ||
                      location.pathname === '/payment' ||
                      location.pathname === '/payment/callback' ||
                      location.pathname === '/payment/success' ||
                      location.pathname === '/wallet' ||
                      location.pathname === '/certificate' ||
                      location.pathname === '/ev-dashboard' ||
                      location.pathname === '/ev-dashboard/journeys' ||
                      location.pathname === '/ev-dashboard/wallet' ||
                      location.pathname === '/ev-dashboard/Listing' ||
                      location.pathname === '/ev-dashboard/profile' ||
                      location.pathname === '/ev-dashboard/marketplace';

  return (
    <>
      {!hideLayout  && <Navbar />}

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
        <Route path="/cva" element={<CvaPage />} />
        <Route path="/buyer" element={<BuyerPage />} />
        <Route path="/marketplace/:listingId" element={<Detailpage />} />
        <Route path="/marketplace-unauthed" element={<Marketplace />} /> {/* Public marketplace for unauthenticated users */}
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/certificate" element={<CertificatePage />} />
        
        
        {/* --- EV Owner Routes --- */}
<Route path="/ev-dashboard"
element={
  <ProtectedRoute requiredRole="EV_OWNER">
    <EvOwner />
  </ProtectedRoute>
}/>
<Route path="/ev-dashboard/profile"
element={
  <ProtectedRoute requiredRole="EV_OWNER">
    <ProfilePage />
  </ProtectedRoute>
}/>
<Route path="/ev-dashboard/journeys"
element={
  <ProtectedRoute requiredRole="EV_OWNER">
    <JourneyList />
  </ProtectedRoute>
}/>
<Route path="/ev-dashboard/marketplace"
element={
  <ProtectedRoute requiredRole="EV_OWNER">
    <EvOwner />
  </ProtectedRoute>
}/>
<Route path="/ev-dashboard/wallet"
element={
  <ProtectedRoute requiredRole="EV_OWNER">
    <Wallet />
  </ProtectedRoute>
}/>
<Route path="/ev-dashboard/listing"
element={
  <ProtectedRoute requiredRole="EV_OWNER">
    <CreateListingPage />
  </ProtectedRoute>
}/>

<Route path="/marketplace" element={<ProtectedRoute requiredRole="BUYER"><MakerPlacePage /></ProtectedRoute>} />

        {/* --- CVA Routes --- */}
        <Route path="/cva" element={<CvaPage />}> {/* PARENT Route */}

          {/* CHILD Routes */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* ✅ THIS IS THE ROUTE YOU NEED */}
          <Route path="pending" element={<PendingVerifications />} />

          <Route path="review/:journeyId" element={<ReviewJourneyDetail />} />
          {/* Add other child routes like verified-credits, reports here */}
          <Route path="verified-credits" element={<VerifiedCredits />} />
          <Route path="reports" element={<Report />} />
          <Route path="detail/:journeyId" element={<DetailPage />} />

        </Route> {/* End of PARENT Route */}

        {/* --- Admin Routes --- */}
        <Route path="/admin" element={<AdminPage />}> {/* PARENT Route */}

          {/* CHILD Routes */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* ✅ THIS IS THE ROUTE YOU NEED */}
          <Route path="user-management" element={<UserManagement />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="wallets-cash-flow" element={<WalletManagement />} />
          <Route path="platform-reports" element={<PlatformReport />} />



        </Route> {/* End of PARENT Route */}

       
      </Routes>


      {!hideLayout && <Footer />}
      
    </>
  );
}

export default App;
