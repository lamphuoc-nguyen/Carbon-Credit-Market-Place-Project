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
import ReviewJourneyDetail from './Components/CvaComponents/ReviewJourneyDetail';
import PendingVerifications from './Components/CvaComponents/PendingVerifications';
import Dashboard from './Components/CvaComponents/Dashboard';
import VerifiedCredits from './Components/CvaComponents/VerifiedCredits';
import Report from './Components/CvaComponents/Report';
import DetailPage from './Components/CvaComponents/DetailPage';

import AdminPage from './pages/AdminPage';
import AdminDashboard from './Components/AdminComponents/AdminDashboard';


function App() {
  const location = useLocation();

  // ✅ 3. Use startsWith() to check the path
  // This will hide the layout for /cva, /cva/dashboard, /cva/pending, etc.
  // Also added check for /buyer assuming similar logic applies
  const hideLayout = location.pathname.startsWith('/cva') || location.pathname.startsWith('/admin');

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

        </Route> {/* End of PARENT Route */}

      </Routes>



      {!hideLayout && <Footer />}
      
    </>
  );
}

export default App;
