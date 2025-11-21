import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { CircleCheckBig } from 'lucide-react';
import backgroundImage from '../image/background.png';
import logoImage from '../image/logo1.png';
import { authApi } from '../api';

const LoginForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        usernameOrEmail: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    const handleGoogleLogin = () => {
        console.log('Google OAuth2 login clicked');
        window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
    };

    const handleFacebookLogin = () => {
        console.log('GitHub OAuth2 login clicked');
        window.location.href = `${API_BASE_URL}/oauth2/authorization/github`;
    };

    useEffect(() => {
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            setFormData(prev => ({
                ...prev,
                usernameOrEmail: savedUsername,
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

        if (errors[name] && touched[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        if (errors.submit) {
            setErrors(prev => ({ ...prev, submit: '' }));
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({
            ...prev,
            [field]: true
        }));
        validateField(field, formData[field]);
    };

    const validateField = (field, value) => {
        let error = '';

        switch (field) {
            case 'usernameOrEmail':
                if (!value || typeof value !== 'string') {
                    error = 'Username or Email is required';
                } else if (value.length < 3) {
                    error = 'Username or Email must be at least 3 characters';
                }
                break;

            case 'password':
                if (!value || typeof value !== 'string') {
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
        const fieldsToValidate = ['usernameOrEmail', 'password'];

        fieldsToValidate.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
            }
        });

        setErrors(newErrors);
        setTouched({
            usernameOrEmail: true,
            password: true
        });

        return Object.keys(newErrors).length === 0;
    };

    const decodeToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("Invalid token:", error);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateAllFields()) {
            setIsLoading(true);
            setErrors({});

            try {
                const loginPayload = {
                    usernameOrEmail: formData.usernameOrEmail,
                    password: formData.password
                };

                const response = await authApi.login(loginPayload);
                console.log('✅ Login success (response data):', response);

                const token = response?.accessToken;

                if (!token) {
                    setErrors({
                        submit: 'Login successful, but no token was provided by the server.'
                    });
                    setIsLoading(false);
                    return;
                }

                const userPayload = decodeToken(token);
                console.log('Decoded user payload:', userPayload);

                if (!userPayload || !userPayload.role) {
                    setErrors({
                        submit: 'Invalid token received. Role not found.'
                    });
                    setIsLoading(false);
                    return;
                }

                const storage = formData.rememberMe ? localStorage : sessionStorage;
                storage.setItem('authToken', token);
                storage.setItem('user', JSON.stringify(userPayload));

                // Handle Remember Me for username
                if (formData.rememberMe) {
                    localStorage.setItem('rememberedUsername', formData.usernameOrEmail);
                } else {
                    localStorage.removeItem('rememberedUsername');
                }

                console.log('✅ Token and user info saved successfully');

                const userRole = userPayload.role;
                console.log('User role is:', userRole);

                switch (userRole) {
                    case 'CVA':
                        console.log('Redirecting CVA user to /cva/pending-verifications');
                        navigate('/cva');
                        break;

                    case 'ADMIN':
                        console.log('Redirecting Admin user to /admin/dashboard');
                        navigate('/admin/dashboard');
                        break;

                    case 'EV_OWNER':
                        console.log('Redirecting EV Owner to /ev-dashboard');
                        navigate('/ev-dashboard');
                        break;

                    case 'BUYER':
                        console.log('Redirecting Buyer to /marketplace');
                        navigate('/marketplace');
                        break;

                    default:
                        console.log('Redirecting default user to /home');
                        navigate('/home');
                }

            } catch (error) {
                console.error('❌ Login error:', error);
                if (error.response) {
                    const status = error.response.status;
                    const message = error.response.data?.message || error.response.data?.error;

                    const errorMessages = {
                        400: message || 'Invalid request',
                        401: 'Invalid username or password',
                        403: 'Account is locked or suspended',
                        404: 'User not found',
                        429: 'Too many login attempts. Please try again later.',
                        500: 'Server error. Please try again later.',
                        503: 'Service temporarily unavailable'
                    };

                    setErrors({
                        submit: errorMessages[status] || `Error ${status}: ${message || 'Please try again'}`
                    });
                } else if (error.request) {
                    setErrors({
                        submit: 'Unable to connect to server. Please check your connection.'
                    });
                } else {
                    setErrors({
                        submit: error.message || 'An unexpected error occurred'
                    });
                }
            } finally {
                setIsLoading(false);
            }
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

                            {/* Stats */}
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
                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                                        {errors.submit}
                                    </div>
                                )}

                                {/* Username/Email Field */}
                                <div className='mb-4'>
                                    <label htmlFor='usernameOrEmail' className='block text-xs font-medium text-gray-700 mb-1'>
                                        Username or Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="text-gray-400 text-sm" />
                                        </div>
                                        <input
                                            type="text"
                                            id="usernameOrEmail"
                                            name="usernameOrEmail"
                                            value={formData.usernameOrEmail}
                                            onChange={handleChange}
                                            onBlur={() => handleBlur('usernameOrEmail')}
                                            className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${touched.usernameOrEmail && errors.usernameOrEmail ? 'border-red-500' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700`}
                                            placeholder='Enter your username or email'
                                        />
                                    </div>
                                    {touched.usernameOrEmail && errors.usernameOrEmail && (
                                        <p className="text-red-500 text-[10px] mt-1">{errors.usernameOrEmail}</p>
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
                                    disabled={isLoading}
                                    className="text-center w-full mb-4 text-[19px] rounded-lg bg-green-500 py-3 hover:bg-green-600 transition-colors duration-300 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Signing In...
                                        </>
                                    ) : (
                                        'Log In'
                                    )}
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
                                        <span className="font-medium text-s">GitHub</span>
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
    );
};

export default LoginForm;