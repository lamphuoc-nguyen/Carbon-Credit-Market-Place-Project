import React from 'react';
import { Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginForm from './pages/LoginForm';
import Navbar from './Components/Navbar';
import RegisterForm from './pages/RegisterForm';
import Footer from './Components/Footer';

function App() {


  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/Login" />} />
        <Route path="/Login" element={<LoginForm />} />
        <Route path="/Register" element={<RegisterForm />} />
        <Route path="/Home" element={<LoginForm />} />
      </Routes>

      <Footer />
    </>
  );
}


export default App;



