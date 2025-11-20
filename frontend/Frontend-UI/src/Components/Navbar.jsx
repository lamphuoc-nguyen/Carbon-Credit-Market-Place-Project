import React, { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { getValidToken } from '../utils/tokenUtils';
    

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);

    // Check authentication status on component mount and when storage changes
    useEffect(() => {
        const checkAuth = () => {
            const token = getValidToken();
            setIsAuthenticated(!!token);

            if (token) {
                // Get user data to determine role
                const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
                if (userStr) {
                    try {
                        const userData = JSON.parse(userStr);
                        setUserRole(userData.role);
                    } catch (error) {
                        console.error('Error parsing user data:', error);
                        setUserRole(null);
                    }
                }
            } else {
                setUserRole(null);
            }
        };

        checkAuth();

        // Listen for storage changes (login/logout from other tabs)
        const handleStorageChange = () => {
            checkAuth();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Get the appropriate dashboard link based on role
    const getDashboardLink = () => {
        if (userRole === 'EV_OWNER') {
            return '/ev-dashboard'; // EV Owner primary dashboard
        } else if (userRole === 'BUYER') {
            return '/marketplace'; // Buyer primary dashboard is marketplace
        }
        return '/marketplace'; // Default fallback
    };

    // Get marketplace link for cross-functional access
    const getMarketplaceLink = () => {
        return '/marketplace'; // Both roles can access marketplace
    };

    const getDashboardText = () => {
        if (userRole === 'EV_OWNER') {
            return 'Dashboard';
        } else if (userRole === 'BUYER') {
            return 'Marketplace';
        }
        return 'Dashboard'; // Default fallback
    };

    return (
        <div className='border-b border-gray-300 relative z-50'>
            <nav className='max-w-7xl max-h-18 mx-auto px-6 flex justify-between items-center'>
                <div className="container flex justify-between ">

                    {/*Logo*/}
                    <Link to="/home" className="flex text-2xl items-center gap-2 py-4 px-23 cursor-pointer">
                        <Leaf size={32} color="#2bff00" />
                        <p className='font-bold text-green-500 '>Carbon Credit</p>
                        <p className='text-gray-500 font-sans'>MarketPlace</p>
                    </Link>

                    {/*Menu*/}
                    <div className=''>
                        <ul className='flex items-center gap-6 py-5 px-3 '>
                            <li className='inline-block py-1 px-5 text-[16px] hover:text-green-500 font-semibold rounded-lg transition -all duration-300 hover:bg-gray-200'>
                                <NavLink
                                    to="/home"
                                    className={({ isActive }) =>
                                        isActive ? 'text-green-500' : 'text-gray-500'
                                    }
                                >
                                    Home
                                </NavLink>
                            </li>
                            <li className='inline-block py-1 px-5 text-[16px] hover:text-green-500 font-semibold rounded-lg transition -all duration-300 hover:bg-gray-200'>
                                <NavLink
                                    to="/about"
                                    className={({ isActive }) =>
                                        isActive ? 'text-green-500' : 'text-gray-500'
                                    }
                                >
                                    About
                                </NavLink>
                            </li>
                            <li className='inline-block py-1 px-5 text-[16px] hover:text-green-500 font-semibold rounded-lg transition -all duration-300 hover:bg-gray-200'>
                                <NavLink
                                    to="/contact"
                                    className={({ isActive }) =>
                                        isActive ? 'text-green-500' : 'text-gray-500'
                                    }
                                >
                                    Contact
                                </NavLink>
                            </li>

                            {/* Authentication-aware menu items */}
                            {isAuthenticated ? (
                                <>
                                    {/* Marketplace link for all authenticated users */}
                                    <li className='inline-block py-1 px-5 text-[16px] hover:text-green-500 font-semibold rounded-lg transition -all duration-300 hover:bg-gray-200'>
                                        <NavLink
                                            to={getMarketplaceLink()}
                                            className={({ isActive }) =>
                                                isActive ? 'text-green-500' : 'text-gray-500'
                                            }
                                        >
                                            Marketplace
                                        </NavLink>
                                    </li>

                                    {/* Dashboard button based on role */}
                                    <li className='inline-block py-2.5 px-5 text-[16px] text-white bg-green-500 rounded-lg font-semibold transition hover:bg-green-600 shadow-sm border-green-700'>
                                        <NavLink to={getDashboardLink()}>{getDashboardText()}</NavLink>
                                    </li>
                                </>
                            ) : (
                                // When NOT logged in: Show Sign In and Register buttons
                                <>
                                    <li className='inline-block py-2.5 px-5 text-[16px] text-white bg-green-500 rounded-lg font-semibold transition hover:bg-green-600 shadow-sm border-green-700'>
                                        <NavLink to="/login">Sign In</NavLink>
                                    </li>
                                    
                                </>
                            )}
                        </ul>
                    </div>

                </div >
            </nav >
        </div>
    );
};

export default Navbar;