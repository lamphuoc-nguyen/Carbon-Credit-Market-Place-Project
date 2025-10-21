import axiosInstance from "./axiosInstance";

// ✅ Helper function to validate and extract data
const validateResponse = (response, errorMessage, statusCode = 400) => {
    if (response.data.success === false) {
        const error = new Error(response.data.message || errorMessage);
        error.response = {
            status: statusCode,
            statusText: 'Error',
            data: response.data,
            headers: {},
            config: response.config
        };
        throw error;
    }
    return response.data.data || response.data;
};

export const userApi = {
    // ✅ GET ALL USERS
    getAllUsers: async () => {
        const response = await axiosInstance.get('/api/users');
        return validateResponse(response, 'Failed to fetch users');
    },

    // ✅ GET USER BY ID
    getUserById: async (id) => {
        if (!id) throw new Error('User ID is required');
        const response = await axiosInstance.get(`/api/users/${id}`);
        return validateResponse(response, 'Failed to fetch user', 404);
    },

    // ✅ GET CURRENT USER
    getCurrentUser: async () => {
        const response = await axiosInstance.get('/api/users/me');
        return validateResponse(response, 'Failed to fetch current user', 401);
    },

    // ✅ CREATE USER
    createUser: async (userData) => {
        if (!userData.username || !userData.email) {
            throw new Error('Username and email are required');
        }
        const response = await axiosInstance.post('/api/users', userData);
        return validateResponse(response, 'Failed to create user');
    },

    // ✅ UPDATE USER
    updateUser: async (id, userData) => {
        if (!id) throw new Error('User ID is required');
        const response = await axiosInstance.put(`/api/users/${id}`, userData);
        return validateResponse(response, 'Failed to update user');
    },

    // ✅ DELETE USER
    deleteUser: async (id) => {
        if (!id) throw new Error('User ID is required');
        const response = await axiosInstance.delete(`/api/users/${id}`);

        if (response.data.success === false) {
            throw new Error(response.data.message || 'Failed to delete user');
        }

        return {
            success: true,
            message: response.data.message || 'User deleted successfully'
        };
    }
};
