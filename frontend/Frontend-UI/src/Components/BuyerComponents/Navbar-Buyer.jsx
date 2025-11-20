import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  User, 
  Wallet, 
  ShoppingCart, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  BarChart3,
  Settings
} from 'lucide-react';
import { clearAuthData } from '../../utils/tokenUtils';
import userDataFetcher from '../../api/userDataFetcher';

export default function Navbar_Buyer() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        console.warn('⚠️ No token found');
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching user profile via centralized fetcher...');
      const response = await userDataFetcher.getUserProfile();
      const userData = response.data?.data || response.data;

      console.log('✅ User data received:', userData);
      setUser(userData);
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    
    clearAuthData();
    
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    
    console.log('✅ Auth data cleared, redirecting to home...');
    window.location.href = '/home';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Leaf size={32} className="text-green-500 animate-pulse" />
              <span className="text-gray-400">Loading...</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/buyer" className="flex items-center gap-2 cursor-pointer group">
            <Leaf size={32} className="text-green-500 group-hover:rotate-12 transition-transform duration-300" />
            <div className="hidden sm:block">
              <span className="font-bold text-green-500 text-xl">Carbon Credit</span>
              <span className="text-gray-500 text-sm ml-2">Buyer</span>
            </div>
          </Link>

          {/* User Profile Dropdown - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-gray-700">{user?.fullName || user?.username || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Buyer'}</p>
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-700">{user?.fullName || user?.username || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'buyer@example.com'}</p>
                  </div>
                  <Link
                    to="/buyer"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <BarChart3 size={16} />
                    Dashboard
                  </Link>
                  <Link
                    to="/wallet"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <Wallet size={16} />
                    My Wallet
                  </Link>
                  <Link
                    to="/marketplace"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <ShoppingCart size={16} />
                    Marketplace
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">{user?.fullName || user?.username || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'buyer@example.com'}</p>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              <Link
                to="/buyer"
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BarChart3 size={20} />
                Dashboard
              </Link>

              <Link
                to="/wallet"
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Wallet size={20} />
                My Wallet
              </Link>

              <Link
                to="/marketplace"
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart size={20} />
                Marketplace
              </Link>

              <Link
                to="/portfolio"
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BarChart3 size={20} />
                Carbon Portfolio
              </Link>

              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings size={20} />
                Settings
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}