import axiosInstance from "./axiosInstance";

export const authApi = {
    login: async (payload: { username?: string; email?: string; password: string }) => {
        const response = await axiosInstance.post('/api/auth/login', payload);
        return response.data;
    },

    register: async (payload: any) => {
        const response = await axiosInstance.post('/api/auth/register', payload);
        return response.data;
    },

    logout: async () => {
        try {
            await axiosInstance.post('/api/auth/logout');
        } finally {
            sessionStorage.removeItem('authToken');
        }
    },

    forgotPassword: async (email: string) => {
        const response = await axiosInstance.post('/api/auth/forgot-password', { email });
        return response.data;
    },

    ping: async () => {
        const response = await axiosInstance.get('/api/health');
        return response.data;
    }
};