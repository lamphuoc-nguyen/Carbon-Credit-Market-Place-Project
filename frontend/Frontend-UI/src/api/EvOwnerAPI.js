import axiosInstance from './axiosInstance';

const EvOwnerAPI = {
  // ==================== AUTHENTICATION ====================
  auth: {
    register: (userData) => axiosInstance.post('/api/auth/register', userData),
    login: (credentials) => axiosInstance.post('/api/auth/login', credentials),
    logout: () => axiosInstance.post('/api/auth/logout'),
  },

  // ==================== USER PROFILE ====================
  user: {
    getProfile: () => axiosInstance.get('/api/users/me'),
    getUserById: (userId) => axiosInstance.get(`/api/users/${userId}`),
    getUserByUsername: (username) => axiosInstance.get(`/api/users/username/${username}`),
    updateProfile: (userId, userData) => axiosInstance.put(`/api/users/${userId}`, userData),
  },

  // ==================== VEHICLE MANAGEMENT ====================
  vehicles: {
    createVehicle: (vehicleData) => axiosInstance.post('/api/vehicles', vehicleData),
    getMyVehicles: () => axiosInstance.get('/api/vehicles/my-vehicles'),
    getVehicleById: (vehicleId) => axiosInstance.get(`/api/vehicles/${vehicleId}`),
    updateVehicle: (vehicleId, vehicleData) => axiosInstance.put(`/api/vehicles/${vehicleId}`, vehicleData),
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
    getAvailableCredits: () => axiosInstance.get('/api/carbon-credits'),
    getCreditById: (creditId) => axiosInstance.get(`/api/carbon-credits/${creditId}`),
    getMyCreditsByUserId: (userId) => axiosInstance.get(`/carbon-credits/user/${userId}`),
  },

  // ==================== MARKETPLACE (LISTINGS) ====================
  marketplace: {
    createListing: (creditId, price, sellerLocation) => {
      const params = new URLSearchParams();
      params.append('creditId', creditId);
      params.append('price', price);
      if (sellerLocation) {
        params.append('sellerLocation', sellerLocation);
      }
      return axiosInstance.post(`/credit-listings/create?${params.toString()}`);
    },

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

// ==================== USAGE EXAMPLES ====================
/*

// 1. AUTHENTICATION
const register = async () => {
  try {
    const response = await EvOwnerAPI.auth.register({
      username: "evowner1",
      email: "evowner1@example.com",
      password: "password123",
      fullName: "John Doe",
      phone: "0123456789",
      role: "EV_OWNER"
    });
    localStorage.setItem('token', response.data.accessToken);
  } catch (error) {
    console.error('Registration failed:', error.response?.data);
  }
};

// 2. CREATE VEHICLE
const addVehicle = async () => {
  try {
    const response = await EvOwnerAPI.vehicles.createVehicle({
      userId: "user-uuid-here",
      vin: "1HGBH41JXMN109186",
      model: "Tesla Model 3",
      registrationDate: "2023-01-15"
    });
    console.log('Vehicle created:', response.data);
  } catch (error) {
    console.error('Failed to create vehicle:', error.response?.data);
  }
};

// 3. CREATE JOURNEY
const logJourney = async () => {
  try {
    const response = await EvOwnerAPI.journeys.createJourney({
      vehicleId: "vehicle-uuid-here",
      distanceKm: 50.5,
      energyConsumedKwh: 12.5,
      co2ReducedKg: 25.2,
      startLocation: "City A",
      endLocation: "City B",
      journeyDate: "2024-01-15T10:00:00"
    });
    console.log('Journey created:', response.data);
  } catch (error) {
    console.error('Failed to create journey:', error.response?.data);
  }
};

// 4. CREATE LISTING
const listCredit = async () => {
  try {
    const response = await EvOwnerAPI.marketplace.createListing(
      "credit-uuid-here",
      25.50
    );
    console.log('Listing created:', response.data);
  } catch (error) {
    console.error('Failed to create listing:', error.response?.data);
  }
};

// 5. GET WALLET INFO
const checkWallet = async () => {
  try {
    const response = await EvOwnerAPI.wallets.getMyWallet();
    console.log('Wallet info:', response.data);
  } catch (error) {
    console.error('Failed to get wallet:', error.response?.data);
  }
};

// 6. GET JOURNEY STATISTICS
const getStats = async () => {
  try {
    const response = await EvOwnerAPI.journeys.getStatistics();
    console.log('Journey stats:', response.data);
  } catch (error) {
    console.error('Failed to get stats:', error.response?.data);
  }
};

// 7. UPDATE LISTING PRICE
const updatePrice = async () => {
  try {
    const response = await EvOwnerAPI.marketplace.updateListingPrice(
      "listing-uuid-here",
      30.00
    );
    console.log('Price updated:', response.data);
  } catch (error) {
    console.error('Failed to update price:', error.response?.data);
  }
};

*/
