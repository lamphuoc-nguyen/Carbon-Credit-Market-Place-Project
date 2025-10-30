import axiosInstance from "./axiosInstance";

// ✅ Types
export interface User {
    id: string;
    username: string;
    email: string;
    fullName?: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}

interface ApiResponse<T = any> {
    success?: boolean;
    message?: string;
    data?: T;
}

// ✅ Helper function to validate and extract data
const validateResponse = <T>(response: any, errorMessage: string, statusCode: number = 400): T => {
    if (response.data.success === false) {
        const error: any = new Error(response.data.message || errorMessage);
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
    getAllUsers: async (): Promise<User[]> => {
        const response = await axiosInstance.get<ApiResponse<User[]>>('/api/users');
        return validateResponse<User[]>(response, 'Failed to fetch users');
    },

    // ✅ GET USER BY ID
    getUserById: async (id: string): Promise<User> => {
        if (!id) throw new Error('User ID is required');
        const response = await axiosInstance.get<ApiResponse<User>>(`/api/users/${id}`);
        return validateResponse<User>(response, 'Failed to fetch user', 404);
    },

    // ✅ GET CURRENT USER
    getCurrentUser: async (): Promise<User> => {
        const response = await axiosInstance.get<ApiResponse<User>>('/api/users/me');
        return validateResponse<User>(response, 'Failed to fetch current user', 401);
    },

    // ✅ CREATE USER
    createUser: async (userData: Partial<User>): Promise<User> => {
        if (!userData.username || !userData.email) {
            throw new Error('Username and email are required');
        }
        const response = await axiosInstance.post<ApiResponse<User>>('/api/users', userData);
        return validateResponse<User>(response, 'Failed to create user');
    },

    // ✅ UPDATE USER
    updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
        if (!id) throw new Error('User ID is required');
        const response = await axiosInstance.put<ApiResponse<User>>(`/api/users/${id}`, userData);
        return validateResponse<User>(response, 'Failed to update user');
    },

    // ✅ DELETE USER
    deleteUser: async (id: string): Promise<{ success: boolean; message?: string }> => {
        if (!id) throw new Error('User ID is required');
        const response = await axiosInstance.delete<ApiResponse>(`/api/users/${id}`);

        if (response.data.success === false) {
            throw new Error(response.data.message || 'Failed to delete user');
        }

        return {
            success: true,
            message: response.data.message || 'User deleted successfully'
        };
    }
};