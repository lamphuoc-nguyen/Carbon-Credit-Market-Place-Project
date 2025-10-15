import React from 'react';
import Register from './pages/Register';
import Homepage from './pages';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/Homepage" element={<Homepage />} />

          {/* Temporary redirect to register for testing */}
          <Route path="/" element={<Navigate to="/Homepage" replace />} />
          <Route path="*" element={<Navigate to="/Homepage" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;