import axiosInstance from "./axiosInstance";

/**
 * API service cho tất cả các endpoint liên quan đến Giao dịch (/transactions)
 * Controller Base URL: /transactions
 */
export const transactionApi = {

    // ==================== CORE TRANSACTION FLOW ====================

    /**
     * Khởi tạo một giao dịch mua (Purchase)
     * Endpoint: POST /transactions/purchase
     * @param {Object} purchaseRequest - { listingId: string, paymentMethodId: string, quantity: number (optional) }
     */
    initiatePurchase: async (purchaseRequest) => {
        try {
            const response = await axiosInstance.post('/transactions/purchase', purchaseRequest);
            return response.data; // Trả về { transactionId, paymentMethod, paymentUrl (nếu có), message }
        } catch (error) {
            console.error("Error initiating purchase:", error);
            throw error;
        }
    },

    /**
     * Hoàn thành một giao dịch (sau khi thanh toán thành công hoặc dùng ví)
     * Endpoint: POST /transactions/{transactionId}/complete
     */
    completeTransaction: async (transactionId) => {
        if (!transactionId) throw new Error('Transaction ID is required');
        try {
            const response = await axiosInstance.post(`/transactions/${transactionId}/complete`);
            return response.data; // Trả về TransactionDTO
        } catch (error) {
            console.error(`Error completing transaction ${transactionId}:`, error);
            throw error;
        }
    },

    /**
     * Hủy một giao dịch (trước khi hoàn thành)
     * Endpoint: POST /transactions/{transactionId}/cancel
     */
    cancelTransaction: async (transactionId) => {
        if (!transactionId) throw new Error('Transaction ID is required');
        try {
            const response = await axiosInstance.post(`/transactions/${transactionId}/cancel`);
            return response.data; // Trả về TransactionDTO
        } catch (error) {
            console.error(`Error cancelling transaction ${transactionId}:`, error);
            throw error;
        }
    },

    // ==================== READ / HISTORY OPERATIONS ====================

    /**
     * Lấy chi tiết một giao dịch cụ thể
     * Endpoint: GET /transactions/{transactionId}
     */
    getTransactionById: async (transactionId) => {
        if (!transactionId) throw new Error('Transaction ID is required');
        try {
            const response = await axiosInstance.get(`/transactions/${transactionId}`);
            return response.data; // Trả về TransactionDTO
        } catch (error) {
            console.error(`Error fetching transaction ${transactionId}:`, error);
            throw error;
        }
    },

    /**
     * Kiểm tra trạng thái rút gọn của giao dịch (dùng cho polling sau khi thanh toán)
     * Endpoint: GET /transactions/{transactionId}/status
     */
    getTransactionStatus: async (transactionId) => {
        try {
            const response = await axiosInstance.get(`/transactions/${transactionId}/status`);
            return response.data; // Trả về Map { status, isPurchaseSuccessful, ... }
        } catch (error) {
            console.error(`Error fetching status for ${transactionId}:`, error);
            throw error;
        }
    },

    /**
     * Lấy lịch sử giao dịch của người dùng (cả mua và bán)
     * Endpoint: GET /transactions/my-transactions
     * @param {number} page - Trang hiện tại (0-indexed)
     * @param {number} size - Số lượng item mỗi trang
     */
    getMyTransactions: async (page = 0, size = 10) => {
        try {
            const response = await axiosInstance.get('/transactions/my-transactions', {
                params: { page, size }
            });
            return response.data; // Trả về Page<TransactionDTO>
        } catch (error) {
            console.error("Error fetching my transactions:", error);
            throw error;
        }
    },

    /**
     * Lấy lịch sử mua hàng của người dùng (Chỉ mua)
     * Endpoint: GET /transactions/purchases
     */
    getPurchaseHistory: async (page = 0, size = 10) => {
        try {
            const response = await axiosInstance.get('/transactions/purchases', {
                params: { page, size }
            });
            return response.data; // Trả về Page<TransactionDTO>
        } catch (error) {
            console.error("Error fetching purchase history:", error);
            throw error;
        }
    },

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * [Admin] Lấy tất cả giao dịch trong hệ thống
     * Endpoint: GET /transactions/admin/all-transactions
     * @param {number} page - Trang hiện tại (0-indexed)
     * @param {number} size - Số lượng item mỗi trang
     */
    getAllTransactions: async (page = 0, size = 100) => {
        try {
            const response = await axiosInstance.get('/transactions/admin/all-transactions', {
                params: { page, size }
            });
            return response.data; // Trả về Page<TransactionDTO>
        } catch (error) {
            console.error("Error fetching all transactions:", error);
            throw error;
        }
    },

    /**
     * [Admin] Lấy thống kê về các giao dịch
     * Endpoint: GET /transactions/admin/statistics
     * @param {string} [startDate] - ISO Date String
     * @param {string} [endDate] - ISO Date String
     */
    getTransactionStatistics: async (startDate, endDate) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        try {
            const response = await axiosInstance.get('/transactions/admin/statistics', { params });
            return response.data; // Trả về Map<String, Object>
        } catch (error) {
            console.error("Error fetching transaction statistics:", error);
            throw error;
        }
    }

    // LƯU Ý: Đã xóa hàm getDisputedTransactions vì trong TransactionController.java 
    // bạn cung cấp KHÔNG CÓ endpoint /transactions/admin/disputed.
};