
// Token utility functions for JWT handling

/**
 * Decode JWT token payload without verification
 */
export const decodeJWTPayload = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode JWT token:', error);
        return null;
    }
};

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token) => {
    try {
        const payload = decodeJWTPayload(token);
        if (!payload || !payload.exp) {
            return true; // Invalid token format
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < currentTime;

        if (isExpired) {
            console.warn('🕒 Token is expired:', {
                expiry: new Date(payload.exp * 1000).toISOString(),
                current: new Date(currentTime * 1000).toISOString(),
                expiredSecondsAgo: currentTime - payload.exp
            });
        }

        return isExpired;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true; // Treat as expired if we can't parse
    }
};

/**
 * Get a valid token or null if expired
 */
export const getValidToken = () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (!token) {
        return null;
    }

    if (isTokenExpired(token)) {
        console.warn('🧹 Clearing expired token from storage');
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        return null;
    }

    return token;
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');

    // Also clear axios headers if available
    const axios = window.axiosInstance;
    if (axios?.defaults?.headers?.common) {
        delete axios.defaults.headers.common['Authorization'];
    }

    console.log('🧹 All authentication data cleared');
};
