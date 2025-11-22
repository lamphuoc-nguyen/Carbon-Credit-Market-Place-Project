import axiosInstance from "./axiosInstance";

/**
 * API service cho tất cả các endpoint liên quan đến Ví (/api/wallets)
 */
export const walletApi = {

    /**
     * Lấy thông tin ví của user hiện tại
     * GET /api/wallets/my-wallet
     * @returns {Promise<WalletResponse>} Dữ liệu ví của user
     */
    getMyWallet: async () => {
        const response = await axiosInstance.get('/api/wallets/my-wallet');
        return response.data; // Trả về WalletResponse
    },
    /**
     * Nạp tiền vào ví (từ ngân hàng)
     * POST /api/wallets/deposit
     * @param {object} depositData - Dữ liệu nạp tiền (DepositRequest)
     * @param {number | string} depositData.amount - Số tiền
     * @param {string} depositData.paymentMethodId - ID phương thức thanh toán (ví dụ: thẻ)
     * @returns {Promise<WalletResponse>} Dữ liệu ví đã cập nhật
     */
    depositFunds: async (depositData) => {
        if (!depositData || depositData.amount === undefined || !depositData.paymentMethodId) {
            throw new Error('Amount and paymentMethodId are required for deposit.');
        }
        const response = await axiosInstance.post('/api/wallets/deposit', depositData);
        return response.data; // Trả về WalletResponse
    },
    /**
     * Lấy lịch sử giao dịch của ví (từ TransactionService)
     * GET /api/wallets/transactions
     * @param {number} [page=0] - Số trang
     * @param {number} [size=10] - Kích thước trang
     * @returns {Promise<Page<TransactionDTO>>} Đối tượng trang chứa các giao dịch
     */
    getWalletTransactions: async (page = 0, size = 10) => {
        const response = await axiosInstance.get('/api/wallets/transactions', {
            params: { page, size }
        });
        return response.data; // Trả về Page<TransactionDTO>
    },

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * [Admin] Lấy ví của một user bất kỳ bằng ID
     * GET /api/wallets/admin/user/{userId}
     * @param {string} userId - ID của user
     * @returns {Promise<WalletResponse>} Dữ liệu ví của user đó
     */
    getUserWallet: async (userId) => {
        if (!userId) throw new Error('User ID is required');
        const response = await axiosInstance.get(`/api/wallets/admin/user/${userId}`);
        return response.data; // Trả về WalletResponse
    },

    /**
     * [Admin] Cập nhật số dư (cash và credit) cho user
     * PUT /api/wallets/admin/user/{userId}/balance
     * @param {string} userId - ID của user
     * @param {object} balanceData - Dữ liệu cập nhật (gửi qua Query Params)
     * @param {number | string} balanceData.creditAmount - Số credit (có thể âm/dương)
     * @param {number | string} balanceData.cashAmount - Số tiền (có thể âm/dương)
     * @param {number | string} [balanceData.co2Amount] - Số CO2 reduction (có thể âm/dương)
     * @param {string} [balanceData.reason] - Lý do điều chỉnh
     * @returns {Promise<WalletResponse>} Dữ liệu ví đã cập nhật
     */
    updateUserBalance: async (userId, balanceData) => {
        if (!userId) throw new Error('User ID is required');
        if (!balanceData || balanceData.creditAmount === undefined || balanceData.cashAmount === undefined) {
            throw new Error('creditAmount and cashAmount are required.');
        }

        // Lưu ý: Dữ liệu được gửi qua Query Params, không phải Request Body
        const params = {
            creditAmount: balanceData.creditAmount,
            cashAmount: balanceData.cashAmount,
            reason: balanceData.reason
        };

        // Add CO2 amount if provided
        if (balanceData.co2Amount !== undefined) {
            params.co2Amount = balanceData.co2Amount;
        }

        const response = await axiosInstance.put(
            `/api/wallets/admin/user/${userId}/balance`,
            null, // Body là null
            { params } // Gửi data trong params
        );
        return response.data; // Trả về WalletResponse
    },

    /**
     * Lấy số dư CO2 khả dụng (chưa bị khóa để chuyển đổi)
     * Derived from wallet data: co2ReducedKg - co2PendingTransfer
     */
    getAvailableCo2Balance: async () => {
        const response = await axiosInstance.get('/api/wallets/my-wallet');
        const wallet = response.data;

        // Handle different response structures
        const walletData = wallet.data || wallet;

        const total = walletData?.co2ReducedKg || 0;
        const pending = walletData?.co2PendingTransfer || 0; // Defaults to 0 if field doesn't exist

        console.log('💰 Wallet CO2 Data:', {
            total,
            pending,
            available: total - pending,
            rawWalletData: walletData
        });

        return Math.max(0, total - pending); // Ensure non-negative result
    },

    /**
     * Lấy số dư CO2 đang bị khóa (chờ duyệt chuyển đổi)
     */
    getPendingCo2Balance: async () => {
        const response = await axiosInstance.get('/api/wallets/my-wallet');
        const wallet = response.data;

        // Handle different response structures
        const walletData = wallet.data || wallet;

        return walletData?.co2PendingTransfer || 0; // Defaults to 0 if field doesn't exist
    },
};