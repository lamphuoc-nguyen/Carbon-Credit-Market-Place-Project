import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';
import { CircleCheckBig } from 'lucide-react';
import backgroundImage from '../image/background.png';
import logoImage from '../image/logo1.png';
import { authApi } from '../api';

interface FormData {
    username: string;
    password: string;
    rememberMe: boolean;
}

interface FormErrors {
    username?: string;
    password?: string;
    submit?: string;
}

interface TouchedFields {
    username?: boolean;
    password?: boolean;
}

const LoginForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        username: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<TouchedFields>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = () => {
        console.log('Google login clicked');
        // TODO: Implement OAuth
    };

    const handleFacebookLogin = () => {
        console.log('Facebook login clicked');
        // TODO: Implement OAuth
    };

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

        // ✅ Clear submit error when user types
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

    // ✅ HANDLESUBMIT ĐÃ SỬA
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateAllFields()) {
            setIsLoading(true);
            setErrors({});

            try {
                // ✅ authApi.login() giờ sẽ throw error nếu success: false
                const response = await authApi.login({
                    username: formData.username,
                    password: formData.password
                });

                console.log('✅ Login success:', response);

                // ✅ DEFENSIVE CHECK: Double-check response
                if (!response || response.success === false || !response.token) {
                    setErrors({
                        submit: response?.message || 'Invalid username or password'
                    });
                    return; // ⚠️ DỪNG LẠI, KHÔNG NAVIGATE
                }

                // ✅ Save token based on remember me
                const storage = formData.rememberMe ? localStorage : sessionStorage;
                storage.setItem('authToken', response.token);

                if (response.user) {
                    storage.setItem('user', JSON.stringify(response.user));
                }

                // ✅ CHỈ navigate khi thực sự thành công
                navigate('/dashboard');

            } catch (error) {
                console.error('❌ Login error:', error);

                // ✅ Better error handling
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
                        submit: errorMessages[status] || message || 'Login failed'
                    });
                } else if (error.request) {
                    if (error.code === 'ECONNABORTED') {
                        setErrors({ submit: 'Request timeout. Please try again.' });
                    } else {
                        setErrors({ submit: 'Cannot connect to server. Check your connection.' });
                    }
                } else {
                    // ✅ Catch validation errors from authApi
                    setErrors({
                        submit: error.message || 'An unexpected error occurred.'
                    });
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <>
            <div className="min-h-screen flex justify-center items-stretch gap-0 bg-gradient-to-br from-green-50 to-emerald-100 bg-no-repeat bg-contain relative"
                style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'auto' }}>

                {/* ✅ Logo - Fixed positioning */}
                <div className="absolute top-4 left-8 h-40 pointer-events-none z-10">
                    <img
                        src={logoImage}
                        alt="Carbon Credit Marketplace"
                        className="h-full w-auto object-contain"
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
                        <div className='bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-2xl w-full'
                            style={{ boxShadow: '0 0 40px rgba(0, 0, 0, 0.1), 0 0 80px rgba(34, 197, 94, 0.15)' }}>
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
                                            disabled={isLoading}
                                            autoComplete="username"
                                            className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${touched.username && errors.username ? 'border-red-500' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed`}
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
                                            disabled={isLoading}
                                            autoComplete="current-password"
                                            className={`block w-full pl-10 pr-10 py-2.5 text-sm border ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                            placeholder='Enter your password'
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={isLoading}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer disabled:cursor-not-allowed"
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

                                {/* ✅ Server Error Message */}
                                {errors.submit && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-red-600 text-sm font-medium">{errors.submit}</p>
                                    </div>
                                )}

                                {/* Remember Me and Forgot Password */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="rememberMe"
                                            name="rememberMe"
                                            checked={formData.rememberMe}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                            className="w-4 h-4 text-green-500 bg-white border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer disabled:cursor-not-allowed"
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
                                    className="text-center w-full mb-4 text-[19px] rounded-lg bg-green-500 py-3 hover:bg-green-600 transition-colors duration-300 text-white font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Logging in...
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
                                        disabled={isLoading}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-slate-200 text-gray-800 py-2 rounded hover:bg-gray-100 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        <FaGoogle className="text-sm" />
                                        <span className="font-medium text-s">Google</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleFacebookLogin}
                                        disabled={isLoading}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#1877F2] text-white py-2 rounded hover:bg-[#166FE5] transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
    );
};

export default LoginForm;