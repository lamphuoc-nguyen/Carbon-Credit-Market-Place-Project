import React from 'react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
    return (
        <section className="bg-green-500 py-23  ">
            <div className="max-w-7xl mx-auto ">
                {/* Main Heading */}
                <h2 className="text-7xl  font-bold text-white mb-16 leading-tight">
                    Ready to take your climate action to the next level?
                </h2>

                {/* Buttons */}
                <div className="flex flex-col md:flex-row gap-64 mt-10 ">
                    {/* Buy Carbon Credits Button */}
                    <Link
                        to="/Register"
                        className="bg-white text-green-500 font-bold text-lg px-12 py-5 rounded-full hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        I want to buy carbon credits
                    </Link>

                    {/* Sell Carbon Credits Button */}
                    <Link
                        to="/Register"
                        className="bg-white text-green-500 font-bold text-lg px-12 py-5 rounded-full hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        I want to sell carbon credits
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CallToAction;
