import axios, { AxiosInstance } from "axios";

// Use Vite env var if set, otherwise default to localhost:8080
const _env: any = import.meta as any;
const BASE_URL: string = _env.env?.VITE_API_URL || _env.env?.VITE_API_BASE || 'http://localhost:8080';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: false, // gửi kèm cookie nếu cần thiết (set true when using cookies)
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

// Basic auth helpers targeting /api/auth
const auth = {
    login: async (payload: { username?: string; email?: string; password: string }) => {
        const url = '/api/auth/login';
        const res = await axiosInstance.post(url, payload);
        return res.data;
    },
    register: async (payload: Record<string, any>) => {
        const url = '/api/auth/register';
        const res = await axiosInstance.post(url, payload);
        return res.data;
    },
    // optional: check server health
    ping: async () => {
        const res = await axiosInstance.get('/api/health');
        return res.data;
    }
};

export { axiosInstance, auth, BASE_URL };

export default axiosInstance;