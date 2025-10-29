import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import DetailPage from './pages/BuyerPage/DetailPage';
import PaymentPage from './pages/BuyerPage/PaymentPage';
import WalletPage from './pages/BuyerPage/WalletPage';
import CertificatePage from './pages/BuyerPage/CertificatePage';

function App() {

  // Ẩn Navbar & Footer nếu đang ở trang /cva
  const hideLayout  = location.pathname === '/cva' ||
                      location.pathname === '/buyer' ||
                      location.pathname.startsWith('/marketplace') ||
                      location.pathname === '/payment' ||
                      location.pathname === '/wallet' ||
                      location.pathname === '/certificate';             

  return (
    <>
      {!hideLayout && <Navbar />}

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
        <Route path="/marketplace/:listingId" element={<DetailPage />} />
        <Route path="/marketplace" element={<MakerPlacePage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/certificate" element={<CertificatePage />} />
      </Routes>


      {!hideLayout && <Footer />}
      
    </>
  );
}

export default App;
