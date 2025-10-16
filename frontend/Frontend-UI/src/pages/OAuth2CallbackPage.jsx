import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api';
import backgroundImage from '../image/background.png';
import logoImage from '../image/logo1.png';

const OAuth2CallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        handleOAuth2Callback();
    }, []);

    const handleOAuth2Callback = async () => {
        try {
            // Get the token from URL query parameters
            const token = searchParams.get('token');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setError(`OAuth2 authentication failed: ${errorParam}`);
                setIsLoading(false);
                return;
            }

            if (!token) {
                setError('No authentication token received');
                setIsLoading(false);
                return;
            }

            // Store the token
            localStorage.setItem('authToken', token);

            // Check user's profile status to determine next step
            try {
                const profileResponse = await authApi.getProfileStatus();
                console.log('OAuth2 user profile status:', profileResponse);

                if (profileResponse.profileStatus === 0 || !profileResponse.hasRole) {
                    // Profile incomplete - redirect to role selection
                    navigate('/select-role');
                } else {
                    // Profile complete - redirect to dashboard
                    navigate('/dashboard');
                }
            } catch (profileError) {
                console.warn('Could not check profile status, redirecting to role selection:', profileError);
                // If profile check fails, assume incomplete and go to role selection
                navigate('/select-role');
            }

        } catch (error) {
            console.error('OAuth2 callback error:', error);
            setError('Failed to process OAuth2 authentication');
            setIsLoading(false);
        }
    };

    const handleRetry = () => {
        navigate('/login');
    };

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-50 to-emerald-100"
                 style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' }}>

                {/* Logo */}
                <div className="absolute top-8 left-8">
                    <img src={logoImage} alt="Carbon Credit Marketplace" className="h-16" />
                </div>

                {/* Error Card */}
                <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg p-8 shadow-2xl max-w-md w-full mx-4"
                     style={{ boxShadow: '0 0 40px rgba(0, 0, 0, 0.1), 0 0 80px rgba(34, 197, 94, 0.15)' }}>

                    <div className="text-center">
                        <div className="mb-4">
                            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Failed</h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
                        >
                            Try Again
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

            {/* Loading Card */}
            <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg p-8 shadow-2xl max-w-md w-full mx-4"
                 style={{ boxShadow: '0 0 40px rgba(0, 0, 0, 0.1), 0 0 80px rgba(34, 197, 94, 0.15)' }}>

                <div className="text-center">
                    <div className="mb-4">
                        <svg className="animate-spin w-16 h-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Completing Authentication</h1>
                    <p className="text-gray-600">Please wait while we set up your account...</p>
                </div>
            </div>
        </div>
    );
};

export default OAuth2CallbackPage;
