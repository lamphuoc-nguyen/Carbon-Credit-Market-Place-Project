import axiosInstance from "./axiosInstance";

/**
 * API service cho tất cả các endpoint liên quan đến Giao dịch (/transactions)
 */
export const transactionApi = {

    /**
     * Bắt đầu một giao dịch (mua) từ một listing
     * POST /transactions/purchase
     * @param {string} listingId - ID của listing carbon credit
     * @returns {Promise<TransactionDTO>} Dữ liệu giao dịch vừa được khởi tạo
     */
    initiatePurchase: async (listingId) => {
        if (!listingId) throw new Error('Listing ID is required');

        // Body yêu cầu một PurchaseRequest, mà nó chứa listingId
        const response = await axiosInstance.post('/transactions/purchase', { listingId });
        return response.data; // Trả về TransactionDTO
    },

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

    /**
     * Lấy thông tin chi tiết một giao dịch bằng ID
     * GET /transactions/{transactionId}
     * @param {string} transactionId - ID của giao dịch
     * @returns {Promise<TransactionDTO>} Dữ liệu giao dịch chi tiết
     */
    getTransactionById: async (transactionId) => {
        if (!transactionId) throw new Error('Transaction ID is required');

        const response = await axiosInstance.get(`/transactions/${transactionId}`);
        return response.data; // Trả về TransactionDTO
    },

    /**
     * Lấy lịch sử tất cả giao dịch (mua và bán) của user hiện tại (phân trang)
     * GET /transactions/my-transactions
     * @param {number} [page=0] - Số trang
     * @param {number} [size=10] - Kích thước trang
     * @returns {Promise<Page<TransactionDTO>>} Đối tượng trang chứa các giao dịch
     */
    getMyTransactions: async (page = 0, size = 10) => {
        const response = await axiosInstance.get('/transactions/my-transactions', {
            params: { page, size }
        });
        return response.data; // Trả về Page<TransactionDTO>
    },

    /**
     * Lấy lịch sử mua hàng của user hiện tại (phân trang)
     * GET /transactions/purchases
     * @param {number} [page=0] - Số trang
     * @param {number} [size=10] - Kích thước trang
     * @returns {Promise<Page<TransactionDTO>>} Đối tượng trang chứa các giao dịch mua
     */
    getPurchaseHistory: async (page = 0, size = 10) => {
        const response = await axiosInstance.get('/transactions/purchases', {
            params: { page, size }
        });
        return response.data; // Trả về Page<TransactionDTO>
    },

    /**
     * Lấy lịch sử bán hàng của user hiện tại (phân trang)
     * GET /transactions/sales
     * @param {number} [page=0] - Số trang
     * @param {number} [size=10] - Kích thước trang
     * @returns {Promise<Page<TransactionDTO>>} Đối tượng trang chứa các giao dịch bán
     */
    getSalesHistory: async (page = 0, size = 10) => {
        const response = await axiosInstance.get('/transactions/sales', {
            params: { page, size }
        });
        return response.data; // Trả về Page<TransactionDTO>
    },

    /**
     * Tạo một khiếu nại (dispute) cho giao dịch
     * POST /transactions/{transactionId}/dispute
     * @param {string} transactionId - ID của giao dịch
     * @param {string} reason - Lý do khiếu nại
     * @returns {Promise<DisputeDTO>} Dữ liệu khiếu nại vừa được tạo
     */
    createDispute: async (transactionId, reason) => {
        if (!transactionId || !reason) throw new Error('Transaction ID and reason are required');

        // Body yêu cầu một DisputeRequest, mà nó chứa reason
        const response = await axiosInstance.post(`/transactions/${transactionId}/dispute`, { reason });
        return response.data; // Trả về DisputeDTO
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