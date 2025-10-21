import axiosInstance from "./axiosInstance";

// ✅ Helper function to create validation errors
const createValidationError = (message, status, data, config) => {
    const error = new Error(message);
    error.response = {
        status,
        statusText: status === 401 ? 'Unauthorized' : 'Bad Request',
        data,
        headers: {},
        config
    };
    return error;
};

export const authApi = {
    // ✅ LOGIN - Updated to match backend AuthResponseDto structure
    login: async (payload) => {
        const response = await axiosInstance.post('/api/auth/login', payload);

        // ✅ VALIDATE: Check if we have accessToken (backend returns this field)
        if (!response.data.accessToken) {
            throw createValidationError(
                'Invalid username or password',
                401,
                response.data,
                response.config
            );
        }

        return response.data;
    },

    // ✅ REGISTER - Kiểm tra response
    register: async (payload) => {
        const response = await axiosInstance.post('/api/auth/register', payload);

        if (response.data.success === false) {
            throw createValidationError(
                response.data.message || 'Registration failed',
                400,
                response.data,
                response.config
            );
        }

        return response.data;
    },

    // ✅ LOGOUT - Clear all storage
    logout: async () => {
        try {
            await axiosInstance.post('/api/auth/logout');
        } finally {
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('user');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
    },

    // ✅ FORGOT PASSWORD - Kiểm tra response
    forgotPassword: async (email) => {
        const response = await axiosInstance.post('/api/auth/forgot-password', { email });

        if (response.data.success === false) {
            throw createValidationError(
                response.data.message || 'Failed to send reset email',
                400,
                response.data,
                response.config
            );
        }

        return response.data;
    },

    // ✅ RESET PASSWORD - Kiểm tra response
    resetPassword: async (token, newPassword) => {
        const response = await axiosInstance.post('/api/auth/reset-password', {
            token,
            newPassword
        });

        if (response.data.success === false) {
            throw createValidationError(
                response.data.message || 'Failed to reset password',
                400,
                response.data,
                response.config
            );
        }

        return response.data;
    },

    // ✅ PING - Health check
    ping: async () => {
        const response = await axiosInstance.get('/api/health');
        return response.data;
    },

    // ✅ GET PROFILE STATUS - Check if user profile is complete
    getProfileStatus: async () => {
        const response = await axiosInstance.get('/api/profile/status');
        return response.data;
    },

    // ✅ GET AVAILABLE ROLES - Get list of all roles
    getRoles: async () => {
        const response = await axiosInstance.get('/api/profile/roles');
        return response.data;
    },

    // ✅ SET USER ROLE - Assign role to user and complete profile
    setRole: async (roleId) => {
        const response = await axiosInstance.post('/api/profile/set-role', { roleId });
        return response.data;
    }
};
