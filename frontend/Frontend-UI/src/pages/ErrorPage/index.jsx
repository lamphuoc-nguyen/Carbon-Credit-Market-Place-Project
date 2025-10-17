import React, { useState, useEffect } from 'react';
import { Home, ArrowLeft, Search, Leaf, TreePine, Sprout } from 'lucide-react';
import { Link} from 'react-router-dom';

const ErrorPage = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [IsHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 20 - 10,
                y: (e.clientY / window.innerHeight) * 20 - 10
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const floatingIcons = [
        { Icon: Leaf, delay: 0, duration: 3 },
        { Icon: TreePine, delay: 0.5, duration: 4 },
        { Icon: Sprout, delay: 1, duration: 3.5 },
        { Icon: Leaf, delay: 1.5, duration: 3.2 },
        { Icon: TreePine, delay: 2, duration: 3.8 }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
            {/* Animated Background Shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Floating Icons */}
            {floatingIcons.map((item, index) => (
                <div
                    key={index}
                    className="absolute text-green-300 opacity-20"
                    style={{
                        left: `${15 + index * 20}%`,
                        top: `${20 + index * 15}%`,
                        animation: `float ${item.duration}s ease-in-out infinite`,
                        animationDelay: `${item.delay}s`
                    }}
                >
                    <item.Icon size={40 + index * 8} />
                </div>
            ))}

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
                <div className="max-w-4xl w-full">
                    {/* Error Code with 3D Effect */}
                    <div
                        className="text-center mb-8 perspective-1000"
                        style={{
                            transform: `rotateX(${mousePosition.y * 0.5}deg) rotateY(${mousePosition.x * 0.5}deg)`,
                            transition: 'transform 0.1s ease-out'
                        }}
                    >
                        <div className="relative inline-block">
                            <h1 className="text-[180px] md:text-[240px] font-black text-transparent bg-clip-text bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 leading-none select-none">
                                404
                            </h1>
                            <div className="absolute inset-0 text-[180px] md:text-[240px] font-black text-green-500 opacity-20 blur-2xl leading-none">
                                404
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    <div className="text-center mb-12 space-y-4">
                        <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
                            Oops! Page Not Found
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-500 mx-auto rounded-full mb-6"></div>
                        <p className="text-xl md:text-2xl text-gray-600 font-medium mb-4">
                            The page you're looking for has wandered off into the forest.
                        </p>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Don't worry though - even the best explorers sometimes take a wrong turn.
                            Let's get you back on the right path to our carbon offset projects.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <button
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="group relative bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Link to="/home">
                                <span className="relative flex items-center justify-center gap-2">
                                    <Home size={24} />
                                    Back to Home
                                </span>
                            </Link>
                        </button>
                    </div>

                    {/* Search Suggestion */}
                    <div className="max-w-xl mx-auto mb-12">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-4 rounded-xl">
                                    <Search className="text-white" size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                                        Try searching instead?
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Find the carbon project you're looking for
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats or Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {[
                            { icon: Leaf, title: "100+ Projects", desc: "Carbon offset initiatives" },
                            { icon: TreePine, title: "50K+ Trees", desc: "Planted worldwide" },
                            { icon: Sprout, title: "Verified Impact", desc: "Certified & tracked" }
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-green-100"
                            >
                                <div className="bg-gradient-to-br from-green-400 to-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                    <item.icon className="text-white" size={28} />
                                </div>
                                <h4 className="font-bold text-gray-800 text-xl mb-2 text-center">
                                    {item.title}
                                </h4>
                                <p className="text-gray-600 text-center">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Banner */}
            <div className="relative z-10 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white py-16 px-10">
                <div className="max-w-6xl mx-auto text-center">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                        Need Help Finding Something?
                    </h3>
                    <p className="text-lg md:text-xl opacity-95 mb-6">
                        Explore our carbon offset projects or contact our support team for assistance.
                    </p>
                    <Link to="/contact">
                        <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transform hover:scale-105 transition-all duration-300 shadow-xl">
                            Contact Support
                        </button>
                    </Link>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
            `}</style>
        </div>
    );
};

export default ErrorPage;