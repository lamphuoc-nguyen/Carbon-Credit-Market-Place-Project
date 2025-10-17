import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { getValidToken, clearAuthData } from "../utils/tokenUtils";

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

// ✅ REQUEST INTERCEPTOR - Automatically check token validity and add headers
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Use utility function to get valid token (auto-clears expired ones)
        const token = getValidToken();

        // 🔵 Enhanced debugging
        console.log('🔵 Axios Interceptor - Request Config:', {
            url: config.url,
            method: config.method,
            hasToken: !!token,
            tokenPreview: token ? token.substring(0, 20) + '...' : 'NONE',
            fullUrl: config.baseURL + config.url
        });

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Authorization header set with valid token');
        } else {
            console.error('⚠️ No valid token available for request to:', config.url);
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

            // ✅ 401 - Unauthorized: Đăng xuất tự động và clear expired tokens
            if (status === 401) {
                console.warn('🔐 Unauthorized - Token may be expired, clearing storage and redirecting to login');

                // Clear all authentication data
                localStorage.removeItem('authToken');
                sessionStorage.removeItem('authToken');
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');

                // Also clear axios default headers
                delete axiosInstance.defaults.headers.common['Authorization'];

                // Chỉ redirect nếu không phải đang ở trang login
                if (!window.location.pathname.includes('/login')) {
                    console.log('🔄 Redirecting to login page due to expired token');
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