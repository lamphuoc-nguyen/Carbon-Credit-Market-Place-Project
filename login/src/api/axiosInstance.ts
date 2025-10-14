import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

const _env: any = import.meta as any;
const BASE_URL: string = _env.env?.VITE_API_URL || 'http://localhost:8080';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // ✅ Bật để gửi cookies
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    timeout: 10000, // ✅ Tăng lên 10s
});

// ✅ REQUEST INTERCEPTOR - Tự động thêm token và logging
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = sessionStorage.getItem('authToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // ✅ Log request (dev only)
        if (import.meta.env.DEV) {
            console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// ✅ RESPONSE INTERCEPTOR - Xử lý lỗi tự động và logging
axiosInstance.interceptors.response.use(
    (response) => {
        // ✅ Log response (dev only)
        if (import.meta.env.DEV) {
            console.log(`📥 ${response.config.url}`, response.data);
        }

        return response;
    },
    (error: AxiosError) => {
        // ✅ Xử lý các loại lỗi
        if (error.response) {
            const status = error.response.status;

            // ✅ 401 - Unauthorized: Đăng xuất tự động
            if (status === 401) {
                console.warn('🔐 Unauthorized - Redirecting to login');
                sessionStorage.removeItem('authToken');
                sessionStorage.removeItem('user');

                // Chỉ redirect nếu không phải đang ở trang login
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }

            // ✅ 403 - Forbidden
            else if (status === 403) {
                console.error('🚫 Forbidden - You do not have permission');
            }

            // ✅ 500 - Server Error
            else if (status >= 500) {
                console.error('💥 Server Error:', error.response.data);
            }

            // ✅ Log error details (dev only)
            if (import.meta.env.DEV) {
                console.error(`❌ ${status} ${error.config?.url}`, error.response.data);
            }
        }
        // ✅ Network Error
        else if (error.request) {
            console.error('🌐 Network Error - No response received');
        }
        // ✅ Other Errors
        else {
            console.error('⚠️ Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
export { BASE_URL };