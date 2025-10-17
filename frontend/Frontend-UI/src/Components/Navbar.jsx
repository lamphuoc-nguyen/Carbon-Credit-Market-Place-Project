import React, { useState, useEffect } from 'react';
import { Leaf, User, ChevronDown } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { getValidToken } from '../utils/tokenUtils';

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Check authentication status on component mount and when storage changes
    useEffect(() => {
        const checkAuth = () => {
            const token = getValidToken();
            setIsAuthenticated(!!token);
        };

        checkAuth();

        // Listen for storage changes (login/logout from other tabs)
        const handleStorageChange = () => {
            checkAuth();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <>
            <div className='border-b border-gray-300 relative z-50'>
                <nav className='max-w-7xl max-h-18 mx-auto px-6 flex justify-between items-center'>
                    <div className="container flex justify-between ">

                        {/*Logo*/}
                        <Link to="/Home" className="flex text-2xl items-center gap-2 py-4 px-23 cursor-pointer">
                            <Leaf size={32} color="#2bff00" />
                            <p className='font-bold text-green-500 '>Carbon Credit</p>
                            <p className='text-gray-500 font-sans'>MarketPlace</p>
                        </Link>

                        {/*Menu*/}
                        <div className=''>
                            <ul className='flex items-center gap-6 py-5 px-3 '>
                                <li className='inline-block py-1 px-5 text-[16px] hover:text-green-500 font-semibold rounded-lg transition -all duration-300 hover:bg-gray-200'>
                                    <NavLink
                                        to="/Home"
                                        className={({ isActive }) =>
                                            isActive ? 'text-green-500' : 'text-gray-500'
                                        }
                                    >
                                        Home
                                    </NavLink>
                                </li>
                                <li className='inline-block py-1 px-5 text-[16px] hover:text-green-500 font-semibold rounded-lg transition -all duration-300 hover:bg-gray-200'>
                                    <NavLink
                                        to="/About"
                                        className={({ isActive }) =>
                                            isActive ? 'text-green-500' : 'text-gray-500'
                                        }
                                    >
                                        About
                                    </NavLink>
                                </li>
                                <li className='inline-block py-1 px-5 text-[16px] hover:text-green-500 font-semibold rounded-lg transition -all duration-300 hover:bg-gray-200'>
                                    <NavLink
                                        to="/Contact"
                                        className={({ isActive }) =>
                                            isActive ? 'text-green-500' : 'text-gray-500'
                                        }
                                    >
                                        Contact
                                    </NavLink>
                                </li>

                                {/* Authentication-aware menu items */}
                                {isAuthenticated ? (
                                    // Authenticated user menu - Show logout button
                                    <>
                                        <li className="relative">
                                            <button
                                                onClick={() => setShowUserMenu(!showUserMenu)}
                                                className="flex items-center gap-2 py-2 px-4 text-[16px] text-gray-700 hover:text-green-500 font-semibold rounded-lg transition-all duration-300 hover:bg-gray-200"
                                            >
                                                <User size={20} />
                                                <span>My Account</span>
                                                <ChevronDown size={16} className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Dropdown menu */}
                                            {showUserMenu && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                                                    <Link
                                                        to="/dashboard"
                                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        Dashboard
                                                    </Link>
                                                    <Link
                                                        to="/profile"
                                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        Profile Settings
                                                    </Link>
                                                    <div className="border-t border-gray-200 my-2"></div>
                                                    <div className="px-2">
                                                        <LogoutButton
                                                            variant="dropdown"
                                                            className="w-full text-left"
                                                            showText={true}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </li>
                                        {/* ✅ FIXED: Only show logout button when authenticated */}
                                        <li className='inline-block'>
                                            <LogoutButton
                                                variant="button"
                                                className="text-sm"
                                                showText={true}
                                            />
                                        </li>
                                    </>
                                ) : (
                                    // ✅ FIXED: Show Sign In / Sign Up when NOT authenticated
                                    <>
                                        <li className='inline-block py-1 px-5 text-[16px] hover:text-green-500 font-semibold rounded-lg transition -all duration-300 hover:bg-gray-200'>
                                            <NavLink
                                                to="/login"
                                                className={({ isActive }) =>
                                                    isActive ? 'text-green-500' : 'text-gray-500'
                                                }
                                            >
                                                Sign In
                                            </NavLink>
                                        </li>
                                        <li className='inline-block py-2.5 px-5 text-[16px] text-white bg-green-500 rounded-lg font-semibold transition hover:bg-green-600 shadow-sm border-green-700'>
                                            <NavLink to="/Register">Sign Up</NavLink>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>

                    </div >
                </nav >
            </div>

            {/* Overlay to close dropdown when clicking outside */}
            {showUserMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                ></div>
            )}
        </>
    );
};

export default Navbar;