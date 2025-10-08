import React from 'react';
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import Login from './Login';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

import './App.css';

function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className='text-white h-[100vh] flex items-center justify-center bg-cover' style={{ backgroundImage: "url('../src/img/pexels-petra-reid-419907087-34154290.jpg')" }}>
        <Login />
      </div>

    </>
  );
}

export default App;