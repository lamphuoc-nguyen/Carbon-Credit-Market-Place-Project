import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <div className="bg-white flex items-center justify-between py-7 px-28 text-base border-t border-gray-300">
            <div>
                <ul className="flex gap-10 text-gray-500 ">
                    <Link to="/privacy-policy" className='hover:text-green-500 '>
                        <p>Privacy Policy</p>
                    </Link>

                    <Link to="/terms-of-service" className='hover:text-green-500 '>
                        <p>Terms of Service</p>
                    </Link>
                    <Link to="/contact-us" className='hover:text-green-500 '>
                        <p>Contact Us</p>
                    </Link>
                </ul>
            </div>
            <p className="text-gray-400 text-base">© 2025 Carbon Credit Marketplace. All rights reserved.</p>

        </div>
    )
};

export default Footer;