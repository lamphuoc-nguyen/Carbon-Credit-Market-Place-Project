import React from 'react';
import { Leaf } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {

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
                                <li className='inline-block py-1 px-5 text-[16px] hover:text-green-500 text-gray-500 font-semibold'>
                                    <NavLink
                                        to="/Home"
                                        className={({ isActive }) =>
                                            isActive ? 'text-green-500' : 'text-gray-500'
                                        }
                                    >
                                        Home
                                    </NavLink>
                                </li>
                                <li className='inline-block py-1 px-5 text-[16px] hover:text-green-500 text-gray-500 font-semibold'>
                                    <NavLink
                                        to="/About"
                                        className={({ isActive }) =>
                                            isActive ? 'text-green-500' : 'text-gray-500'
                                        }
                                    >
                                        About
                                    </NavLink>
                                </li>
                                <li className='inline-block py-1 px-5 text-[16px] hover:text-green-500 text-gray-500 font-semibold'>
                                    <NavLink
                                        to="/Contact"
                                        className={({ isActive }) =>
                                            isActive ? 'text-green-500' : 'text-gray-500'
                                        }
                                    >
                                        Contact
                                    </NavLink>
                                </li>
                                <li className='inline-block py-2.5 px-5 text-[16px] text-white bg-green-500 rounded-lg font-semibold transition hover:bg-green-600 shadow-sm border-green-700'>
                                    <NavLink to="/Register">Sign Up</NavLink>
                                </li>
                            </ul>
                        </div>

                    </div >
                </nav >
            </div>
        </>
    );
};

export default Navbar;