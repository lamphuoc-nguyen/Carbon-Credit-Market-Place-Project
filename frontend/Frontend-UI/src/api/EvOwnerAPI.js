import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const EvOwnerAPI = {
  // ==================== AUTHENTICATION ====================
  auth: {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
  },

  // ==================== USER PROFILE ====================
  user: {
    getProfile: () => api.get('/users/me'),
    getUserById: (userId) => api.get(`/users/${userId}`),
    getUserByUsername: (username) => api.get(`/users/username/${username}`),
    updateProfile: (userId, userData) => api.put(`/users/${userId}`, userData),
  },

  // ==================== VEHICLE MANAGEMENT ====================
  vehicles: {
    createVehicle: (vehicleData) => api.post('/vehicles', vehicleData),
    getMyVehicles: () => api.get('/vehicles/my-vehicles'),
    getVehicleById: (vehicleId) => api.get(`/vehicles/${vehicleId}`),
    updateVehicle: (vehicleId, vehicleData) => api.put(`/vehicles/${vehicleId}`, vehicleData),
    deleteVehicle: (vehicleId) => api.delete(`/vehicles/${vehicleId}`),
  },

  // ==================== JOURNEY MANAGEMENT ====================
  journeys: {
    createJourney: (journeyData) => api.post('/journeys', journeyData),
    getMyJourneys: () => api.get('/journeys/my-journeys'),
    getJourneyById: (journeyId) => api.get(`/journeys/${journeyId}`),
    updateJourney: (journeyId, journeyData) => api.put(`/journeys/${journeyId}`, journeyData),
    deleteJourney: (journeyId) => api.delete(`/journeys/${journeyId}`),
    getStatistics: () => api.get('/journeys/statistics'),
  },

  // ==================== CARBON CREDITS ====================
  carbonCredits: {
    getAvailableCredits: () => axios.get('http://localhost:8080/carbon-credits'),
    getCreditById: (creditId) => axios.get(`http://localhost:8080/carbon-credits/${creditId}`),
    getMyCreditsByUserId: (userId) => axios.get(`http://localhost:8080/carbon-credits/user/${userId}`),
  },

  // ==================== MARKETPLACE (LISTINGS) ====================
  marketplace: {
    createListing: (creditId, price) => 
      axios.post(`http://localhost:8080/credit-listings/create?creditId=${creditId}&price=${price}`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
      }),
    getActiveListings: (params = {}) => {
      const { page = 0, size = 20, sortBy = 'newest' } = params;
      return axios.get(`http://localhost:8080/credit-listings`, {
        params: { page, size, sortBy },
      });
    },
    searchByPriceRange: (minPrice, maxPrice, params = {}) => {
      const { page = 0, size = 20 } = params;
      return axios.get(`http://localhost:8080/credit-listings/search`, {
        params: { minPrice, maxPrice, page, size },
      });
    },
    getMyListings: (params = {}) => {
      const { page = 0, size = 20 } = params;
      return api.get('/credit-listings/my-listings', { params: { page, size } });
    },
    getMyActiveListings: (params = {}) => {
      const { page = 0, size = 20 } = params;
      return api.get('/credit-listings/my-active-listings', { params: { page, size } });
    },
    updateListingPrice: (listingId, newPrice) => 
      axios.put(`http://localhost:8080/credit-listings/${listingId}/price?newPrice=${newPrice}`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
      }),
    cancelListing: (listingId) => 
      axios.delete(`http://localhost:8080/credit-listings/${listingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
      }),
    getMarketplaceStats: () => axios.get('http://localhost:8080/credit-listings/stats'),
  },

  // ==================== TRANSACTIONS ====================
  transactions: {
    initiatePurchase: (listingId) => 
      axios.post('http://localhost:8080/transactions/purchase', { listingId }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      }),
    completeTransaction: (transactionId) => 
      axios.post(`http://localhost:8080/transactions/${transactionId}/complete`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
      }),
    cancelTransaction: (transactionId) => 
      axios.post(`http://localhost:8080/transactions/${transactionId}/cancel`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
      }),
    getTransactionById: (transactionId) => 
      axios.get(`http://localhost:8080/transactions/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
      }),
    getMyTransactions: (params = {}) => {
      const { page = 0, size = 10 } = params;
      return axios.get('http://localhost:8080/transactions/my-transactions', {
        params: { page, size },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
      });
    },
    getPurchaseHistory: (params = {}) => {
      const { page = 0, size = 10 } = params;
      return axios.get('http://localhost:8080/transactions/purchases', {
        params: { page, size },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
      });
    },
    getSalesHistory: (params = {}) => {
      const { page = 0, size = 10 } = params;
      return axios.get('http://localhost:8080/transactions/sales', {
        params: { page, size },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
      });
    },
    createDispute: (transactionId, reason) => 
      axios.post(`http://localhost:8080/transactions/${transactionId}/dispute`, { reason }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      }),
  },

  // ==================== WALLET ====================
  wallet: {
    getMyWallet: () => api.get('/wallets/my-wallet'),
    checkBalance: (amount, balanceType) => 
      api.get('/wallets/balance-check', {
        params: { amount, balanceType },
      }),
    deposit: (depositData) => api.post('/wallets/deposit', depositData),
    withdraw: (withdrawData) => api.post('/wallets/withdraw', withdrawData),
    getTransactions: (params = {}) => {
      const { page = 0, size = 10 } = params;
      return api.get('/wallets/transactions', { params: { page, size } });
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
    const response = await EvOwnerAPI.wallet.getMyWallet();
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