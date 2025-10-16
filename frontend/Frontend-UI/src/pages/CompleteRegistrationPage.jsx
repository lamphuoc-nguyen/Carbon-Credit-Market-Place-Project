import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaBriefcase, FaLeaf } from 'react-icons/fa';
import backgroundImage from '../image/background.png';
import logoImage from '../image/logo1.png';
import axiosInstance from '../api/axiosInstance';

const CompleteRegistrationPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [roles, setRoles] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Role icons mapping - only show seller and buyer
    const roleIcons = {
        'evowner': FaLeaf,
        'buyer': FaBriefcase
    };

    // Role descriptions - updated to show seller and buyer
    const roleDescriptions = {
        'evowner': 'Generate and sell carbon credits from your environmental projects',
        'buyer': 'Purchase carbon credits to offset your carbon footprint'
    };

    // Role display names
    const roleDisplayNames = {
        'evowner': 'Seller',
        'buyer': 'Buyer'
    };

    useEffect(() => {
        handleTokenAndFetchRoles();
    }, []);

    const handleTokenAndFetchRoles = async () => {
        try {
            // Get the token from URL query parameters
            const token = searchParams.get('token');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setError(`OAuth2 authentication failed: ${errorParam}`);
                return;
            }

            if (!token) {
                setError('No authentication token received');
                return;
            }

            // Store the token in both localStorage and sessionStorage for compatibility
            localStorage.setItem('authToken', token);
            sessionStorage.setItem('authToken', token);

            // Log token storage for debugging
            console.log('🔐 Authentication token stored successfully');

            // Wait a moment for token to be properly stored
            await new Promise(resolve => setTimeout(resolve, 100));

            // Fetch available roles with the stored token
            const response = await axiosInstance.get('/api/profile/roles');
            if (response.data && Array.isArray(response.data)) {
                // Filter to show only seller (evowner - roleID 1) and buyer (roleID 2)
                const filteredRoles = response.data.filter(role =>
                    role.roleID === 1 || role.roleID === 2
                );
                setRoles(filteredRoles);
                console.log('✅ Roles loaded successfully:', filteredRoles);
            } else {
                setError('Failed to load roles. Invalid data received.');
            }
        } catch (error) {
            console.error('Error in token handling or role fetching:', error);

            if (error.response?.status === 401) {
                setError('Authentication token is invalid or expired. Please try logging in again.');
            } else if (error.response?.status === 403) {
                setError('You do not have permission to access this resource.');
            } else {
                setError('Failed to load roles. Please try again.');
            }
        }
    };

    const handleRoleSelect = (roleId) => {
        setSelectedRoleId(roleId);
        setError('');
    };

    const handleSubmit = async () => {
        if (!selectedRoleId) {
            setError('Please select a role to continue');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await axiosInstance.post('/api/profile/set-role', {
                roleId: parseInt(selectedRoleId)
            });

            console.log('Role assigned successfully:', response.data);

            // Check if response indicates success
            if (response.data?.success) {
                // Redirect to dashboard after successful role assignment
                navigate('/dashboard');
            } else {
                setError('Unexpected response format. Please try again.');
            }
        } catch (error) {
            console.error('Error setting role:', error);

            if (error.response) {
                const errorData = error.response.data;
                let message = 'Failed to assign role';

                if (typeof errorData === 'string') {
                    message = errorData;
                } else if (errorData?.message) {
                    message = errorData.message;
                } else if (errorData?.error) {
                    message = errorData.error;
                }

                setError(message);
            } else if (error.request) {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (error && !roles.length) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-50 to-emerald-100"
                 style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' }}>

                {/* Logo */}
                <div className="absolute top-8 left-8">
                    <img src={logoImage} alt="Carbon Credit Marketplace" className="h-16" />
                </div>

                {/* Error Card */}
                <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg p-8 shadow-2xl max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="mb-4">
                            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Setup Failed</h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-50 to-emerald-100"
             style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' }}>

            {/* Logo */}
            <div className="absolute top-8 left-8">
                <img src={logoImage} alt="Carbon Credit Marketplace" className="h-16" />
            </div>

            {/* Main Content */}
            <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg p-8 shadow-2xl max-w-5xl w-full mx-4"
                 style={{ boxShadow: '0 0 40px rgba(0, 0, 0, 0.1), 0 0 80px rgba(34, 197, 94, 0.15)' }}>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Registration</h1>
                    <p className="text-gray-600">Just one more step! Please select your role to get started</p>
                </div>

                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            ✓
                        </div>
                        <div className="h-1 w-12 bg-green-500"></div>
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            2
                        </div>
                        <div className="h-1 w-12 bg-gray-300"></div>
                        <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                            3
                        </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>Account Created</span>
                        <span className="text-green-600 font-medium">Select Role</span>
                        <span>Get Started</span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Role Selection */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                        What's your role in the carbon credit marketplace?
                    </label>

                    {/* Roles Table */}
                    {roles.length > 0 && (
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Select
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {roles.map((role) => {
                                        const IconComponent = roleIcons[role.roleName] || FaBriefcase;
                                        const isSelected = selectedRoleId == role.roleID;

                                        return (
                                            <tr
                                                key={role.roleID}
                                                className={`hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                                                    isSelected ? 'bg-green-50 border-green-200' : ''
                                                }`}
                                                onClick={() => handleRoleSelect(role.roleID)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className={`p-3 rounded-full mr-4 ${
                                                            isSelected ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            <IconComponent className="text-xl" />
                                                        </div>
                                                        <div>
                                                            <div className={`text-lg font-semibold capitalize ${
                                                                isSelected ? 'text-green-700' : 'text-gray-900'
                                                            }`}>
                                                                {roleDisplayNames[role.roleName] || role.roleName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                ID: {role.roleID}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-700 leading-relaxed">
                                                        {roleDescriptions[role.roleName] || 'Participate in the carbon credit marketplace'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                                                        isSelected 
                                                            ? 'bg-green-500 border-green-500' 
                                                            : 'bg-white border-gray-300'
                                                    }`}>
                                                        {isSelected && (
                                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Selected Role Summary */}
                    {selectedRoleId && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-700">
                                <span className="font-medium">Selected Role:</span> {roles.find(role => role.roleID == selectedRoleId)?.roleName}
                                <span className="text-green-600"> (ID: {selectedRoleId})</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedRoleId || isLoading}
                        className="px-12 py-4 bg-green-500 text-white text-lg font-semibold rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Completing Setup...
                            </>
                        ) : (
                            'Complete Registration'
                        )}
                    </button>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Don't worry, you can change your role later in your profile settings if needed.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CompleteRegistrationPage;
