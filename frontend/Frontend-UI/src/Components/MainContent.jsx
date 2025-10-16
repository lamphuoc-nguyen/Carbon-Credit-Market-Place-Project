import React from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../image/bghome.png';
import logoImage from '../image/logo.png';

const MainContent = () => {
    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background Image or Pattern */}
            {backgroundImage ? (
                <div className="absolute inset-0">
                    <img
                        src={backgroundImage}
                        alt="Background"
                        className="w-full h-full object-cover"
                    />

                </div>
            ) : (
                // Fallback gradient background
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-orange-50"></div>
            )}

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
                {/* Logo - Add your logo here */}
                <div className="mb-40">
                    <img
                        src={logoImage}
                        alt="Carbon Credit Logo"
                        className="w-100 h-100 object-contain top-[-50px] left-145 absolute "
                    />
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-green-500 mb-8 max-w-5xl leading-tight">
                    Scaling Climate Finance with a Global Carbon Credits Marketplace
                </h1>

                {/* Description */}
                <p className="text-lg md:text-xl text-gray-700 text-center mb-12 max-w-4xl leading-relaxed">
                    Digital infrastructure that connects what matters to empower every actor across environmental markets
                </p>

                {/* CTA Button */}
                <Link
                    to="/marketplace"
                    className="px-12 py-4 bg-green-500 text-white text-lg font-semibold rounded-full hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    Go to Marketplace
                </Link>
            </div>
        </div>
    );
};

export default MainContent;
