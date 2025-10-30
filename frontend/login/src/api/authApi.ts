import axiosInstance from "./axiosInstance";

// ✅ Define types
export interface LoginResponse {
    success?: boolean;
    token?: string;
    user?: {
        id: string;
        username: string;
        email: string;
        role?: string;
        [key: string]: any;
    };
    message?: string;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    businessType?: number;
    [key: string]: any;
}

export interface ApiResponse {
    success?: boolean;
    message?: string;
    [key: string]: any;
}

// ✅ Helper function to create validation errors
const createValidationError = (message: string, status: number, data: any, config: any) => {
    const error: any = new Error(message);
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
    // ✅ LOGIN - Kiểm tra response và throw error nếu không hợp lệ
    login: async (payload: { username?: string; email?: string; password: string }): Promise<LoginResponse> => {
        const response = await axiosInstance.post<LoginResponse>('/api/auth/login', payload);

        // ✅ VALIDATE: Nếu success = false hoặc không có token → throw error
        if (response.data.success === false || !response.data.token) {
            throw createValidationError(
                response.data.message || 'Invalid username or password',
                401,
                response.data,
                response.config
            );
        }

        return response.data;
    },

    // ✅ REGISTER - Kiểm tra response
    register: async (payload: RegisterPayload): Promise<ApiResponse> => {
        const response = await axiosInstance.post<ApiResponse>('/api/auth/register', payload);

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
    logout: async (): Promise<void> => {
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
    forgotPassword: async (email: string): Promise<ApiResponse> => {
        const response = await axiosInstance.post<ApiResponse>('/api/auth/forgot-password', { email });

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
    resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
        const response = await axiosInstance.post<ApiResponse>('/api/auth/reset-password', {
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
    ping: async (): Promise<any> => {
        const response = await axiosInstance.get('/api/health');
        return response.data;
    }
};