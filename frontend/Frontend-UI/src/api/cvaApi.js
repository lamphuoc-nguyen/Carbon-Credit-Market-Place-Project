// src/api/cvaApi.js

import axiosInstance from './axiosInstance';

/**
 * Helper: Xử lý lỗi và trích xuất dữ liệu từ ApiResponse
 */
const handleRequest = async (request) => {
    try {
        const response = await request;
        // Controller trả về ApiResponse dạng: { success: boolean, message: string, data: object }
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'API request failed');
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * API service cho CVA (Carbon Verification Authority)
 * Base URL: /api/cva
 */
export const cvaApi = {

    // ================== QUẢN LÝ YÊU CẦU CHUYỂN ĐỔI (TRANSFER REQUESTS) ==================

    /**
     * Lấy danh sách các yêu cầu chuyển đổi CO2 đang chờ duyệt
     * Endpoint: GET /api/cva/pending-transfer-requests
     */
    getPendingTransferRequests: () => {
        return handleRequest(axiosInstance.get('/api/cva/pending-transfer-requests'));
    },

    /**
     * Duyệt yêu cầu chuyển đổi CO2 -> Credit
     * Endpoint: POST /api/cva/transfer-request/{requestId}/approve
     * @param {string} requestId - UUID của request
     * @param {string} [notes] - Ghi chú (Optional, mặc định backend sẽ set là "Approved by CVA")
     */
    approveTransferRequest: (requestId, notes) => {
        return handleRequest(axiosInstance.post(
            `/api/cva/transfer-request/${requestId}/approve`,
            null, // Body trống vì dùng @RequestParam
            {
                params: { notes } // Gửi dưới dạng query param: ?notes=...
            }
        ));
    },

    /**
     * Từ chối yêu cầu chuyển đổi (Hoàn trả CO2 cho user)
     * Endpoint: POST /api/cva/transfer-request/{requestId}/reject
     * @param {string} requestId - UUID của request
     * @param {string} reason - Lý do từ chối (Bắt buộc)
     */
    rejectTransferRequest: (requestId, reason) => {
        return handleRequest(axiosInstance.post(
            `/api/cva/transfer-request/${requestId}/reject`,
            null, // Body trống
            {
                params: { reason } // Gửi dưới dạng query param: ?reason=...
            }
        ));
    },

    /**
     * Lấy thống kê dashboard cho CVA
     * Endpoint: GET /api/cva/transfer-statistics
     */
    getTransferStatistics: () => {
        return handleRequest(axiosInstance.get('/api/cva/transfer-statistics'));
    },

    // ================== QUẢN LÝ LỊCH SỬ & TÍN CHỈ (VERIFICATIONS & CREDITS) ==================

    /**
     * Lấy lịch sử các hành trình/yêu cầu đã được CVA hiện tại xác minh
     * Endpoint: GET /api/cva/my-verifications
     * @param {number} page - Trang số mấy (mặc định 0)
     * @param {number} size - Số lượng item mỗi trang (mặc định 20)
     */
    getMyVerifications: (page = 0, size = 20) => {
        return handleRequest(axiosInstance.get('/api/cva/my-verifications', {
            params: { page, size }
        }));
    },

    /**
     * Lấy tất cả các Carbon Credit đã được xác minh trên hệ thống
     * Endpoint: GET /api/cva/verified-credits
     */
    getVerifiedCredits: () => {
        return handleRequest(axiosInstance.get('/api/cva/verified-credits'));
    }
};