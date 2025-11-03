// src/api/cvaApi.js

import axiosInstance from './axiosInstance'; // Import axios instance đã cấu hình

/**
 * Xử lý lỗi và trích xuất dữ liệu từ ApiResponse
 * @param {Promise<object>} request - Lệnh gọi API (ví dụ: axiosInstance.get(...))
 * @returns {Promise<any>} - Chỉ trả về phần 'data' từ ApiResponse
 */
const handleRequest = async (request) => {
    try {
        const response = await request;
        // Giả sử API của bạn luôn trả về cấu trúc { success: true, data: ... }
        if (response.data && response.data.success) {
            return response.data.data;
        }
        // Xử lý trường hợp success: false
        throw new Error(response.data.message || 'API request failed');
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        // Ném lỗi để component có thể bắt và xử lý (ví dụ: setError state)
        throw error;
    }
};

/**
 * API service cho các chức năng của CVA (Carbon Verification Authority)
 */
export const cvaApi = {
    /**
     * Lấy tất cả các hành trình đang chờ duyệt
     * GET /api/cva/pending-journeys
     */
    getPendingJourneys: () => {
        // SỬA LỖI: Dùng axiosInstance
        return handleRequest(axiosInstance.get('/api/cva/pending-journeys'));
    },

    /**
     * Lấy chi tiết một hành trình để xem xét
     * GET /api/cva/journey/{id}
     */
    getJourneyForReview: (journeyId) => {
        // SỬA LỖI: Dùng axiosInstance
        return handleRequest(axiosInstance.get(`/api/cva/journey/${journeyId}`));
    },

    /**
     * Duyệt một hành trình
     * POST /api/cva/journey/{id}/approve
     */
    approveJourney: (journeyId, notes) => {
        // SỬA LỖI: Dùng axiosInstance
        return handleRequest(axiosInstance.post(
            `/api/cva/journey/${journeyId}/approve`,
            null, // Không có body
            { params: { notes } } // Gửi 'notes' làm query param
        ));
    },

    /**
     * Từ chối một hành trình
     * POST /api/cva/journey/{id}/reject
     */
    rejectJourney: (journeyId, reason) => {
        // SỬA LỖI: Dùng axiosInstance
        return handleRequest(axiosInstance.post(
            `/api/cva/journey/${journeyId}/reject`,
            null, // Không có body
            { params: { reason } } // Gửi 'reason' làm query param
        ));
    },

    /**
     * Lấy thống kê của CVA hiện tại
     * GET /api/cva/statistics
     */
    getCVAStatistics: () => {
        // SỬA LỖI: Dùng axiosInstance
        return handleRequest(axiosInstance.get('/api/cva/statistics'));
    },

    /**
     * Lấy lịch sử các hành trình đã được CVA này xử lý
     * GET /api/cva/my-verifications
     */
    getMyVerifications: () => {
        // SỬA LỖI: Dùng axiosInstance
        return handleRequest(axiosInstance.get('/api/cva/my-verifications'));
    },
};