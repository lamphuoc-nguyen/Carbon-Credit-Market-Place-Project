import React from 'react';
import { Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginForm from './pages/LoginForm';
import Navbar from './Components/Navbar';
import RegisterForm from './pages/RegisterForm';
import Footer from './Components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

function App() {


  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>

      <Footer />
    </>
  );
}


export default App;



