import axiosInstance from "./index.ts";

export const userApi = {

    getAllUsers: async () => {
        const response = await axiosInstance.get('/users');
        return response;
    },

    getUserById: async (id) => {
        const response = await axiosInstance.get(`/users/${id}`);
        return response;
    },

    createUser: async (userData) => {
        const response = await axiosInstance.post('/users', userData);
        return response;
    },

    updateUser: async (id, userData) => {
        const response = await axiosInstance.put(`/users/${id}`, userData);
        return response;
    },

    deleteUser: async (id) => {
        const response = await axiosInstance.delete(`/users/${id}`);
        return response;
    }
}