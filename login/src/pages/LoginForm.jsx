import React from 'react';
import { Link } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaCheck, FaTimes, FaBriefcase, FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { CircleCheckBig } from 'lucide-react';
import backgroundImage from '../image/background.png';
import logoImage from '../image/logo1.png';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogleLogin = () => {
        console.log('Google login clicked');
    };

    const handleFacebookLogin = () => {
        console.log('Facebook login clicked');
    };

    useEffect(() => {
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            setFormData(prev => ({
                ...prev,
                username: savedUsername,
                rememberMe: true
            }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name] && touched[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({
            ...prev,
            [field]: true
        }));
    };

    const validateField = (field, value) => {
        let error = '';

        switch (field) {
            case 'username':
                if (!value) {
                    error = 'Username is required';
                } else if (value.length < 3) {
                    error = 'Username must be at least 3 characters';
                }
                break;

            case 'password':
                if (!value) {
                    error = 'Password is required';
                } else if (value.length < 8) {
                    error = 'Password must be at least 8 characters';
                }
                break;

            default:
                break;
        }

        setErrors(prev => ({
            ...prev,
            [field]: error
        }));

        return error;
    };

    const validateAllFields = () => {
        const newErrors = {};
        ['username', 'password'].forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
            }
        });

        setErrors(newErrors);

        setTouched({
            username: true,
            password: true
        });

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateAllFields()) {
            // Handle Remember Me
            if (formData.rememberMe) {
                localStorage.setItem('rememberedUsername', formData.username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            console.log('Form submitted:', formData);
            // Add your login logic here
        } else {
            console.log('Form has errors');
        }
    };

    return (
        <>
            {/* Main Container */}
            <div className="min-h-screen flex justify-center items-stretch gap-0 bg-gradient-to-br from-green-50 to-emerald-100 bg-no-repeat bg-contain relative" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'auto' }}>
                {/* Logo */}
                <div className="absolute top-[-70px] -ml-160 h-60 pointer-events-none ">
                    <img
                        src={logoImage}
                        alt="Carbon Credit Marketplace"
                        className="w-100 h-auto"
                    />
                </div>

                <div className="flex items-stretch gap-0 max-w-[1400px] w-full pt-32">
                    {/* Left Side - Marketing Content */}
                    <div className="flex-1 flex items-center justify-end px-12 mt-5 mr-20">
                        <div className="max-w-2xl pr-8">
                            <h1 className="text-[19.2px] font-medium text-gray-500 mb-6 w-150">
                                The premier platform for carbon credit trading. Join thousands building sustainable businesses.
                            </h1>
                            <p className="text-2xl font-bold text-dark mb-5">
                                Welcome Back to CarbonTrade
                            </p>
                            <div className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl"><CircleCheckBig size={26} color="#2bff00" /></span>
                                    <span className="text-gray-700">Track your performance with real-time dashboards and detailed reports</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl"><CircleCheckBig size={26} color="#2bff00" /></span>
                                    <span className="text-gray-700">Industry-leading security with verified transactions and secure payments</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl"><CircleCheckBig size={26} color="#2bff00" /></span>
                                    <span className="text-gray-700">Connect with buyers worldwide and expand your market reach</span>
                                </div>
                            </div>

                            {/* Stats - Improved Design */}
                            <div className="grid grid-cols-3 gap-4 mt-8">
                                <div className="text-center p-5 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-green-600 mb-1">10M+</div>
                                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Credits Traded</div>
                                </div>
                                <div className="text-center p-5 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-green-600 mb-1">5,000+</div>
                                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Active Sellers</div>
                                </div>
                                <div className="text-center p-5 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-green-600 mb-1">150+</div>
                                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Countries</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-[525px] flex items-center justify-start py-6 pl-8 pr-12 -mt-50">
                        <div className='bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-2xl w-full' style={{ boxShadow: '0 0 40px rgba(0, 0, 0, 0.1), 0 0 80px rgba(34, 197, 94, 0.15)' }}>
                            <h1 className='text-3xl font-bold text-center mb-4 text-black'>Welcome Back</h1>
                            <p className='text-center text-gray-600 mb-6'>Ready to make an impact?</p>

                            <form onSubmit={handleSubmit} noValidate>
                                {/* Username Field */}
                                <div className='mb-4'>
                                    <label htmlFor='username' className='block text-xs font-medium text-gray-700 mb-1'>
                                        Username
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="text-gray-400 text-sm" />
                                        </div>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            onBlur={() => handleBlur('username')}
                                            className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${touched.username && errors.username ? 'border-red-500' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700`}
                                            placeholder='Enter your username'
                                        />
                                    </div>
                                    {touched.username && errors.username && (
                                        <p className="text-red-500 text-[10px] mt-1">{errors.username}</p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className='mb-4'>
                                    <label htmlFor='password' className='block text-xs font-medium text-gray-700 mb-1'>
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="text-gray-400 text-sm" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onBlur={() => handleBlur('password')}
                                            className={`block w-full pl-10 pr-10 py-2.5 text-sm border ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700`}
                                            placeholder='Enter your password'
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                        >
                                            {showPassword ? (
                                                <FaEyeSlash className="text-gray-400 text-sm hover:text-gray-600" />
                                            ) : (
                                                <FaEye className="text-gray-400 text-sm hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                    {touched.password && errors.password && (
                                        <p className="text-red-500 text-[10px] mt-1">{errors.password}</p>
                                    )}
                                </div>

                                {/* Remember Me and Forgot Password */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="rememberMe"
                                            name="rememberMe"
                                            checked={formData.rememberMe}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-green-500 bg-white border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                                        />
                                        <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 cursor-pointer select-none">
                                            Remember me
                                        </label>
                                    </div>
                                    <Link to="/forgot-password" className="text-sm text-green-500 hover:text-green-600 font-medium">
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="text-center w-full mb-4 text-[19px] rounded-lg bg-green-500 py-3 hover:bg-green-600 transition-colors duration-300 text-white font-medium"
                                >
                                    Log In
                                </button>

                                {/* Divider */}
                                <div className="flex items-center my-4">
                                    <div className="flex-1 border-t border-gray-400"></div>
                                    <span className="px-3 text-gray-600 text-[15px]">or continue with</span>
                                    <div className="flex-1 border-t border-gray-400"></div>
                                </div>

                                {/* Social Login Buttons */}
                                <div className="flex gap-2 mb-4">
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-slate-200 text-gray-800 py-2 rounded hover:bg-gray-100 transition-colors duration-300"
                                    >
                                        <FaGoogle className="text-sm" />
                                        <span className="font-medium text-s">Google</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleFacebookLogin}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#1877F2] text-white py-2 rounded hover:bg-[#166FE5] transition-colors duration-300"
                                    >
                                        <FaFacebook className="text-sm" />
                                        <span className="font-medium text-s">Facebook</span>
                                    </button>
                                </div>

                                {/* Register Link */}
                                <span className="text-center text-[15px] block text-black">
                                    Don't have an account? <Link to="/Register" className="font-semibold text-green-500 hover:text-green-400">Sign Up</Link>
                                </span>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginForm;