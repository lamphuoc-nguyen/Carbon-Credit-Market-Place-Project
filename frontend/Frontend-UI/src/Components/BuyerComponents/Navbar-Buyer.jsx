'use client';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../../image/logo2.png';
import { clearAuthData } from '../../utils/tokenUtils';
import { userApi } from '../../api';

export default function Navbar_Buyer() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        console.warn('⚠️ No token found - showing as User');
        setUserName('User');
        return;
      }

      console.log('🔍 Fetching user profile...');
      const userData = await userApi.getCurrentUser();
      
      console.log('✅ User data received:', userData);
      console.log('📋 Roles array:', userData.roles);
      console.log('📋 Role property:', userData.role);
      
      // Check if user has BUYER role - multiple possible structures
      const hasBuyerRole = 
        // Check roles array
        userData.roles?.some(role => 
          role.name === 'BUYER' || 
          role.roleName === 'BUYER' ||
          role === 'BUYER'
        ) ||
        // Check single role property
        userData.role === 'BUYER' ||
        userData.role?.name === 'BUYER' ||
        userData.role?.roleName === 'BUYER';
      
      console.log('🔍 Has Buyer Role:', hasBuyerRole);
      
      // Only show username if user has BUYER role
      if (hasBuyerRole) {
        setUserName(userData.username || userData.fullName || 'User');
        console.log('✅ Buyer role confirmed. Username set to:', userData.username || userData.fullName);
      } else {
        setUserName('User');
        console.log('⚠️ User does not have BUYER role. Displaying as "User"');
      }
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      console.error('Error details:', error.response?.data);
      setUserName('User');
    }
  };

  // Hàm xử lý logout
  const handleLogout = () => {
    console.log('🚪 Logging out...');
    
    // Xóa tất cả authentication data và cookies
    clearAuthData();
    
    // Xóa các cookies khác nếu có
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Đóng menu
    setMenuOpen(false);
    
    console.log('✅ Auth data cleared, redirecting to home...');
    
    // Chuyển về trang home và reload
    window.location.href = '/home';
  };

  return (
    <nav className="bg-emerald-400 shadow-md sticky top-0 z-50 ">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Bên Trái */}
          <div className="flex items-center">
            <Link to="/buyer" className="flex items-center space-x-3">
                <div className="w-24 h-24 flex items-center justify-center">
                    <img src={logoImage} alt="Logo" className="w-24 h-24" />
                </div>
                <div className="flex flex-row items-center gap-2">
                    <p className='font-bold text-emerald-700 text-3xl'>CARBON CREDIT</p>
                    <p className='text-gray-600 font-sans text-3xl font-semibold'>MarketPlace</p>
                </div>
            </Link>
          </div>

          {/* Bên Phải - Tên User và Menu Button */}
          <div className="flex items-center space-x-4">
            {/* User Name */}
            <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-gray-700 font-medium hidden sm:inline-block">
                {userName}
              </span>
            </div>

            {/* Menu Button (Ba Gạch) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <svg 
                className="h-7 w-7" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 mr-4 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">Active User</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/buyer"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 font-bold"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>

            <Link
              to="/wallet"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 font-bold"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              My Wallet
            </Link>

            <Link
              to="/marketplace"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 font-bold"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Marketplace
            </Link>

            <Link
              to="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 font-bold"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
          </div>

          {/* Logout Section */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 font-bold cursor-pointer"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}