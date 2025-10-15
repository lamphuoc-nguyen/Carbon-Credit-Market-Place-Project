import axiosInstance from "./axiosInstance";

// ✅ Define types
export interface LoginPayload {
    usernameOrEmail: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    tokenType: string;
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
    // ✅ LOGIN - Updated to match backend AuthResponseDto structure
    login: async (payload: LoginPayload): Promise<LoginResponse> => {
        const response = await axiosInstance.post<LoginResponse>('/api/auth/login', payload);

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