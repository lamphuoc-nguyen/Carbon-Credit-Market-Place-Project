import axiosInstance from "./axiosInstance";

export const userApi = {
    getAllUsers: async () => {
        const response = await axiosInstance.get('/api/users');
        return response.data;
    },

    getUserById: async (id: string) => {
        const response = await axiosInstance.get(`/api/users/${id}`);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await axiosInstance.get('/api/users/me');
        return response.data;
    },

    createUser: async (userData: any) => {
        const response = await axiosInstance.post('/api/users', userData);
        return response.data;
    },

    updateUser: async (id: string, userData: any) => {
        const response = await axiosInstance.put(`/api/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id: string) => {
        const response = await axiosInstance.delete(`/api/users/${id}`);
        return response.data;
    }
};