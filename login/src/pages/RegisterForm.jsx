import React from 'react';
import { Link } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaCheck, FaTimes, FaBriefcase, FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';
import { CircleCheckBig } from 'lucide-react';
import backgroundImage from '../image/background.png';
import logoImage from '../image/logo1.png';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        phone: '',
        password: '',
        confirmPassword: '',
        businessType: ''
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleGoogleLogin = () => {
        console.log('Google login clicked');
    };

    const handleFacebookLogin = () => {
        console.log('Facebook login clicked');
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

            case 'businessType':
                if (!value) {
                    error = 'Please select a business type';
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
            email: true,
            username: true,
            phone: true,
            password: true,
            confirmPassword: true,
            businessType: true
        });

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateAllFields()) {
            console.log('Form submitted:', formData);
            // Add your registration logic here
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
                                            placeholder='Enter phone number'
                                        />
                                    </div>
                                    {touched.phone && errors.phone && (
                                        <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>
                                    )}
                                </div>



                                {/* Business Type Dropdown */}
                                <div className="mb-4">
                                    <label htmlFor="businessType" className="block text-xs font-medium text-gray-700 mb-1">
                                        Roles
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                            <FaBriefcase className="text-gray-400 text-xs" />
                                        </div>
                                        <select
                                            id="businessType"
                                            name="businessType"
                                            value={formData.businessType}
                                            onChange={handleChange}
                                            onBlur={() => handleBlur('businessType')}
                                            className={`block w-full pl-8 pr-3 py-2 text-xs border-2 ${touched.businessType && errors.businessType ? 'border-red-500' : 'border-gray-300'
                                                } focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 rounded-lg bg-white text-gray-700 appearance-none cursor-pointer transition-colors duration-200`}
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                                backgroundPosition: 'right 0.3rem center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: '1.2em 1.2em',
                                            }}
                                        >
                                            <option value="" disabled>Select Roles</option>
                                            <option value="1">Carbon Credit Buyer</option>
                                            <option value="2">Carbon Credit Seller</option>
                                        </select>
                                    </div>
                                    {touched.businessType && errors.businessType && (
                                        <p className="text-red-500 text-[10px] mt-0.5">{errors.businessType}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="text-center w-full mb-3 text-[19px] mt-3 rounded-lg bg-green-500 py-3 hover:bg-green-600 transition-colors duration-300 text-white font-medium"
                                >
                                    Sign Up
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
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#1877F2] text-white py-2 rounded hover:bg-[#166FE5] transition-colors duration-300"
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