import axiosInstance from "./axiosInstance";

/**
 * API service cho tất cả các endpoint liên quan đến Giao dịch (/transactions)
 */
export const transactionApi = {
    /**
     * Hoàn thành một giao dịch (sau khi đã thanh toán)
     * POST /transactions/{transactionId}/complete
     * @param {string} transactionId - ID của giao dịch
     * @returns {Promise<TransactionDTO>} Dữ liệu giao dịch đã hoàn thành
     */
    completeTransaction: async (transactionId) => {
        if (!transactionId) throw new Error('Transaction ID is required');

        const response = await axiosInstance.post(`/transactions/${transactionId}/complete`);
        return response.data; // Trả về TransactionDTO
    },

    /**
     * Hủy một giao dịch (trước khi hoàn thành)
     * POST /transactions/{transactionId}/cancel
     * @param {string} transactionId - ID của giao dịch
     * @returns {Promise<TransactionDTO>} Dữ liệu giao dịch đã bị hủy
     */
    cancelTransaction: async (transactionId) => {
        if (!transactionId) throw new Error('Transaction ID is required');

        const response = await axiosInstance.post(`/transactions/${transactionId}/cancel`);
        return response.data; // Trả về TransactionDTO
    },
// ==================== ADMIN ENDPOINTS ====================

    /**
     * [Admin] Lấy tất cả các giao dịch đang bị khiếu nại (phân trang)
     * GET /transactions/admin/disputed
     * @param {number} [page=0] - Số trang
     * @param {number} [size=10] - Kích thước trang
     * @returns {Promise<Page<TransactionDTO>>} Đối tượng trang chứa các giao dịch bị khiếu nại
     */
    getDisputedTransactions: async (page = 0, size = 10) => {
        const response = await axiosInstance.get('/transactions/admin/disputed', {
            params: { page, size }
        });
        return response.data; // Trả về Page<TransactionDTO>
    },

    /**
     * [Admin] Lấy thống kê về các giao dịch
     * GET /transactions/admin/statistics
     * @param {string} [startDate] - Ngày bắt đầu (ISO string, ví dụ: '2023-01-01T00:00:00')
     * @param {string} [endDate] - Ngày kết thúc (ISO string)
     * @returns {Promise<Map<string, Object>>} Đối tượng chứa dữ liệu thống kê
     */
    getTransactionStatistics: async (startDate, endDate) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await axiosInstance.get('/transactions/admin/statistics', { params });
        return response.data; // Trả về Map<String, Object>
    }





    
};