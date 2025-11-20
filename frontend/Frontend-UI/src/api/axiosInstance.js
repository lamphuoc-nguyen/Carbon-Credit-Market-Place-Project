import axios from "axios";
import { getValidToken } from "../utils/tokenUtils";

const _env = import.meta;
const BASE_URL = _env.env?.VITE_API_URL || 'http://localhost:8080';

// Request deduplication map to prevent simultaneous identical requests
const pendingRequests = new Map();

// Create axios instance
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Helper function to create request key for deduplication
const createRequestKey = (config) => {
    const { method, url, params } = config;
    // Don't include data in key for deduplication as it might vary
    return `${method?.toUpperCase()}_${url}_${JSON.stringify(params || {})}`;
};

// Create a wrapper around axios that handles deduplication
const axiosWrapper = {
    get: (url, config = {}) => makeDeduplicatedRequest('GET', url, null, config),
    post: (url, data = null, config = {}) => makeDeduplicatedRequest('POST', url, data, config),
    put: (url, data = null, config = {}) => makeDeduplicatedRequest('PUT', url, data, config),
    delete: (url, config = {}) => makeDeduplicatedRequest('DELETE', url, null, config),
    patch: (url, data = null, config = {}) => makeDeduplicatedRequest('PATCH', url, data, config),
};

// Enhanced request function with deduplication
async function makeDeduplicatedRequest(method, url, data, config = {}) {
    // Create request configuration
    const requestConfig = {
        method: method.toLowerCase(),
        url,
        data,
        ...config
    };

    // Create request key for deduplication
    const requestKey = createRequestKey(requestConfig);

    // Check if identical request is already pending
    if (pendingRequests.has(requestKey)) {
        console.log('🔄 Deduplicating identical request:', requestKey);
        return pendingRequests.get(requestKey);
    }

    console.log('🔵 Making new request:', {
        method,
        url,
        requestKey: requestKey.substring(0, 60) + '...'
    });

    // Create the request promise
    const requestPromise = axiosInstance(requestConfig)
        .then(response => {
            // Clean up on success
            pendingRequests.delete(requestKey);
            return response;
        })
        .catch(error => {
            // Clean up on error
            pendingRequests.delete(requestKey);
            throw error;
        });

    // Store the promise to deduplicate future identical requests
    pendingRequests.set(requestKey, requestPromise);

    // Also clean up after a timeout as safety measure
    setTimeout(() => {
        pendingRequests.delete(requestKey);
    }, 5000);

    return requestPromise;
}

// Copy other axios properties/methods
Object.setPrototypeOf(axiosWrapper, axiosInstance);
axiosWrapper.defaults = axiosInstance.defaults;
axiosWrapper.interceptors = axiosInstance.interceptors;

// ✅ REQUEST INTERCEPTOR - Simplified to focus on token handling
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getValidToken();

        console.log('🔵 Axios Request:', {
            url: config.url,
            method: config.method,
            hasToken: !!token
        });

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// ✅ RESPONSE INTERCEPTOR - Enhanced error handling
axiosInstance.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
        }
        return response;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;

            if (status === 401) {
                console.warn('🔐 401 Unauthorized received');

                const isAuthEndpoint = error.config.url?.includes('/auth/') ||
                                     error.config.url?.includes('/login');

                if (!isAuthEndpoint) {
                    const currentToken = getValidToken();
                    if (!currentToken) {
                        console.warn('🧹 Clearing expired auth data');

                        localStorage.removeItem('authToken');
                        sessionStorage.removeItem('authToken');
                        localStorage.removeItem('user');
                        sessionStorage.removeItem('user');

                        if (!window.location.pathname.includes('/login') &&
                            !window.location.pathname.includes('/register')) {

                            console.log('🔄 Redirecting to login');
                            setTimeout(() => {
                                window.location.href = '/login';
                            }, 100);
                        }
                    }
                }
            } else if (status === 403) {
                console.error('🚫 Forbidden - Insufficient permissions');
            } else if (status >= 500) {
                console.error('💥 Server Error:', error.response.status);
            }

            if (import.meta.env.DEV) {
                console.error(`❌ ${status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
            }
        } else if (error.request) {
            console.error('🌐 Network Error - No response');
        } else {
            console.error('⚠️ Request Setup Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosWrapper;
export { BASE_URL };
