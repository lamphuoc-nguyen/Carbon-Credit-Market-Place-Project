import axiosInstance from "./index.ts";

export const userApi = {
    // Authentication APIs
    login: async (credentials) => {
        try {
            const response = await axiosInstance.post('/login', credentials);
            // Lưu token vào localStorage nếu có
            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    register: async (userData) => {
        try {
            const response = await axiosInstance.post('/register', userData);
            // Tự động lưu token nếu backend trả về sau khi đăng ký
            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getAuthToken: () => {
        return localStorage.getItem('authToken');
    },

    // User Management APIs
    getAllUsers: async () => {
        try {
            const response = await axiosInstance.get('/users');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getUserById: async (id) => {
        try {
            const response = await axiosInstance.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    createUser: async (userData) => {
        try {
            const response = await axiosInstance.post('/users', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateUser: async (id, userData) => {
        try {
            const response = await axiosInstance.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteUser: async (id) => {
        try {
            const response = await axiosInstance.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}