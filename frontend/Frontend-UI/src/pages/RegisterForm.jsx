import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';
import { CircleCheckBig } from 'lucide-react';
import backgroundImage from '../image/background.png';
import logoImage from '../image/logo1.png';
import { authApi } from '../api';

const RegisterForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = () => {
        console.log('Google OAuth2 login clicked');
        // Redirect to backend OAuth2 endpoint for Google
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const handleFacebookLogin = () => {
        console.log('Facebook OAuth2 login clicked');
        // Redirect to backend OAuth2 endpoint for GitHub (using GitHub instead of Facebook)
        window.location.href = 'http://localhost:8080/oauth2/authorization/github';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing (only if form was submitted)
        if (errors[name] && touched[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleBlur = (field) => {
        // Only mark as touched, don't validate until form submission
        setTouched(prev => ({
            ...prev,
            [field]: true
        }));
    };

    const validateField = (field, value) => {
        let error = '';

        switch (field) {
            case 'fullName':
                if (!value) {
                    error = 'Full name is required';
                } else if (value.length < 2) {
                    error = 'Full name must be at least 2 characters';
                } else if (value.length > 50) {
                    error = 'Full name must be less than 50 characters';
                }
                break;

            case 'email':
                if (!value) {
                    error = 'Email is required';
                } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                    error = 'Invalid email address';
                }
                break;

            case 'username':
                if (!value) {
                    error = 'Username is required';
                } else if (value.length < 3) {
                    error = 'Username must be at least 3 characters';
                } else if (value.length > 20) {
                    error = 'Username must be less than 20 characters';
                } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    error = 'Username can only contain letters, numbers, and underscores';
                }
                break;

            case 'phone':
                if (!value) {
                    error = 'Phone number is required';
                } else if (!/^[\d\s\-+()]+$/.test(value)) {
                    error = 'Invalid phone number format';
                } else if (value.replace(/\D/g, '').length < 10) {
                    error = 'Phone number must be at least 10 digits';
                }
                break;

            case 'password':
                if (!value) {
                    error = 'Password is required';
                } else if (value.length < 8) {
                    error = 'Password must be at least 8 characters';
                } else if (!/(?=.*\d)/.test(value)) {
                    error = 'Password must contain at least one number';
                } else if (!/(?=.*[^a-zA-Z\d])/.test(value)) {
                    error = 'Password must contain at least one special character';
                }
                break;

            case 'confirmPassword':
                if (!value) {
                    error = 'Please confirm your password';
                } else if (value !== formData.password) {
                    error = 'Passwords do not match';
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
        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
            }
        });

        // Set errors state
        setErrors(newErrors);

        // Mark all fields as touched
        setTouched({
            fullName: true,
            email: true,
            username: true,
            phone: true,
            password: true,
            confirmPassword: true
        });

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateAllFields()) {
            setIsLoading(true);
            setErrors({});

            try {
                // ✅ Gọi API register với dữ liệu form
                const response = await authApi.register({
                    fullName: formData.fullName,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone
                });

                console.log('✅ Register success - Full response:', response);

                // ✅ FIX: Extract accessToken from AuthResponseDto structure
                const token = response.accessToken || response.data?.accessToken;

                if (token) {
                    console.log('🔵 Storing token from registration:', token.substring(0, 20) + '...');
                    localStorage.setItem('authToken', token);

                    // ✅ CRITICAL FIX: Set token in axios defaults immediately for subsequent requests
                    const axios = (await import('../api/axiosInstance')).default;
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    console.log('✅ Token stored and set in axios headers after registration');

                    // ✅ Wait a bit to ensure token is saved
                    await new Promise(resolve => setTimeout(resolve, 100));

                    // ✅ Registration successful - redirect to role selection page
                    console.log('✅ Registration successful, redirecting to role selection');
                    navigate('/select-role');
                } else {
                    console.error('❌ No token found in registration response!');
                    console.error('❌ Response structure:', JSON.stringify(response, null, 2));

                    // Registration succeeded but no token - still redirect to role selection
                    alert('Registration successful! Please login to complete your profile.');
                    navigate('/login');
                }
            } catch (error) {
                console.error('❌ Register error:', error);

                // ✅ Xử lý lỗi chi tiết
                if (error.response) {
                    const status = error.response.status;
                    const message = error.response.data?.message || error.response.data?.error;

                    const errorMessages = {
                        400: message || 'Invalid registration data',
                        409: 'Username or email already exists',
                        422: 'Validation failed. Please check your input.',
                        500: 'Server error. Please try again later.',
                        503: 'Service temporarily unavailable'
                    };

                    setErrors({
                        submit: errorMessages[status] || message || 'Registration failed'
                    });
                } else if (error.request) {
                    if (error.code === 'ECONNABORTED') {
                        setErrors({ submit: 'Request timeout. Please try again.' });
                    } else {
                        setErrors({ submit: 'Cannot connect to server. Check your connection.' });
                    }
                } else {
                    setErrors({
                        submit: error.message || 'An unexpected error occurred.'
                    });
                }
            } finally {
                setIsLoading(false);
            }
        } else {
            console.log('Form has errors');
        }
    };

    // Password strength checker
    const checkPasswordStrength = (pass) => {
        let strength = 0;
        if (pass.length >= 8) strength++;
        if (pass.length >= 12) strength++;
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
        if (/\d/.test(pass)) strength++;
        if (/[^a-zA-Z\d]/.test(pass)) strength++;
        return strength;
    };

    const passwordStrength = checkPasswordStrength(formData.password);

    const getStrengthText = () => {
        if (formData.password.length === 0) return '';
        if (passwordStrength <= 2) return 'Weak';
        if (passwordStrength <= 3) return 'Medium';
        return 'Strong';
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 2) return 'bg-red-500';
        if (passwordStrength <= 3) return 'bg-yellow-500';
        return 'Strong';
    };

    return (
        <>
            {/* Main Container */}
            <div className="flex justify-center items-stretch gap-0 bg-gradient-to-br from-green-50 to-emerald-100 bg-no-repeat bg-contain" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'auto' }}>
                <div className="flex items-stretch gap-0 max-w-[1400px] w-full">
                    {/* Left Side - Marketing Content */}
                    <div className="flex-1 flex items-center justify-end px-12 mb-30 ">
                        <div className="max-w-2xl pr-8">
                            {/* Logo */}
                            <div className="absolute top-[-10px] ml-9 h-60 pointer-events-none ">
                                <img
                                    src={logoImage}
                                    alt="Carbon Credit Marketplace"
                                    className="w-110 h-auto"
                                />
                            </div>
                            <div className='mr-10'>
                                <h1 className="text-[19.2px] font-medium text-gray-500 mb-6 mt-58 w-150">
                                    Start your journey as a carbon credit seller and contribute to a sustainable future while building a profitable business.
                                </h1>
                                <p className="text-2xl font-bold text-dark mb-5">
                                    Why Choose Carbon Credit MarketPlace?
                                </p>
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl"><CircleCheckBig size={26} color="#2bff00" /></span>
                                        <span className="text-gray-700">Zero setup fees - start selling immediately</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl"><CircleCheckBig size={26} color="#2bff00" /></span>
                                        <span className="text-gray-700">Competitive commission rates as low as 3%</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl"><CircleCheckBig size={26} color="#2bff00" /></span>
                                        <span className="text-gray-700">Fast payments - receive funds within 48 hours</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl"><CircleCheckBig size={26} color="#2bff00" /></span>
                                        <span className="text-gray-700">24/7 customer support and dedicated account manager</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl"><CircleCheckBig size={26} color="#2bff00" /></span>
                                        <span className="text-gray-700">Advanced analytics and market insights</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl"><CircleCheckBig size={26} color="#2bff00" /></span>
                                        <span className="text-gray-700">Verification assistance for your projects</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Register Form */}
                    <div className="w-[520px] flex items-center justify-start py-6 pl-8 pr-12">
                        <div className='bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-2xl w-full' style={{ boxShadow: '0 0 40px rgba(0, 0, 0, 0.1), 0 0 80px rgba(34, 197, 94, 0.15)' }}>
                            <h1 className='text-3xl font-bold text-center mb-4 text-black'>Create Account</h1>
                            <p className='text-center text-gray-600 mb-3'>Join thousands of successful sellers</p>
                            <form onSubmit={handleSubmit} noValidate>

                                {/* Full Name Field */}
                                <div className='mb-4'>
                                    <label htmlFor='fullName' className='block text-xs font-medium text-gray-700 mb-1'>
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="text-gray-400 text-sm" />
                                        </div>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            onBlur={() => handleBlur('fullName')}
                                            disabled={isLoading}
                                            className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${touched.fullName && errors.fullName ? 'border-red-500' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                            placeholder='Enter your full name'
                                        />
                                    </div>
                                    {touched.fullName && errors.fullName && (
                                        <p className="text-red-500 text-[10px] mt-1">{errors.fullName}</p>
                                    )}
                                </div>

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
                                            className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${touched.username && errors.username ? 'border-red-500' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                            placeholder='Enter username'
                                        />
                                    </div>
                                    {touched.username && errors.username && (
                                        <p className="text-red-500 text-[10px] mt-1">{errors.username}</p>
                                    )}
                                </div>

                                {/* Password Fields - Side by Side */}
                                <div className='flex gap-4 mb-4'>
                                    {/* Password Field */}
                                    <div className='flex-1'>
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
                                                className={`block w-full pl-10 pr-10 py-2.5 text-sm border ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                                                    } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                                placeholder='Create password'
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

                                    {/* Confirm Password Field */}
                                    <div className='flex-1'>
                                        <label htmlFor='confirmPassword' className='block text-xs font-medium text-gray-700 mb-1'>
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLock className="text-gray-400 text-sm" />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('confirmPassword')}
                                                disabled={isLoading}
                                                className={`block w-full pl-10 pr-10 py-2.5 text-sm border ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                                    } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                                placeholder='Confirm password'
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                disabled={isLoading}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer disabled:cursor-not-allowed"
                                            >
                                                {showConfirmPassword ? (
                                                    <FaEyeSlash className="text-gray-400 text-sm hover:text-gray-600" />
                                                ) : (
                                                    <FaEye className="text-gray-400 text-sm hover:text-gray-600" />
                                                )}
                                            </button>
                                        </div>
                                        {touched.confirmPassword && errors.confirmPassword && (
                                            <p className="text-red-500 text-[10px] mt-1">{errors.confirmPassword}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Password Strength Bar - Very Compact */}
                                {formData.password.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex gap-0.5 mb-1">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1 flex-1 rounded ${level <= passwordStrength ? getStrengthColor() : 'bg-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-[10px] ${passwordStrength <= 2 ? 'text-red-500' :
                                            passwordStrength <= 3 ? 'text-yellow-500' :
                                                'text-green-500'
                                            }`}>
                                            Password strength: {getStrengthText()}
                                        </p>
                                    </div>
                                )}

                                {/* Email Field */}
                                <div className='mb-4'>
                                    <label htmlFor='email' className='block text-xs font-medium text-gray-700 mb-1'>
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className="text-gray-400 text-sm" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={() => handleBlur('email')}
                                            disabled={isLoading}
                                            className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                            placeholder='Enter your email'
                                        />
                                    </div>
                                    {touched.email && errors.email && (
                                        <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>
                                    )}
                                </div>
                                {/* Phone Field */}
                                <div className='mb-4'>
                                    <label htmlFor='phone' className='block text-xs font-medium text-gray-700 mb-1'>
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaPhone className="text-gray-400 text-sm" />
                                        </div>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            onBlur={() => handleBlur('phone')}
                                            disabled={isLoading}
                                            className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${touched.phone && errors.phone ? 'border-red-500' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                            placeholder='Enter phone number'
                                        />
                                    </div>
                                    {touched.phone && errors.phone && (
                                        <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>
                                    )}
                                </div>


                                {/* ✅ Server Error Message */}
                                {errors.submit && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-red-600 text-sm font-medium">{errors.submit}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="text-center w-full mb-3 text-[19px] mt-3 rounded-lg bg-green-500 py-3 hover:bg-green-600 transition-colors duration-300 text-white font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Account...
                                        </>
                                    ) : (
                                        'Sign Up'
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="flex items-center my-3">
                                    <div className="flex-1 border-t border-gray-400"></div>
                                    <span className="px-3 text-gray-600 text-[15px]">or continue with</span>
                                    <div className="flex-1 border-t border-gray-400"></div>
                                </div>

                                {/* Social Login Buttons */}
                                <div className="flex gap-2 mb-3">
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

                                {/* Login Link */}
                                <span className="text-center text-[15px] block text-black">
                                    Already have an account? <Link to="/login" className="font-semibold text-green-500 hover:text-green-400">Login</Link>
                                </span>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RegisterForm;
