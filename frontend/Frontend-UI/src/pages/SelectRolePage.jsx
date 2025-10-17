import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBriefcase, FaLeaf, FaShieldAlt, FaCog } from 'react-icons/fa';
import backgroundImage from '../image/background.png';
import logoImage from '../image/logo1.png';
import axiosInstance from '../api/axiosInstance';

const SelectRolePage = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Role icons mapping
    const roleIcons = {
        'evowner': FaLeaf,
        'buyer': FaBriefcase
    };

    // Role descriptions
    const roleDescriptions = {
        'evowner': 'Generate and sell carbon credits from your environmental projects',
        'buyer': 'Purchase carbon credits to offset your carbon footprint',

    };

    // Fallback roles data when backend is not available
    const fallbackRoles = [
        { roleID: 1, roleName: 'evowner' },
        { roleID: 2, roleName: 'buyer' },
    ];

    useEffect(() => {
        checkAuthToken();
        fetchRoles();
    }, []);

    const checkAuthToken = () => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
        }
    };

    const fetchRoles = async () => {
        try {
            setIsLoading(true);
            setError('');

            const response = await axiosInstance.get('/api/profile/roles');

            // Handle different response structures
            let rolesData = [];

            if (response.data) {
                if (Array.isArray(response.data)) {
                    // Direct array response
                    rolesData = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    // Wrapped response with data property
                    rolesData = response.data.data;
                } else if (response.data.success === false) {
                    // Error response from backend
                    throw new Error(response.data.message || 'Failed to load roles');
                }
            }

            if (rolesData && rolesData.length > 0) {
                // Filter to show only evowner (roleID 1) and buyer (roleID 2)
                const filteredRoles = rolesData.filter(role =>
                    role.roleName === 'evowner' || role.roleName === 'buyer'
                );
                setRoles(filteredRoles.length > 0 ? filteredRoles : fallbackRoles);
            } else {
                // Use fallback roles if no data received
                console.warn('No roles data received, using fallback roles');
                setRoles(fallbackRoles);
                setError('Using default roles. Some features may be limited.');
            }

        } catch (error) {
            console.error('Error fetching roles:', error);

            if (error.response?.status === 404) {
                // Backend returned 404, use fallback roles
                console.warn('Backend roles endpoint not found, using fallback roles');
                setRoles(fallbackRoles);
                setError('Using default roles. Backend may not be fully configured.');
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
                // Network/connection error, use fallback roles
                console.warn('Backend not available, using fallback roles');
                setRoles(fallbackRoles);
                setError('Backend server is not running. Using default roles for now.');
            } else {
                // Other errors
                setRoles(fallbackRoles);
                setError(`Error loading roles: ${error.message}. Using default roles.`);
            }
        } finally {
            setIsLoading(false);
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

        console.log('🔵 Starting role submission...');
        console.log('🔵 Selected roleId:', selectedRoleId);
        console.log('🔵 Token in localStorage:', localStorage.getItem('authToken') ? 'EXISTS' : 'MISSING');

        setIsLoading(true);
        setError('');

        try {
            console.log('🔵 Sending POST request to /api/profile/set-role');
            const response = await axiosInstance.post('/api/profile/set-role', {
                roleId: parseInt(selectedRoleId)
            });

            console.log('✅ Response received:', response.data);

            // Check if response indicates success
            if (response.data?.success !== false) {
                console.log('✅ Role assignment successful! Redirecting to dashboard...');
                // Redirect to dashboard after successful role assignment
                navigate('/dashboard');
            } else {
                console.error('❌ Unexpected response format:', response.data);
                setError(response.data?.message || 'Unexpected response format. Please try again.');
            }
        } catch (error) {
            console.error('❌ Error setting role:', error);

            if (error.response) {
                console.error('❌ Error response status:', error.response.status);
                console.error('❌ Error response data:', error.response.data);

                // Handle different response structures
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
                console.error('❌ No response received:', error.request);
                setError('Network error. Backend server may not be running. Please try again later.');
            } else {
                console.error('❌ Error details:', error.message);
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-50 to-emerald-100"
             style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' }}>

            {/* Logo */}
            <div className="absolute top-8 left-8">
                <img src={logoImage} alt="Carbon Credit Marketplace" className="h-16" />
            </div>

            {/* Main Content */}
            <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg p-8 shadow-2xl max-w-4xl w-full mx-4"
                 style={{ boxShadow: '0 0 40px rgba(0, 0, 0, 0.1), 0 0 80px rgba(34, 197, 94, 0.15)' }}>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Role</h1>
                    <p className="text-gray-600">Select your role to complete your profile and get started</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className={`mb-6 p-4 border rounded-md ${
                        error.includes('default roles') || error.includes('Backend')
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                            : 'bg-red-50 border-red-200 text-red-600'
                    }`}>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && roles.length === 0 && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-blue-600 text-sm font-medium">Loading roles...</p>
                    </div>
                )}

                {/* Role Selection Table */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                        Select Your Role
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
                                                                {role.roleName}
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

                    {/* No roles available message */}
                    {!isLoading && roles.length === 0 && (
                        <div className="p-6 bg-red-50 border border-red-200 rounded-md text-center">
                            <p className="text-red-700 font-medium">
                                Unable to load roles. Please check your connection and try again.
                            </p>
                            <button
                                onClick={fetchRoles}
                                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Retry
                            </button>
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
                                Setting Role...
                            </>
                        ) : (
                            'Complete Profile'
                        )}
                    </button>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        You can change your role later in your profile settings if needed.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SelectRolePage;
