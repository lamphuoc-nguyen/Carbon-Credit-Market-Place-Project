import axiosInstance from './axiosInstance';

/**
 * 🛒 Buyer API - Carbon Credit Purchase Operations
 * API dành cho Buyer để mua carbon credits trên marketplace
 *
 * ⚠️ LƯU Ý: Buyer chỉ mua, không bán carbon credits
 * - Để bán carbon credits, sử dụng EV Owner role
 *
 * ⚠️ BACKEND PAYMENT FLOW LIMITATIONS:
 * ==========================================
 * Backend hiện tại có 2 endpoints để mua:
 * 
 * 1. POST /transactions/purchase (Chỉ dùng cho VNPAY)
 *    - Backend HARDCODE "VNPAY_PENDING", bỏ qua paymentMethodId từ request
 *    - Tạo transaction và trả về VNPay payment URL
 *    - Flow: Create transaction → Redirect to VNPay → VNPay callback → Complete transaction
 * 
 * 2. POST /credit-listings/{listingId}/purchase (Legacy, không xử lý wallet)
 *    - Chỉ đóng listing và chuyển credit ownership
 *    - KHÔNG tạo transaction
 *    - KHÔNG trừ tiền buyer wallet
 *    - KHÔNG cộng tiền seller wallet
 * 
 * 💡 GIẢI PHÁP:
 * - VNPAY payment: Dùng initiatePurchaseTransaction() → redirect to paymentUrl
 * - WALLET payment: Dùng purchaseListingWithWallet() (có warning về backend limitation)
 * 
 * 🔧 KHUYẾN NGHỊ:
 * Backend cần được sửa để:
 * - POST /transactions/purchase chấp nhận paymentMethodId từ request
 * - Xử lý WALLET payment trong transaction flow với wallet deduction
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
     * 💰 Thanh toán bằng WALLET - Sử dụng transaction có sẵn
     * POST /transactions/{transactionId}/complete
     * 
     * Flow hoàn chỉnh với backend xử lý wallet:
     * 1. Tạo transaction trước với initiatePurchaseTransaction() hoặc trực tiếp từ backend
     * 2. Kiểm tra số dư wallet
     * 3. Gọi API này để complete transaction
     * 4. Backend sẽ tự động:
     *    - Trừ tiền wallet của buyer (nếu paymentMethod = WALLET)
     *    - Cộng tiền vào wallet của seller
     *    - Cộng credit vào wallet của buyer
     *    - Đóng listing và chuyển ownership
     * 
     * ⚠️ LÀM THẾ NÀO ĐỂ TẠO WALLET TRANSACTION:
     * Backend initiatePurchase() hiện tại set payment method dựa vào paymentMethodId:
     * - Nếu paymentMethodId chứa "VNPAY" → PaymentMethod.VNPAY
     * - Nếu paymentMethodId chứa "BANK" → PaymentMethod.BANK_TRANSFER
     * - Còn lại → PaymentMethod.WALLET
     * 
     * Vì vậy, để tạo WALLET transaction:
     * 1. Gọi initiatePurchaseTransaction(listingId, "WALLET") hoặc "WALLET_PAY"
     * 2. Sau đó gọi payWithWallet(transactionId)
     * 
     * @param {string} transactionId - UUID của transaction đã tạo
     * @returns {Promise<Transaction>} Transaction đã hoàn thành
     */
    payWithWallet: async (transactionId) => {
        try {
            console.log('💰 ========== WALLET PAYMENT FLOW ==========');
            console.log('Transaction ID:', transactionId);
            
            // Complete transaction - backend sẽ xử lý wallet nếu paymentMethod = WALLET
            const response = await axiosInstance.post(`/transactions/${transactionId}/complete`);
            
            console.log('✅ Payment completed successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Wallet payment failed:', error);
            console.error('Error details:', error.response?.data);
            
            // Provide helpful error messages
            if (error.response?.data?.message?.includes('Insufficient')) {
                throw new Error('Insufficient wallet balance. Please deposit more funds.');
            } else if (error.response?.status === 403) {
                throw new Error('Unauthorized. You are not authorized to complete this transaction.');
            } else if (error.response?.status === 404) {
                throw new Error('Transaction not found.');
            } else if (error.response?.status === 400) {
                const errorMsg = error.response.data?.message || 'Invalid transaction state';
                throw new Error(errorMsg);
            } else {
                const errorMsg = error.response?.data?.message || error.message || 'Payment failed';
                throw new Error(errorMsg);
            }
        }
    },

    /**
     * 💰 Mua listing với WALLET payment - Flow hoàn chỉnh từ đầu đến cuối
     * 
     * Flow tự động:
     * 1. Kiểm tra số dư wallet
     * 2. Tạo transaction với paymentMethod = WALLET
     * 3. Complete transaction (backend tự động xử lý wallet)
     * 
     * @param {string} listingId - UUID của listing cần mua
     * @returns {Promise<Transaction>} Transaction đã hoàn thành
     */
    purchaseWithWallet: async (listingId) => {
        try {
            console.log('💰 ========== COMPLETE WALLET PURCHASE FLOW ==========');
            console.log('Listing ID:', listingId);
            
            // Step 1: Tạo transaction với WALLET payment method
            console.log('📝 Step 1: Creating transaction with WALLET payment...');
            const transactionResponse = await axiosInstance.post('/transactions/purchase', {
                listingId,
                paymentMethodId: 'WALLET_PAYMENT' // Không chứa VNPAY hoặc BANK → sẽ thành WALLET
            });
            
            const transactionId = transactionResponse.data.transactionId;
            console.log('✅ Transaction created:', transactionId);
            
            // Step 2: Get transaction details để check amount
            console.log('📊 Step 2: Getting transaction details...');
            const transactionDetails = await axiosInstance.get(`/transactions/${transactionId}`);
            console.log('Transaction amount:', transactionDetails.data.amount);
            
            // Step 3: Check wallet balance
            console.log('💳 Step 3: Checking wallet balance...');
            const hasBalance = await axiosInstance.get('/api/wallets/balance-check', {
                params: { 
                    amount: transactionDetails.data.amount, 
                    balanceType: 'CASH' 
                }
            });
            
            if (!hasBalance.data) {
                // Cancel transaction nếu không đủ tiền
                await axiosInstance.post(`/transactions/${transactionId}/cancel`);
                throw new Error('Insufficient wallet balance. Transaction cancelled.');
            }
            console.log('✅ Balance check passed');
            
            // Step 4: Complete transaction (backend xử lý wallet)
            console.log('💰 Step 4: Completing transaction with wallet payment...');
            const completedTransaction = await axiosInstance.post(`/transactions/${transactionId}/complete`);
            
            console.log('✅ ========== PURCHASE COMPLETED ==========');
            console.log('Completed transaction:', completedTransaction.data);
            
            return completedTransaction.data;
            
        } catch (error) {
            console.error('❌ ========== PURCHASE FAILED ==========');
            console.error('Error:', error);
            console.error('Error details:', error.response?.data);
            
            // Provide helpful error messages
            if (error.message?.includes('Insufficient')) {
                throw error; // Re-throw với message đã format
            } else if (error.response?.status === 404) {
                throw new Error('Listing not found or no longer available.');
            } else if (error.response?.status === 400) {
                throw new Error(error.response.data?.message || 'Invalid purchase request.');
            } else {
                throw new Error(error.message || 'Failed to complete purchase. Please try again.');
            }
        }
    },

    /**
     * 💰 Mua listing với WALLET payment - TẠO TRANSACTION HOÀN CHỈNH (LEGACY)
     * 
     * @deprecated Sử dụng purchaseWithWallet() thay thế - có xử lý wallet đầy đủ
     * 
     * Flow này tạo transaction VNPay (do backend hardcode) nhưng SAU ĐÓ
     * cancel transaction đó và gọi purchase listing trực tiếp.
     * 
     * Lý do: Backend /transactions/purchase LUÔN tạo VNPay transaction,
     * không thể tạo WALLET transaction qua endpoint này.
     * 
     * Flow:
     * 1. Check wallet balance
     * 2. Purchase listing trực tiếp (đóng listing, chuyển credit)
     * 3. Tạo "mock transaction" object để frontend có thể hiển thị
     * 
     * ⚠️ CHÚ Ý: 
     * - Listing sẽ được đóng ✅
     * - Credit sẽ được chuyển ✅
     * - NHƯNG wallet KHÔNG tự động xử lý ❌
     * - Transaction chỉ là object mock, không lưu trong DB ❌
     * 
     * @param {string} listingId - UUID của listing cần mua
     * @param {number} amount - Số tiền cần trả
     * @returns {Promise<Object>} Mock transaction object + listing data
     */
    purchaseListingWithWallet: async (listingId, amount) => {
        try {
            console.log('💰 ========== WALLET PURCHASE FLOW ==========');
            console.log('Listing ID:', listingId);
            console.log('Amount:', amount);
            
            // Step 1: Check balance
            console.log('📊 Step 1: Checking wallet balance...');
            const balanceCheck = await axiosInstance.get('/api/wallets/balance-check', {
                params: { amount, balanceType: 'CASH' }
            });
            
            if (!balanceCheck.data) {
                throw new Error('Insufficient balance in wallet. Please deposit more funds.');
            }
            console.log('✅ Balance check passed');
            
            // Step 2: Get wallet info để biết buyer ID
            console.log('👤 Step 2: Getting wallet info...');
            const walletInfo = await axiosInstance.get('/api/wallets/my-wallet');
            console.log('✅ Wallet info:', walletInfo.data);
            
            // Step 3: Purchase listing trực tiếp
            console.log('🛒 Step 3: Purchasing listing...');
            const purchaseResponse = await axiosInstance.post(`/credit-listings/${listingId}/purchase`);
            console.log('✅ Listing purchased successfully');
            console.log('Listing data:', purchaseResponse.data);
            
            // Step 4: Tạo mock transaction ID
            const mockTransactionId = `WALLET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            console.log('📝 Created mock transaction ID:', mockTransactionId);
            
            // Step 5: Return mock transaction object
            const mockTransaction = {
                // Mock transaction info
                id: mockTransactionId,
                transactionId: mockTransactionId,
                status: 'COMPLETED',
                paymentMethod: 'WALLET',
                amount: amount,
                completedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                
                // Buyer/Seller info
                buyerId: walletInfo.data.userId,
                buyerUsername: walletInfo.data.username,
                sellerId: purchaseResponse.data.credit?.user?.id || purchaseResponse.data.credit?.ownerId,
                sellerUsername: purchaseResponse.data.credit?.user?.username || purchaseResponse.data.credit?.ownerUsername,
                
                // Listing/Credit info
                listing: purchaseResponse.data,
                credit: purchaseResponse.data.credit,
                listingId: listingId,
                creditId: purchaseResponse.data.credit?.id,
                
                // Additional info
                success: true,
                warning: '⚠️ Mock Transaction - Not saved in database',
                note: 'Backend limitation: /transactions/purchase endpoint only supports VNPay. ' +
                      'Listing closed and credit transferred successfully, but transaction not recorded in system.',
                      
                // Recommendations
                recommendations: [
                    '✅ Listing has been closed',
                    '✅ Credit ownership transferred',
                    '⚠️ Wallet balances NOT automatically updated',
                    '💡 Contact admin if wallet balance is incorrect',
                    '🔧 Backend needs fix to support WALLET transactions properly'
                ]
            };
            
            console.log('✅ ========== PURCHASE COMPLETED ==========');
            console.log('Mock Transaction:', mockTransaction);
            
            return mockTransaction;
            
        } catch (error) {
            console.error('❌ ========== PURCHASE FAILED ==========');
            console.error('Error:', error);
            console.error('Error details:', error.response?.data);
            
            // Provide helpful error messages
            if (error.message?.includes('Insufficient balance')) {
                throw new Error('Insufficient wallet balance. Please deposit more funds before purchasing.');
            } else if (error.response?.status === 404) {
                throw new Error('Listing not found or no longer available.');
            } else if (error.response?.status === 400) {
                throw new Error(error.response.data?.message || 'Invalid purchase request.');
            } else {
                throw new Error(error.message || 'Failed to complete purchase. Please try again.');
            }
        }
    },

    /**
     * Mua một listing trên marketplace (legacy method - không xử lý wallet)
     * POST /credit-listings/{listingId}/purchase
     * 
     * ⚠️ WARNING: Endpoint này chỉ đóng listing, KHÔNG xử lý wallet
     * Sử dụng purchaseListingWithWallet() cho đầy đủ flow
     * 
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
     * 💳 Khởi tạo giao dịch mua qua VNPAY
     * POST /transactions/purchase
     * 
     * Backend hiện tại hardcode "VNPAY_PENDING", bỏ qua paymentMethodId từ request
     * Endpoint này chỉ phù hợp cho VNPay payment, trả về payment URL
     * 
     * @param {string} listingId - UUID của listing
     * @param {string} paymentMethodId - Phương thức thanh toán (hiện tại backend ignore field này)
     * @returns {Promise<Object>} Response: { transactionId, paymentUrl }
     */
    initiatePurchaseTransaction: async (listingId, methodId, purchaseQuantity) => {
        try {
            console.log('💳 Initiating purchase transaction...');

            // Xây dựng request body với tên trường chính xác
            const requestBody = {
                listingId: listingId,
                paymentMethodId: methodId, // ✅ Đặt tên trường paymentMethodId (string)
            };

            // ✅ Đặt tên trường quantity (number)
            if (purchaseQuantity !== null && purchaseQuantity !== undefined) {
                requestBody.quantity = purchaseQuantity;
                console.log(`🔢 Partial purchase: ${purchaseQuantity} credits`);
            }

            const response = await axiosInstance.post('/transactions/purchase', requestBody);

            console.log('✅ Transaction created:', response.data);
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
     * Xem tất cả giao dịch mua của buyer
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
    /**
     * 📋 Lấy chi tiết transaction (dùng cho payment success và certificate)
     * GET /transactions/{transactionId}
     * @param {string} transactionId - UUID của transaction
     * @returns {Promise<Transaction>} Chi tiết giao dịch
     */
    getTransactionDetails: async (transactionId) => {
        try {
            console.log('🔄 Fetching transaction details for ID:', transactionId);
            const response = await axiosInstance.get(`/transactions/${transactionId}`);
            console.log('✅ Transaction details received:', response.data);
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi lấy chi tiết giao dịch ${transactionId}:`, error);
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers,
                url: error.config?.url
            });

            if (error.response?.status === 404) {
                throw new Error(`Transaction ${transactionId} not found. It may still be processing.`);
            } else if (error.response?.status === 403) {
                throw new Error('Access denied. You can only view your own transactions.');
            } else if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again in a moment.');
            }

            throw error;
        }
    },

    /**
     * 📄 Lấy thông tin certificate từ transaction (để hiển thị)
     * GET /transactions/{transactionId}
     * 
     * Note: Backend chưa có certificate entity cho purchase transaction,
     * nên sử dụng transaction data để hiển thị như certificate
     * 
     * @param {string} transactionId - UUID của transaction
     * @returns {Promise<Transaction>} Transaction data với đầy đủ thông tin để hiển thị certificate
     */
    getTransactionCertificate: async (transactionId) => {
        try {
            const response = await axiosInstance.get(`/transactions/${transactionId}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi lấy certificate từ transaction ${transactionId}:`, error);
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

    // ==================== RETIREMENT & CERTIFICATE OPERATIONS ====================

    /**
     * 🌿 Khởi tạo retirement (loại bỏ carbon credits vĩnh viễn)
     * POST /api/retirement/initiate
     * 
     * Flow đầy đủ theo backend:
     * 1. Validate user là BUYER
     * 2. Kiểm tra wallet credit balance
     * 3. Trừ ngay credits từ wallet
     * 4. Chọn và đánh dấu CarbonCredit entities là RETIRED (FIFO)
     * 5. Tạo RetirementTransaction (status: COMPLETED)
     * 6. Tạo Certificate (status: PENDING_GENERATION)
     * 7. Gửi notification
     * 8. Trigger async PDF generation
     * 
     * @param {Object} retirementData - Dữ liệu retirement
     * @param {string} retirementData.userId - UUID của buyer
     * @param {number} retirementData.amountToRetireKg - Số lượng credits muốn retire (phải là số nguyên)
     * @param {string} retirementData.projectInfo - Thông tin dự án (optional)
     * @param {string} retirementData.retirementPurpose - Mục đích retire (optional)
     * @returns {Promise<Object>} Response: { retirement, message }
     */
    initiateRetirement: async (retirementData) => {
        try {
            console.log('🌿 ========== INITIATING RETIREMENT ==========');
            console.log('Retirement data:', retirementData);
            
            const response = await axiosInstance.post('/api/retirement/initiate', retirementData);
            
            console.log('✅ Retirement initiated successfully:', response.data);
            console.log('Certificate generation in progress...');
            
            return response.data;
        } catch (error) {
            console.error('❌ ========== RETIREMENT FAILED ==========');
            console.error('Error:', error);
            console.error('Error details:', error.response?.data);
            
            // Provide helpful error messages
            if (error.response?.data?.error?.includes('Insufficient credits')) {
                throw new Error('Insufficient credits in wallet. Please purchase more credits before retiring.');
            } else if (error.response?.data?.error?.includes('Only buyers can retire')) {
                throw new Error('Only BUYER role can retire carbon credits.');
            } else if (error.response?.data?.error?.includes('whole number')) {
                throw new Error('Credit count must be a whole number (no decimals).');
            } else if (error.response?.status === 400) {
                throw new Error(error.response.data?.error || 'Invalid retirement request.');
            } else if (error.response?.status === 404) {
                throw new Error('User not found.');
            }
            
            throw error;
        }
    },

    /**
     * 📄 Lấy chi tiết retirement transaction
     * GET /api/retirement/{retirementId}
     * @param {string} retirementId - UUID của retirement transaction
     * @returns {Promise<RetirementTransaction>} Chi tiết retirement transaction
     */
    getRetirementDetails: async (retirementId) => {
        try {
            console.log('📄 Fetching retirement details:', retirementId);
            const response = await axiosInstance.get(`/api/retirement/${retirementId}`);
            console.log('✅ Retirement details:', response.data);
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi lấy chi tiết retirement ${retirementId}:`, error);
            
            if (error.response?.status === 404) {
                throw new Error('Retirement transaction not found.');
            }
            
            throw error;
        }
    },

    /**
     * 📋 Lấy lịch sử retirement của user
     * GET /api/retirement/user/{userId}
     * @param {string} userId - UUID của user
     * @param {number} page - Số trang (default: 0)
     * @param {number} size - Kích thước trang (default: 10)
     * @returns {Promise} Page object với lịch sử retirement
     */
    getUserRetirementHistory: async (userId, page = 0, size = 10) => {
        try {
            console.log('📋 Fetching retirement history for user:', userId);
            const response = await axiosInstance.get(`/api/retirement/user/${userId}`, {
                params: { page, size }
            });
            console.log(`✅ Found ${response.data.totalElements} retirement transactions`);
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi lấy lịch sử retirement của user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * 🎓 Lấy certificate theo retirement ID
     * GET /api/retirement/{retirementId}/certificate
     * @param {string} retirementId - UUID của retirement transaction
     * @returns {Promise<Certificate>} Certificate với PDF URL
     */
    getRetirementCertificate: async (retirementId) => {
        try {
            console.log('🎓 Fetching certificate for retirement:', retirementId);
            const response = await axiosInstance.get(`/api/retirement/${retirementId}/certificate`);
            console.log('✅ Certificate status:', response.data.status);
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi lấy certificate cho retirement ${retirementId}:`, error);
            
            if (error.response?.status === 404) {
                throw new Error('Certificate not found. It may still be generating.');
            }
            
            throw error;
        }
    },

    /**
     * 📚 Lấy tất cả certificates của user
     * GET /api/retirement/certificates/user/{userId}
     * @param {string} userId - UUID của user
     * @param {number} page - Số trang (default: 0)
     * @param {number} size - Kích thước trang (default: 10)
     * @returns {Promise} Page object với danh sách certificates
     */
    getUserCertificates: async (userId, page = 0, size = 10) => {
        try {
            console.log('📚 Fetching certificates for user:', userId);
            const response = await axiosInstance.get(`/api/retirement/certificates/user/${userId}`, {
                params: { page, size }
            });
            console.log(`✅ Found ${response.data.totalElements} certificates`);
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi lấy certificates của user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * 📥 Lấy download URL cho certificate PDF
     * GET /api/retirement/{retirementId}/certificate/download
     * 
     * Backend sẽ tạo signed URL từ Google Cloud Storage
     * URL có hiệu lực trong 1 giờ
     * 
     * @param {string} retirementId - UUID của retirement transaction
     * @returns {Promise<Object>} { url, fileName, message }
     */
    getCertificateDownloadUrl: async (retirementId) => {
        try {
            console.log('📥 Generating download URL for retirement:', retirementId);
            const response = await axiosInstance.get(`/api/retirement/${retirementId}/certificate/download`);
            console.log('✅ Download URL generated. Valid for 1 hour.');
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi lấy download URL cho retirement ${retirementId}:`, error);
            
            if (error.response?.status === 404) {
                throw new Error('Certificate not found.');
            } else if (error.response?.status === 400) {
                const errorMsg = error.response.data?.error || 'Certificate is not ready for download';
                throw new Error(errorMsg);
            }
            
            throw error;
        }
    },

    /**
     * 📊 Lấy thống kê retirement của user
     * GET /api/retirement/statistics/{userId}
     * 
     * @param {string} userId - UUID của user
     * @returns {Promise<Object>} { totalRetired, completedCount, totalCount }
     */
    getRetirementStatistics: async (userId) => {
        try {
            console.log('📊 Fetching retirement statistics for user:', userId);
            const response = await axiosInstance.get(`/api/retirement/statistics/${userId}`);
            console.log('✅ Retirement stats:', response.data);
            return response.data;
        } catch (error) {
            console.error(`❌ Lỗi khi lấy thống kê retirement của user ${userId}:`, error);
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


    /**
     * 💰 Mua listing với WALLET payment và số lượng cụ thể
     * POST /transactions/purchase + POST /transactions/{id}/complete
     *
     * @param {string} listingId - UUID của listing cần mua
     * @param {number} quantity - Số lượng tonnes cần mua
     * @param {number} totalAmount - Tổng số tiền phải trả
     * @returns {Promise<Transaction>} Transaction đã hoàn thành
     */
    purchaseWithWalletAmount: async (listingId, quantity, totalAmount) => {
        try {
            console.log('💰 ========== PARTIAL WALLET PURCHASE FLOW ==========');
            console.log('Listing ID:', listingId);
            console.log('Quantity:', quantity, 'tonnes');
            console.log('Total Amount:', totalAmount, 'USD');

            // Step 1: Tạo transaction với WALLET payment method và custom amount
            console.log('📝 Step 1: Creating transaction with custom amount...');
            const transactionResponse = await axiosInstance.post('/transactions/purchase', {
                listingId,
                paymentMethodId: 'WALLET_PAYMENT', // Không chứa VNPAY hoặc BANK → sẽ thành WALLET
                customAmount: totalAmount, // Pass custom amount for partial purchase
                quantity: quantity // Pass quantity for partial purchase
            });

            const transactionId = transactionResponse.data.transactionId;
            console.log('✅ Transaction created:', transactionId);

            // Step 2: Check wallet balance
            console.log('💳 Step 2: Checking wallet balance...');
            const hasBalance = await axiosInstance.get('/api/wallets/balance-check', {
                params: {
                    amount: totalAmount,
                    balanceType: 'CASH'
                }
            });

            if (!hasBalance.data) {
                // Cancel transaction nếu không đủ tiền
                await axiosInstance.post(`/transactions/${transactionId}/cancel`);
                throw new Error('Insufficient wallet balance. Transaction cancelled.');
            }
            console.log('✅ Balance check passed');

            // Step 3: Complete transaction (backend xử lý wallet)
            console.log('💰 Step 3: Completing transaction with wallet payment...');
            const completedTransaction = await axiosInstance.post(`/transactions/${transactionId}/complete`);

            console.log('✅ ========== PARTIAL PURCHASE COMPLETED ==========');
            console.log('Completed transaction:', completedTransaction.data);

            return completedTransaction.data;

        } catch (error) {
            console.error('❌ ========== PARTIAL PURCHASE FAILED ==========');
            console.error('Error:', error);
            console.error('Error details:', error.response?.data);

            // Provide helpful error messages
            if (error.message?.includes('Insufficient')) {
                throw error; // Re-throw với message đã format
            } else if (error.response?.status === 404) {
                throw new Error('Listing not found or no longer available.');
            } else if (error.response?.status === 400) {
                throw new Error(error.response.data?.message || 'Invalid purchase request.');
            } else {
                throw new Error(error.message || 'Failed to complete purchase. Please try again.');
            }
        }
    },

    // ==================== PENDING TRANSACTION MANAGEMENT ====================

    /**
     * 🕐 Lấy tất cả giao dịch đang pending của user
     * GET /transactions/my-transactions?status=PENDING
     * @returns {Promise} Danh sách các transaction pending
     */
    getPendingTransactions: async () => {
        try {
            console.log('🔄 Fetching pending transactions...');
            const response = await axiosInstance.get('/transactions/my-transactions', {
                params: { status: 'PENDING', size: 50 } // Get all pending transactions
            });

            // Filter to only get PENDING transactions (double check)
            const pendingTransactions = response.data.content?.filter(tx => tx.status === 'PENDING') || [];
            console.log('✅ Found pending transactions:', pendingTransactions.length);

            return pendingTransactions;
        } catch (error) {
            console.error('❌ Error fetching pending transactions:', error);
            throw error;
        }
    },

    /**
     * 🔄 Resume a pending VNPay transaction (regenerate payment URL)
     * POST /transactions/{transactionId}/resume-payment
     * @param {string} transactionId - UUID of the pending transaction
     * @returns {Promise} New payment URL and updated transaction
     */
    resumeVNPayTransaction: async (transactionId) => {
        try {
            console.log('🔄 Resuming VNPay transaction:', transactionId);

            // Get transaction details first to validate it's PENDING and VNPay
            const transaction = await axiosInstance.get(`/transactions/${transactionId}`);

            if (transaction.data.status !== 'PENDING') {
                throw new Error('Transaction is not in pending status');
            }

            if (!transaction.data.paymentMethod ||
                (!transaction.data.paymentMethod.includes('VNPAY') &&
                 !transaction.data.paymentMethod.includes('BANK'))) {
                throw new Error('Only VNPay transactions can be resumed');
            }

            // Try to regenerate VNPay URL - this might need a custom backend endpoint
            // For now, we'll use the existing VNPay creation flow
            const response = await axiosInstance.post('/transactions/purchase', {
                listingId: transaction.data.listingId,
                paymentMethodId: 'VNPAY_BANK_TRANSFER'
            });

            console.log('✅ VNPay transaction resumed:', response.data);
            return response.data;

        } catch (error) {
            console.error('❌ Error resuming VNPay transaction:', error);

            if (error.response?.status === 404) {
                throw new Error('Transaction not found or expired');
            } else if (error.response?.status === 400) {
                throw new Error(error.response.data?.message || 'Cannot resume this transaction');
            }

            throw error;
        }
    },

    /**
     * ❌ Cancel a pending transaction permanently
     * POST /transactions/{transactionId}/cancel
     * @param {string} transactionId - UUID of the pending transaction
     * @param {string} reason - Reason for cancellation
     * @returns {Promise} Cancelled transaction details
     */
    cancelPendingTransaction: async (transactionId, reason = 'Cancelled by user') => {
        try {
            console.log('❌ Cancelling pending transaction:', transactionId, 'Reason:', reason);

            const response = await axiosInstance.post(`/transactions/${transactionId}/cancel`, {
                reason: reason
            });

            console.log('✅ Transaction cancelled successfully');
            return response.data;

        } catch (error) {
            console.error('❌ Error cancelling transaction:', error);

            if (error.response?.status === 404) {
                throw new Error('Transaction not found');
            } else if (error.response?.status === 400) {
                throw new Error(error.response.data?.message || 'Cannot cancel this transaction');
            }

            throw error;
        }
    },

    /**
     * 🔄 Complete a pending wallet transaction
     * POST /transactions/{transactionId}/complete
     * @param {string} transactionId - UUID of the pending wallet transaction
     * @returns {Promise} Completed transaction details
     */
    completePendingWalletTransaction: async (transactionId) => {
        try {
            console.log('💰 Completing pending wallet transaction:', transactionId);

            // Get transaction details first to validate
            const transaction = await axiosInstance.get(`/transactions/${transactionId}`);

            if (transaction.data.status !== 'PENDING') {
                throw new Error('Transaction is not in pending status');
            }

            if (!transaction.data.paymentMethod ||
                !transaction.data.paymentMethod.includes('WALLET')) {
                throw new Error('Only wallet transactions can be completed this way');
            }

            // Complete the transaction
            const response = await axiosInstance.post(`/transactions/${transactionId}/complete`);

            console.log('✅ Wallet transaction completed successfully');
            return response.data;

        } catch (error) {
            console.error('❌ Error completing wallet transaction:', error);

            if (error.response?.status === 400) {
                throw new Error(error.response.data?.message || 'Insufficient wallet balance or invalid transaction');
            }

            throw error;
        }
    },
};
