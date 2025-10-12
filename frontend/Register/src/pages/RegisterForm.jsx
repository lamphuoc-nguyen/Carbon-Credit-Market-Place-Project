import { Link } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaCheck, FaTimes, FaBriefcase } from 'react-icons/fa';
import { useState } from 'react';

const Register = () => {
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

        // Clear error when user starts typing
        if (errors[name]) {
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
        validateField(field, formData[field]);
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
                } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(value)) {
                    error = 'Password must contain uppercase and lowercase letters';
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
        return 'bg-green-500';
    };

    const passwordRequirements = [
        { text: '8+ chars', met: formData.password.length >= 8 },
        { text: 'Upper & lower', met: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) },
        { text: 'Number', met: /\d/.test(formData.password) },
        { text: 'Special char', met: /[^a-zA-Z\d]/.test(formData.password) },
    ];

    return (
        <>
            {/* Header */}
            <header className="sticky top-0 z-[100] py-3 bg-white/90 backdrop-blur-[10px] border-b border-green-500/10">
                <nav className="max-w-[1200px] mx-auto px-8 flex justify-between items-center">
                    {/* Brand */}
                    <div className="flex items-center gap-2 text-xl font-bold text-emerald-800 no-underline">
                        <span className="text-2xl">🌱</span>
                        <span>CarbonTrade</span>
                    </div>

                    {/* Nav Links */}
                    <div className="flex gap-6 items-center">
                        <a
                            href="#about"
                            className="text-gray-500 no-underline font-medium transition-colors duration-300 py-2 px-3 rounded-lg hover:text-green-500 text-sm"
                        >
                            About
                        </a>
                        <a
                            href="#contact"
                            className="text-gray-500 no-underline font-medium transition-colors duration-300 py-2 px-3 rounded-lg hover:text-green-500 text-sm"
                        >
                            Contact
                        </a>
                        <Link
                            to="/login"
                            className="bg-gradient-to-br from-green-500 to-green-600 text-white font-medium py-2 px-4 text-sm rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                        >
                            Sign In
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Main Container with Form on Right */}
            <div className="h-[calc(100vh-64px)] flex items-stretch bg-gradient-to-br from-green-50 to-emerald-100">
                {/* Left Side - Marketing Content */}
                <div className="flex-1 flex items-center justify-center px-12">
                    <div className="max-w-lg">
                        <h1 className="text-5xl font-bold text-emerald-800 mb-6">
                            Join CarbonTrade Today
                        </h1>
                        <p className="text-xl text-gray-700 mb-8">
                            Start your journey towards a sustainable future. Trade carbon credits and make a difference.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">✅</span>
                                <span className="text-gray-700">Secure and transparent transactions</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🌍</span>
                                <span className="text-gray-700">Global carbon credit marketplace</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📊</span>
                                <span className="text-gray-700">Real-time market insights</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div className="w-[480px] flex items-center justify-center py-6 pr-12">
                    <div className='bg-white border border-black rounded-md p-6 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30 w-full'>
                        <h1 className='text-2xl font-bold text-center mb-4 text-black'>Register</h1>
                        <form onSubmit={handleSubmit} noValidate>
                            {/* Email Field */}
                            <div className='relative mb-5'>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('email')}
                                    className={`block w-full py-2 px-0 text-sm text-black bg-transparent border-0 border-b-2 ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                                        } appearance-none focus:border-green-600 focus:outline-none focus:ring-0 peer`}
                                    placeholder=' '
                                />
                                <label
                                    htmlFor='email'
                                    className='absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-green-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'
                                >
                                    Email
                                </label>
                                {touched.email && errors.email && (
                                    <p className="text-red-500 text-[10px] mt-0.5 absolute">{errors.email}</p>
                                )}
                            </div>

                            {/* Username Field */}
                            <div className='relative mb-5'>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('username')}
                                    className={`block w-full py-2 px-0 text-sm text-black bg-transparent border-0 border-b-2 ${touched.username && errors.username ? 'border-red-500' : 'border-gray-300'
                                        } appearance-none focus:border-green-600 focus:outline-none focus:ring-0 peer`}
                                    placeholder=' '
                                />
                                <label
                                    htmlFor='username'
                                    className='absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-green-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'
                                >
                                    Username
                                </label>
                                {touched.username && errors.username && (
                                    <p className="text-red-500 text-[10px] mt-0.5 absolute">{errors.username}</p>
                                )}
                            </div>

                            {/* Phone Field */}
                            <div className='relative mb-5'>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('phone')}
                                    className={`block w-full py-2 px-0 text-sm text-black bg-transparent border-0 border-b-2 ${touched.phone && errors.phone ? 'border-red-500' : 'border-gray-300'
                                        } appearance-none focus:border-green-600 focus:outline-none focus:ring-0 peer`}
                                    placeholder=' '
                                />
                                <label
                                    htmlFor='phone'
                                    className='absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-green-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'
                                >
                                    Phone Number
                                </label>
                                {touched.phone && errors.phone && (
                                    <p className="text-red-500 text-[10px] mt-0.5 absolute">{errors.phone}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className='relative mb-2'>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('password')}
                                    className={`block w-full py-2 px-0 text-sm text-black bg-transparent border-0 border-b-2 ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                                        } appearance-none focus:border-green-600 focus:outline-none focus:ring-0 peer`}
                                    placeholder=' '
                                />
                                <label
                                    htmlFor='password'
                                    className='absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-green-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'
                                >
                                    Password
                                </label>
                                {touched.password && errors.password && (
                                    <p className="text-red-500 text-[10px] mt-0.5">{errors.password}</p>
                                )}
                            </div>

                            {/* Password Strength Bar - Very Compact */}
                            {formData.password.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex gap-0.5 mb-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-0.5 flex-1 rounded ${level <= passwordStrength ? getStrengthColor() : 'bg-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className={`text-[10px] ${passwordStrength <= 2 ? 'text-red-500' :
                                            passwordStrength <= 3 ? 'text-yellow-500' :
                                                'text-green-500'
                                            }`}>
                                            {getStrengthText()}
                                        </p>
                                    </div>

                                    {/* Password Requirements - Ultra Compact */}
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                                        {passwordRequirements.map((req, index) => (
                                            <div key={index} className="flex items-center gap-1">
                                                {req.met ? (
                                                    <FaCheck className="text-green-500 flex-shrink-0" style={{ fontSize: '7px' }} />
                                                ) : (
                                                    <FaTimes className="text-gray-400 flex-shrink-0" style={{ fontSize: '7px' }} />
                                                )}
                                                <span className={`text-[9px] ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {req.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Confirm Password Field */}
                            <div className='relative mb-5'>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('confirmPassword')}
                                    className={`block w-full py-2 px-0 text-sm text-black bg-transparent border-0 border-b-2 ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                        } appearance-none focus:border-green-600 focus:outline-none focus:ring-0 peer`}
                                    placeholder=' '
                                />
                                <label
                                    htmlFor='confirmPassword'
                                    className='absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-green-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'
                                >
                                    Confirm Password
                                </label>
                                {touched.confirmPassword && errors.confirmPassword && (
                                    <p className="text-red-500 text-[10px] mt-0.5 absolute">{errors.confirmPassword}</p>
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
                                        <option value="carbon-credit-producer">Carbon Credit Buyer</option>
                                        <option value="project-developer">Carbon Credit Seller</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                {touched.businessType && errors.businessType && (
                                    <p className="text-red-500 text-[10px] mt-0.5">{errors.businessType}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="text-center w-full mb-3 text-sm mt-3 rounded bg-green-500 py-2 hover:bg-green-600 transition-colors duration-300 text-white font-medium"
                            >
                                Sign Up
                            </button>

                            {/* Divider */}
                            <div className="flex items-center my-3">
                                <div className="flex-1 border-t border-gray-400"></div>
                                <span className="px-3 text-gray-600 text-[10px]">or continue with</span>
                                <div className="flex-1 border-t border-gray-400"></div>
                            </div>

                            {/* Social Login Buttons */}
                            <div className="flex gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-200 text-gray-800 py-1.5 rounded hover:bg-gray-100 transition-colors duration-300"
                                >
                                    <FaGoogle className="text-sm" />
                                    <span className="font-medium text-xs">Google</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleFacebookLogin}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#1877F2] text-white py-1.5 rounded hover:bg-[#166FE5] transition-colors duration-300"
                                >
                                    <FaFacebook className="text-sm" />
                                    <span className="font-medium text-xs">Facebook</span>
                                </button>
                            </div>

                            {/* Login Link */}
                            <span className="text-center text-[10px] block text-black">
                                Already have an account? <Link to="/login" className="font-semibold text-blue-500 hover:text-blue-400">Login</Link>
                            </span>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Register;