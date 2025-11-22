import axiosInstance from './axiosInstance';

const EvOwnerAPI = {
  // ==================== AUTHENTICATION ====================
  auth: {
  login: (credentials) => axiosInstance.post('/api/auth/login', credentials)
  },

  // ==================== USER PROFILE ====================
  user: {
    getProfile: () => axiosInstance.get('/api/users/me'),
    updateProfile: (userId, userData) => axiosInstance.put(`/api/users/${userId}`, userData),
  },

  // ==================== VEHICLE MANAGEMENT ====================
  vehicles: {
    createVehicle: (vehicleData) => axiosInstance.post('/api/vehicles', vehicleData),
    getMyVehicles: () => axiosInstance.get('/api/vehicles/my-vehicles'),
    deleteVehicle: (vehicleId) => axiosInstance.delete(`/api/vehicles/${vehicleId}`),
  },

  // ==================== JOURNEY MANAGEMENT ====================
  journeys: {
    getMyJourneys: () => axiosInstance.get('/api/journeys/my-journeys'),
     // CSV import functionality
    importCsv: (csvFile) => {
      const formData = new FormData();
      formData.append('file', csvFile);
      return axiosInstance.post('/api/journeys/import-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },

  // ==================== CARBON CREDITS ====================
  carbonCredits: {
getMyCreditsByUserId: (userId) => axiosInstance.get(`/carbon-credits/user/${userId}`)
  },

  // ==================== MARKETPLACE (LISTINGS) ====================
  marketplace: {
// Create combined listing from multiple credits
    createCombinedListing: (creditIds, pricePerCredit, sellerLocation) => {
      const params = new URLSearchParams();
      creditIds.forEach(id => params.append('creditIds', id));
      params.append('pricePerCredit', pricePerCredit);
      if (sellerLocation) {
        params.append('sellerLocation', sellerLocation);
      }

      return axiosInstance.post(`/credit-listings/create-combined?${params.toString()}`);
    },

    getActiveListings: (params = {}) => {
      const { page = 0, size = 20, sortBy = 'newest' } = params;
      return axiosInstance.get('/credit-listings', {
        params: { page, size, sortBy },
      });
    },

    searchByPriceRange: (minPrice, maxPrice, params = {}) => {
      const { page = 0, size = 20 } = params;
      return axiosInstance.get('/credit-listings/search', {
        params: { minPrice, maxPrice, page, size },
      });
    },

      getMyListings: async (page = 0, size = 20) => {
          return await axiosInstance.get('/credit-listings/my-listings', {
              params: { page, size }
          });
      },

      // 2. Cập nhật giá listing
      updateListingPrice: async (listingId, newPrice) => {
          // Endpoint: PUT /credit-listings/{id}/price?newPrice=...
          return await axiosInstance.put(`/credit-listings/${listingId}/price`, null, {
              params: { newPrice }
          });
      },

      // 3. Hủy listing
      cancelListing: async (listingId) => {
          // Endpoint: DELETE /credit-listings/{id}
          return await axiosInstance.delete(`/credit-listings/${listingId}`);
      },

    getMarketplaceStats: () => axiosInstance.get('/credit-listings/stats'),
  },

  // ==================== TRANSACTIONS ====================
  transactions: {
    initiatePurchase: (listingId) => 
      axiosInstance.post('/transactions/purchase', { listingId }),

    completeTransaction: (transactionId) =>
      axiosInstance.post(`/transactions/${transactionId}/complete`),

    cancelTransaction: (transactionId) =>
      axiosInstance.post(`/transactions/${transactionId}/cancel`),

    getTransactionById: (transactionId) =>
      axiosInstance.get(`/transactions/${transactionId}`),

    getMyTransactions: (params = {}) => {
      const { page = 0, size = 10 } = params;
      return axiosInstance.get('/transactions/my-transactions', {
        params: { page, size },
      });
    },

    getPurchaseHistory: (params = {}) => {
      const { page = 0, size = 10 } = params;
      return axiosInstance.get('/transactions/purchases', {
        params: { page, size },
      });
    },

    getSalesHistory: (params = {}) => {
      const { page = 0, size = 10 } = params;
      return axiosInstance.get('/transactions/sales', {
        params: { page, size },
      });
    },

    createDispute: (transactionId, reason) =>
      axiosInstance.post(`/transactions/${transactionId}/dispute`, { reason }),
  },

  // ==================== WALLET MANAGEMENT ====================
  wallets: {
    getMyWallet: () => axiosInstance.get('/api/wallets/my-wallet'),
    checkBalance: (amount, balanceType) =>
      axiosInstance.get('/api/wallets/balance-check', {
        params: { amount, balanceType },
      }),
    deposit: (depositData) => axiosInstance.post('/api/wallets/deposit', depositData),
    withdraw: (withdrawData) => axiosInstance.post('/api/wallets/withdraw', withdrawData),
    getTransactions: (params = {}) => {
      const { page = 0, size = 10 } = params;
      return axiosInstance.get('/api/wallets/transactions', { params: { page, size } });
    },
  },
};

export default EvOwnerAPI;

