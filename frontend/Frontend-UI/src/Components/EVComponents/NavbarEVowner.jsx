import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Leaf, User, Menu } from 'lucide-react';
import { userApi } from '../api';

function NavEVowner() {
  const [userName, setUserName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from API
    const fetchUserData = async () => {
      try {
        const response = await userApi.getCurrentUser();
        // Set username from API response - try different possible field names
        setUserName(response.fullName || response.username || response.name || 'User');
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to localStorage or default
        const storedName = localStorage.getItem('userName');
        setUserName(storedName || 'User');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className='bg-neutral-900 border-b border-neutral-800 relative z-50'>
      <nav className='max-w-7xl mx-auto px-6 py-3'>
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/evowner" className="flex text-xl items-center gap-2 cursor-pointer">
            <Leaf size={28} color="#2bff00" />
            <div className='flex items-center gap-2'>
              <p className='font-bold text-green-500'>CARBONMARK</p>
              <span className='px-2 py-0.5 text-xs font-semibold bg-white text-neutral-900 rounded'>APP</span>
            </div>
          </Link>

          {/* User Profile Section */}
          <div className='flex items-center gap-4'>
            {/* User Info */}
            <div className='flex items-center gap-3 bg-neutral-800 hover:bg-neutral-700 transition px-4 py-2 rounded-lg cursor-pointer'>
              <div className='bg-neutral-600 rounded-full p-2'>
                <User size={20} color="#ffffff" />
              </div>
              {isLoading ? (
                <div className="w-20 h-4 bg-neutral-700 animate-pulse rounded"></div>
              ) : (
                <span className='text-white font-medium'>{userName}</span>
              )}
            </div>

            {/* Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='bg-neutral-800 hover:bg-neutral-700 transition p-3 rounded-lg'
            >
              <Menu size={20} color="#ffffff" />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className='absolute right-6 top-16 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl py-2 min-w-[200px] z-50'>
            <NavLink
              to="/evowner"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm transition ${
                  isActive ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-neutral-700 hover:text-white'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/evowner/wallet"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm transition ${
                  isActive ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-neutral-700 hover:text-white'
                }`
              }
            >
              Wallet
            </NavLink>
            <NavLink
              to="/evowner/listings"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm transition ${
                  isActive ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-neutral-700 hover:text-white'
                }`
              }
            >
              Listings
            </NavLink>
            <hr className='my-2 border-neutral-700' />
            <NavLink
              to="/Home"
              onClick={() => setIsMenuOpen(false)}
              className='block px-4 py-2 text-sm text-gray-300 hover:bg-neutral-700 hover:text-white transition'
            >
              Home
            </NavLink>
            <NavLink
              to="/About"
              onClick={() => setIsMenuOpen(false)}
              className='block px-4 py-2 text-sm text-gray-300 hover:bg-neutral-700 hover:text-white transition'
            >
              About
            </NavLink>
            <NavLink
              to="/Contact"
              onClick={() => setIsMenuOpen(false)}
              className='block px-4 py-2 text-sm text-gray-300 hover:bg-neutral-700 hover:text-white transition'
            >
              Contact
            </NavLink>
            <hr className='my-2 border-neutral-700' />
            <button
              onClick={() => {
                // Add logout logic here
                localStorage.removeItem('userName');
                window.location.href = '/';
              }}
              className='block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-700 hover:text-red-300 transition'
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}

export default NavEVowner;