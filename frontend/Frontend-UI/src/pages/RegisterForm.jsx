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
        confirmPassword: '',
        role: 'EV_OWNER' // Default role
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
        console.log('GitHub OAuth2 login clicked');
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

        // Clear submit error when user types
        if (errors.submit) {
            setErrors(prev => ({ ...prev, submit: '' }));
        }
    };

    const handleBlur = (field) => {
        // Only mark as touched, don't validate until form submission
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
                } else if (value.length < 2) {
                    error = 'Full name must be at least 2 characters';
                } else if (value.length > 100) {
                    error = 'Full name must be less than 100 characters';
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
                } else if (value.length > 50) {
                    error = 'Username must be less than 50 characters';
                } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    error = 'Username can only contain letters, numbers, and underscores';
                }
                break;

            case 'phone':
                if (!value) {
                    error = 'Phone number is required';
                } else if (!/^[0-9]{10,15}$/.test(value)) {
                    error = 'Phone number must be 10-15 digits only (no spaces or special characters)';
                }
                break;

            case 'password':
                if (!value) {
                    error = 'Password is required';
                } else if (value.length < 8) {
                    error = 'Password must be at least 8 characters';
                } else if (value.length > 100) {
                    error = 'Password must be less than 100 characters';
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
            if (field !== 'role') { // Don't validate role field
                const error = validateField(field, formData[field]);
                if (error) {
                    newErrors[field] = error;
                }
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

                // Registration successful - redirect to login page
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

    return (
        <div className="min-h-screen bg-cover bg-center flex items-center justify-center py-8"
             style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <img src={logoImage} alt="Logo" className="mx-auto h-16 w-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                    <p className="text-gray-600">Join our carbon credit marketplace</p>
                </div>

                {/* OAuth Buttons */}
                <div className="space-y-3 mb-6">
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        <FaGoogle className="text-red-500" />
                        Continue with Google
                    </button>
                    <button
                        onClick={handleFacebookLogin}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        <FaFacebook className="text-blue-600" />
                        Continue with GitHub
                    </button>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or register with email</span>
                    </div>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {errors.submit}
                        </div>
                    )}

                    {/* Full Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                onBlur={() => handleBlur('fullName')}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    errors.fullName && touched.fullName
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300'
                                }`}
                                placeholder="Enter your full name"
                            />
                        </div>
                        {errors.fullName && touched.fullName && (
                            <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={() => handleBlur('email')}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    errors.email && touched.email
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300'
                                }`}
                                placeholder="Enter your email"
                            />
                        </div>
                        {errors.email && touched.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    {/* Username Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                onBlur={() => handleBlur('username')}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    errors.username && touched.username
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300'
                                }`}
                                placeholder="Choose a username"
                            />
                        </div>
                        {errors.username && touched.username && (
                            <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                        )}
                    </div>

                    {/* Phone Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <div className="relative">
                            <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={() => handleBlur('phone')}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    errors.phone && touched.phone
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300'
                                }`}
                                placeholder="Enter phone number (digits only, e.g. 1234567890)"
                            />
                        </div>
                        {errors.phone && touched.phone && (
                            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                        )}
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Type
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        >
                            <option value="EV_OWNER">EV Owner - I own electric vehicles</option>
                            <option value="BUYER">Buyer - I want to buy carbon credits</option>
                        </select>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={() => handleBlur('password')}
                                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    errors.password && touched.password
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300'
                                }`}
                                placeholder="Create a password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.password && touched.password && (
                            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={() => handleBlur('confirmPassword')}
                                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    errors.confirmPassword && touched.confirmPassword
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300'
                                }`}
                                placeholder="Confirm your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.confirmPassword && touched.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <CircleCheckBig size={16} />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                {/* Sign In Link */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-green-600 hover:text-green-500 font-medium">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
