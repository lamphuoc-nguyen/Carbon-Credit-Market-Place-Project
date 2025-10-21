import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';
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
                console.log('✅ Login success:', response);

                if (!response || !response.accessToken) {
                    setErrors({
                        submit: 'Invalid username or password'
                    });
                    return;
                }

                // Save token
                const storage = formData.rememberMe ? localStorage : sessionStorage;
                storage.setItem('authToken', response.accessToken);

                console.log('✅ Token saved successfully');

                // Redirect to home page after successful login
                navigate('/home');

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
        <div className="min-h-screen bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <img src={logoImage} alt="Logo" className="mx-auto h-16 w-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                    <p className="text-gray-600">Sign in to your account</p>
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
                        <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {errors.submit}
                        </div>
                    )}

                    {/* Username/Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username or Email
                        </label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="usernameOrEmail"
                                value={formData.usernameOrEmail}
                                onChange={handleChange}
                                onBlur={() => handleBlur('usernameOrEmail')}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${errors.usernameOrEmail && touched.usernameOrEmail
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300'
                                    }`}
                                placeholder="Enter your username or email"
                            />
                        </div>
                        {errors.usernameOrEmail && touched.usernameOrEmail && (
                            <p className="mt-1 text-sm text-red-500">{errors.usernameOrEmail}</p>
                        )}
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
                                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${errors.password && touched.password
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300'
                                    }`}
                                placeholder="Enter your password"
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

                    {/* Remember Me */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-500">
                            Forgot password?
                        </Link>
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
                                Signing In...
                            </>
                        ) : (
                            <>
                                <CircleCheckBig size={16} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                {/* Sign Up Link */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-green-600 hover:text-green-500 font-medium">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
