import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaGithub, FaBriefcase, FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
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
        confirmPassword: '',
        role: 'EV_OWNER' // Default role
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            case 'fullName':
                if (!value) {
                    error = 'Full name is required';
                } else if (value.trim().length < 2) {
                    error = 'Full name must be at least 2 characters';
                } else if (value.length > 100) {
                    error = 'Full name must be less than 100 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    error = 'Full name can only contain letters and spaces';
                } else if (/\s{2,}/.test(value)) {
                    error = 'Full name cannot contain consecutive spaces';
                } else if (value.trim() !== value) {
                    error = 'Full name cannot start or end with spaces';
                }
                break;

            case 'email':
                if (!value) {
                    error = 'Email is required';
                } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                    error = 'Invalid email address';
                } else if (value.length > 254) {
                    error = 'Email address is too long';
                } else if (/\.{2,}/.test(value)) {
                    error = 'Email cannot contain consecutive dots';
                } else if (/^[.]|[.]@/.test(value)) {
                    error = 'Email cannot start with a dot or have a dot before @';
                } else if (/(tempmail|throwaway|guerrillamail|mailinator|10minutemail)/i.test(value)) {
                    error = 'Disposable email addresses are not allowed';
                }
                break;

            case 'username':
                if (!value) {
                    error = 'Username is required';
                } else if (value.length < 3) {
                    error = 'Username must be at least 3 characters';
                } else if (value.length > 50) {
                    error = 'Username must be less than 50 characters';
                } else if (!/^[a-zA-Z]/.test(value)) {
                    error = 'Username must start with a letter';
                } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    error = 'Username can only contain letters, numbers, and underscores';
                } else if (/__/.test(value)) {
                    error = 'Username cannot contain consecutive underscores';
                } else if (/_$/.test(value)) {
                    error = 'Username cannot end with an underscore';
                }
                break;

            case 'phone':
                if (!value) {
                    error = 'Phone number is required';
                } else if (!/^[0-9]+$/.test(value)) {
                    error = 'Phone number must contain digits only (no spaces or special characters)';
                } else if (!value.startsWith('0')) {
                    error = 'Phone number must start with 0';
                } else if (value.length < 10) {
                    error = 'Phone number must be at least 10 digits';
                } else if (value.length > 11) {
                    error = 'Phone number must not exceed 11 digits';
                } else if (!/^(03|05|07|08|09)[0-9]{8}$/.test(value)) {
                    error = 'Invalid phone number format. Must start with 03, 05, 07, 08, or 09 followed by 8 digits';
                }
                break;

            case 'password':
                if (!value) {
                    error = 'Password is required';
                } else if (value.length < 8) {
                    error = 'Password must be at least 8 characters';
                } else if (value.length > 100) {
                    error = 'Password must be less than 100 characters';
                } else if (/\s/.test(value)) {
                    error = 'Password cannot contain spaces';
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
            if (field !== 'role') {
                const error = validateField(field, formData[field]);
                if (error) {
                    newErrors[field] = error;
                }
            }
        });

        setErrors(newErrors);

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
                const registerPayload = {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    phone: formData.phone,
                    role: formData.role
                };

                const response = await authApi.register(registerPayload);
                console.log('✅ Registration success:', response);

                navigate('/login', {
                    state: {
                        message: 'Registration successful! Please log in with your credentials.',
                        email: formData.email
                    }
                });

            } catch (error) {
                console.error('❌ Registration error:', error);

                if (error.response) {
                    const status = error.response.status;
                    const message = error.response.data?.message || error.response.data?.error;

                    const errorMessages = {
                        400: message || 'Invalid request data',
                        409: message || 'Username or email already exists',
                        422: message || 'Invalid data provided',
                        500: 'Server error. Please try again later.'
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
        return 'bg-green-500';
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

                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                                        {errors.submit}
                                    </div>
                                )}

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
                                            className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${touched.fullName && errors.fullName ? 'border-red-500' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700`}
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
                                            className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${touched.username && errors.username ? 'border-red-500' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700`}
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
                                                className={`block w-full pl-10 pr-10 py-2.5 text-sm border ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                                                    } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700`}
                                                placeholder='Create password'
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
                                                className={`block w-full pl-10 pr-10 py-2.5 text-sm border ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                                    } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700`}
                                                placeholder='Confirm password'
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
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

                                {/* Password Strength Bar */}
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
                                            className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700`}
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
                                            className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${touched.phone && errors.phone ? 'border-red-500' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700`}
                                            placeholder='Enter phone number (digits only)'
                                        />
                                    </div>
                                    {touched.phone && errors.phone && (
                                        <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>
                                    )}
                                </div>

                                {/* Role Selection */}
                                <div className="mb-4">
                                    <label htmlFor="role" className="block text-xs font-medium text-gray-700 mb-1">
                                        Account Type
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                            <FaBriefcase className="text-gray-400 text-xs" />
                                        </div>
                                        <select
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="block w-full pl-8 pr-3 py-2 text-xs border-2 border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 rounded-lg bg-white text-gray-700 appearance-none cursor-pointer transition-colors duration-200"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                                backgroundPosition: 'right 0.3rem center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: '1.2em 1.2em',
                                            }}
                                        >
                                            <option value="EV_OWNER">EV Owner - I own electric vehicles</option>
                                            <option value="BUYER">Buyer - I want to buy carbon credits</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="text-center w-full mb-3 text-[19px] mt-3 rounded-lg bg-green-500 py-3 hover:bg-green-600 transition-colors duration-300 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-slate-200 text-gray-800 py-2 rounded hover:bg-gray-100 transition-colors duration-300"
                                    >
                                        <FaGoogle className="text-sm" />
                                        <span className="font-medium text-s">Google</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleFacebookLogin}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#2b3137] text-white py-2 rounded hover:bg-[#24292e] transition-colors duration-300"
                                    >
                                        <FaGithub className="text-sm" />
                                        <span className="font-medium text-s">GitHub</span>
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
    );
};

export default RegisterForm;