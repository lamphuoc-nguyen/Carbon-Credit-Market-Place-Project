import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { 
  Leaf, 
  User, 
  Wallet, 
  Car, 
  MapPin, 
  Award, 
  ShoppingCart, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  List
} from 'lucide-react'
import { userApi } from '../../api/userApi'

function Navbar() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        
        // Check if token exists before making API call
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
        
        if (!token) {
          console.warn('⚠️ No token found in storage, redirecting to login')
          navigate('/login')
          return
        }
        
        console.log('🔍 Token found, fetching user data...')
        const userData = await userApi.getCurrentUser()
        console.log('✅ User data fetched:', userData)
        setUser(userData)
      } catch (error) {
        console.error('❌ Failed to fetch user:', error)
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        
        // Only redirect to login for authentication errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.warn('🔐 Authentication failed, redirecting to login')
          navigate('/login')
        } else {
          // For other errors, show error but don't redirect
          console.error('⚠️ API error, but not redirecting:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('user')
    navigate('/login')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen)
  }

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
    )
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/ev-dashboard" className="flex items-center gap-2 cursor-pointer group">
            <Leaf size={32} className="text-green-500 group-hover:rotate-12 transition-transform duration-300" />
            <div className="hidden sm:block">
              <span className="font-bold text-green-500 text-xl">Carbon Credit</span>
              <span className="text-gray-500 text-sm ml-2">EV Owner</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          

          {/* User Profile Dropdown */}
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
                  <p className="text-sm font-semibold text-gray-700">{user?.fullName || user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-700">{user?.fullName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/ev-dashboard/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <Link
                    to="/ev-dashboard/journeys"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <MapPin size={16} />
                    Journeys
                  </Link>
                  <Link
                    to="/ev-dashboard/wallet"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <Wallet size={16} />
                    Wallet
                  </Link>
                  <Link
                    to="/ev-dashboard/marketplace"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <ShoppingCart size={16} />
                    Marketplace
                  </Link>
                  <Link
                    to="/ev-dashboard/Listing"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <List size={16} />
                    Listing
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
                <p className="text-sm font-semibold text-gray-700">{user?.fullName || user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              <NavLink
                to="/ev-dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Award size={20} />
                Dashboard
              </NavLink>

              <NavLink
                to="/ev-dashboard/vehicles"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Car size={20} />
                My Vehicles
              </NavLink>

              <NavLink
                to="/ev-dashboard/journeys"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MapPin size={20} />
                Journeys
              </NavLink>

              <NavLink
                to="/ev-dashboard/marketplace"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart size={20} />
                Marketplace
              </NavLink>

              <NavLink
                to="/ev-dashboard/wallet"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Wallet size={20} />
                Wallet
              </NavLink>

              <NavLink
                to="/ev-dashboard/profile"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={20} />
                My Profile
              </NavLink>

              <button
                onClick={() => {
                  handleLogout()
                  setIsMobileMenuOpen(false)
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
  )
}

export default Navbar