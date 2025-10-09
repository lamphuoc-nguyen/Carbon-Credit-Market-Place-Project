import React from 'react';
import backgroundImage from './img/a.jpg';
import './App.css';
import LoginPage from './pages';

function App() {
  return (
    <>
      <div className='text-white h-[100vh] flex items-center justify-center bg-cover' style={{ backgroundImage: `url(${backgroundImage})` }}>
        <LoginPage />
      </div>
    </>
  );
}

export default App;