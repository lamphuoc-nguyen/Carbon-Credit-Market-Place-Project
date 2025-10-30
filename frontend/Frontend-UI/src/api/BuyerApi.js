import axiosInstance from './axiosInstance';

/**
 * 🛒 Buyer API - Marketplace Operations
 * API dành cho Buyer để mua và quản lý carbon credits trên marketplace
 */
export const buyerApi = {
    // ==================== MARKETPLACE BROWSING ====================

    /**
     * Xem tất cả listings đang active trên marketplace
     * GET /credit-listings
     * @param {number} page - Số trang (default: 0)
     * @param {number} size - Kích thước trang (default: 20)
     * @param {string} sortBy - Sắp xếp: 'newest', 'oldest', 'price-low', 'price-high'
     * @returns {Promise} Page object với danh sách listings
     */
    getMarketplaceListings: async (page = 0, size = 20, sortBy = 'newest') => {
        try {
            const response = await axiosInstance.get('/credit-listings', {
                params: { page, size, sortBy }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy danh sách marketplace:', error);
            throw error;
        }
    },

    /**
     * Tìm kiếm listings theo khoảng giá
     * GET /credit-listings/search
     * @param {number} minPrice - Giá tối thiểu
     * @param {number} maxPrice - Giá tối đa
     * @param {number} page - Số trang (default: 0)
     * @param {number} size - Kích thước trang (default: 20)
     * @param {string} sortBy - Sắp xếp: 'newest', 'oldest', 'price-low', 'price-high'
     * @returns {Promise} Page object với kết quả tìm kiếm
     */
    searchByPriceRange: async (minPrice, maxPrice, page = 0, size = 20, sortBy = 'newest') => {
        try {
            const response = await axiosInstance.get('/credit-listings/search', {
                params: { minPrice, maxPrice, page, size, sortBy }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi tìm kiếm theo giá:', error);
            throw error;
        }
    },

    /**
     * Xem chi tiết thống kê marketplace
     * GET /credit-listings/stats
     * @returns {Promise} Marketplace statistics object
     */
    getMarketplaceStats: async () => {
        try {
            const response = await axiosInstance.get('/credit-listings/stats');
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy thống kê marketplace:', error);
            throw error;
        }
    },

    // ==================== CARBON CREDITS INFO ====================

    /**
     * Xem tất cả carbon credits có sẵn
     * GET /carbon-credits
     * @returns {Promise} Danh sách carbon credits
     */
    getAvailableCredits: async () => {
        try {
            const response = await axiosInstance.get('/carbon-credits');
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy danh sách credits:', error);
            throw error;
        }
    },

    /**
     * Xem chi tiết carbon credit theo ID
     * GET /carbon-credits/{creditId}
     * @param {string} creditId - UUID của carbon credit
     * @returns {Promise} Chi tiết carbon credit
     */
    getCreditDetails: async (creditId) => {
        try {
            const response = await axiosInstance.get(`/carbon-credits/${creditId}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi lấy chi tiết credit ${creditId}:`, error);
            throw error;
        }
    },

    // ==================== PURCHASE OPERATIONS ====================

    /**
     * Mua một listing trên marketplace
     * POST /credit-listings/{listingId}/purchase
     * @param {string} listingId - UUID của listing cần mua
     * @returns {Promise} Thông tin listing đã mua
     */
    purchaseListing: async (listingId) => {
        try {
            const response = await axiosInstance.post(`/credit-listings/${listingId}/purchase`);
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi mua listing ${listingId}:`, error);
            throw error;
        }
    },

    /**
     * Khởi tạo giao dịch mua (alternative method)
     * POST /transactions/purchase
     * @param {string} listingId - UUID của listing
     * @param {string} paymentMethodId - Phương thức thanh toán (WALLET, VNPAY, BANK)
     * @returns {Promise} Transaction object
     */
    initiatePurchaseTransaction: async (listingId, paymentMethodId = 'WALLET') => {
        try {
            const response = await axiosInstance.post('/transactions/purchase', {
                listingId,
                paymentMethodId
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi khởi tạo giao dịch:', error);
            throw error;
        }
    },

    /**
     * Hoàn thành giao dịch mua
     * POST /transactions/{transactionId}/complete
     * @param {string} transactionId - UUID của transaction
     * @returns {Promise} Transaction đã hoàn thành
     */
    completeTransaction: async (transactionId) => {
        try {
            const response = await axiosInstance.post(`/transactions/${transactionId}/complete`);
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi hoàn thành giao dịch ${transactionId}:`, error);
            throw error;
        }
    },

    /**
     * Hủy giao dịch mua
     * POST /transactions/{transactionId}/cancel
     * @param {string} transactionId - UUID của transaction
     * @returns {Promise} Transaction đã hủy
     */
    cancelTransaction: async (transactionId) => {
        try {
            const response = await axiosInstance.post(`/transactions/${transactionId}/cancel`);
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi hủy giao dịch ${transactionId}:`, error);
            throw error;
        }
    },

    // ==================== TRANSACTION HISTORY ====================

    /**
     * Xem tất cả giao dịch của buyer (mua + bán)
     * GET /transactions/my-transactions
     * @param {number} page - Số trang (default: 0)
     * @param {number} size - Kích thước trang (default: 10)
     * @returns {Promise} Page object với danh sách transactions
     */
    getMyTransactions: async (page = 0, size = 10) => {
        try {
            const response = await axiosInstance.get('/transactions/my-transactions', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy lịch sử giao dịch:', error);
            throw error;
        }
    },

    /**
     * Xem lịch sử mua hàng
     * GET /transactions/purchases
     * @param {number} page - Số trang (default: 0)
     * @param {number} size - Kích thước trang (default: 10)
     * @returns {Promise} Page object với lịch sử mua
     */
    getPurchaseHistory: async (page = 0, size = 10) => {
        try {
            const response = await axiosInstance.get('/transactions/purchases', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy lịch sử mua:', error);
            throw error;
        }
    },

    /**
     * Xem chi tiết giao dịch theo ID
     * GET /transactions/{transactionId}
     * @param {string} transactionId - UUID của transaction
     * @returns {Promise} Chi tiết transaction
     */
    getTransactionDetails: async (transactionId) => {
        try {
            const response = await axiosInstance.get(`/transactions/${transactionId}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi lấy chi tiết giao dịch ${transactionId}:`, error);
            throw error;
        }
    },

    // ==================== WALLET OPERATIONS ====================

    /**
     * Xem thông tin ví của buyer
     * GET /api/wallets/my-wallet
     * @returns {Promise} Wallet information
     */
    getMyWallet: async () => {
        try {
            const response = await axiosInstance.get('/api/wallets/my-wallet');
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy thông tin ví:', error);
            throw error;
        }
    },

    /**
     * Kiểm tra số dư có đủ để mua không
     * GET /api/wallets/balance-check
     * @param {number} amount - Số tiền cần kiểm tra
     * @param {string} balanceType - Loại số dư: 'CASH' hoặc 'CREDIT' (default: 'CASH')
     * @returns {Promise<boolean>} true nếu đủ số dư, false nếu không đủ
     */
    checkSufficientBalance: async (amount, balanceType = 'CASH') => {
        try {
            const response = await axiosInstance.get('/api/wallets/balance-check', {
                params: { amount, balanceType }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi kiểm tra số dư:', error);
            throw error;
        }
    },

    /**
     * Nạp tiền vào ví
     * POST /api/wallets/deposit
     * @param {number} amount - Số tiền nạp
     * @param {string} paymentMethodId - ID phương thức thanh toán
     * @returns {Promise} Wallet đã cập nhật
     */
    depositFunds: async (amount, paymentMethodId) => {
        try {
            const response = await axiosInstance.post('/api/wallets/deposit', {
                amount,
                paymentMethodId
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi nạp tiền:', error);
            throw error;
        }
    },

    /**
     * Rút tiền từ ví
     * POST /api/wallets/withdraw
     * @param {number} amount - Số tiền rút
     * @param {string} bankAccountInfo - Thông tin tài khoản ngân hàng
     * @returns {Promise} Wallet đã cập nhật
     */
    withdrawFunds: async (amount, bankAccountInfo) => {
        try {
            const response = await axiosInstance.post('/api/wallets/withdraw', {
                amount,
                bankAccountInfo
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi rút tiền:', error);
            throw error;
        }
    },

    /**
     * Xem lịch sử giao dịch ví
     * GET /api/wallets/transactions
     * @param {number} page - Số trang (default: 0)
     * @param {number} size - Kích thước trang (default: 10)
     * @returns {Promise} Page object với lịch sử giao dịch ví
     */
    getWalletTransactions: async (page = 0, size = 10) => {
        try {
            const response = await axiosInstance.get('/api/wallets/transactions', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy lịch sử giao dịch ví:', error);
            throw error;
        }
    },

    // ==================== DISPUTE MANAGEMENT ====================

    /**
     * Tạo khiếu nại cho giao dịch
     * POST /transactions/{transactionId}/dispute
     * @param {string} transactionId - UUID của transaction
     * @param {string} reason - Lý do khiếu nại
     * @returns {Promise} Dispute object
     */
    createDispute: async (transactionId, reason) => {
        try {
            const response = await axiosInstance.post(`/transactions/${transactionId}/dispute`, {
                reason
            });
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi tạo khiếu nại cho giao dịch ${transactionId}:`, error);
            throw error;
        }
    },

    // ==================== MY LISTINGS (Nếu buyer cũng bán) ====================

    /**
     * Xem tất cả listings của tôi
     * GET /credit-listings/my-listings
     * @param {number} page - Số trang (default: 0)
     * @param {number} size - Kích thước trang (default: 20)
     * @returns {Promise} Page object với danh sách listings của tôi
     */
    getMyListings: async (page = 0, size = 20) => {
        try {
            const response = await axiosInstance.get('/credit-listings/my-listings', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy danh sách listings của tôi:', error);
            throw error;
        }
    },

    /**
     * Xem các listings đang active của tôi
     * GET /credit-listings/my-active-listings
     * @param {number} page - Số trang (default: 0)
     * @param {number} size - Kích thước trang (default: 20)
     * @returns {Promise} Page object với listings active
     */
    getMyActiveListings: async (page = 0, size = 20) => {
        try {
            const response = await axiosInstance.get('/credit-listings/my-active-listings', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy listings active của tôi:', error);
            throw error;
        }
    },

    /**
     * Tạo listing mới (nếu buyer có credits để bán)
     * POST /credit-listings/create
     * @param {string} creditId - UUID của carbon credit
     * @param {number} price - Giá listing
     * @returns {Promise} Listing đã tạo
     */
    createListing: async (creditId, price) => {
        try {
            const response = await axiosInstance.post('/credit-listings/create', null, {
                params: { creditId, price }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi tạo listing:', error);
            throw error;
        }
    },

    /**
     * Cập nhật giá listing
     * PUT /credit-listings/{listingId}/price
     * @param {string} listingId - UUID của listing
     * @param {number} newPrice - Giá mới
     * @returns {Promise} Listing đã cập nhật
     */
    updateListingPrice: async (listingId, newPrice) => {
        try {
            const response = await axiosInstance.put(`/credit-listings/${listingId}/price`, null, {
                params: { newPrice }
            });
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi cập nhật giá listing ${listingId}:`, error);
            throw error;
        }
    },

    /**
     * Hủy listing
     * DELETE /credit-listings/{listingId}
     * @param {string} listingId - UUID của listing
     * @returns {Promise} Listing đã hủy
     */
    cancelListing: async (listingId) => {
        try {
            const response = await axiosInstance.delete(`/credit-listings/${listingId}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi hủy listing ${listingId}:`, error);
            throw error;
        }
    },

    /**
     * Xem lịch sử bán hàng (nếu buyer cũng là seller)
     * GET /transactions/sales
     * @param {number} page - Số trang (default: 0)
     * @param {number} size - Kích thước trang (default: 10)
     * @returns {Promise} Page object với lịch sử bán
     */
    getSalesHistory: async (page = 0, size = 10) => {
        try {
            const response = await axiosInstance.get('/transactions/sales', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy lịch sử bán:', error);
            throw error;
        }
    },
};
