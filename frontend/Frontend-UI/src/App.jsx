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

function App() {
  return (
    <>
      <Navbar />

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
      </Routes>

      <Footer />
    </>
  );
}

export default App;
