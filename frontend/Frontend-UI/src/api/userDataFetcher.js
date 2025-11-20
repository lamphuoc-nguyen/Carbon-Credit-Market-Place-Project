// Central data fetcher with built-in deduplication for common user data
import axiosInstance from './axiosInstance';

class UserDataFetcher {
    constructor() {
        this.cache = new Map();
        this.pendingRequests = new Map();
        this.cacheTimeout = 30000; // 30 seconds cache
    }

    // Generate cache key
    generateKey(endpoint, params = {}) {
        return `${endpoint}_${JSON.stringify(params)}`;
    }

    // Check if cached data is still valid
    isCacheValid(key) {
        const cached = this.cache.get(key);
        return cached && (Date.now() - cached.timestamp < this.cacheTimeout);
    }

    // Generic fetch with deduplication and caching
    async fetchData(endpoint, params = {}) {
        const key = this.generateKey(endpoint, params);

        // Return cached data if valid
        if (this.isCacheValid(key)) {
            console.log('📦 Returning cached data for:', key);
            return this.cache.get(key).data;
        }

        // Return pending request if one exists
        if (this.pendingRequests.has(key)) {
            console.log('⏳ Waiting for pending request:', key);
            return this.pendingRequests.get(key);
        }

        // Create new request
        console.log('🔄 Making fresh request for:', key);
        const requestPromise = this.makeRequest(endpoint, params)
            .then(response => {
                // Cache successful response
                this.cache.set(key, {
                    data: response,
                    timestamp: Date.now()
                });

                // Remove from pending requests
                this.pendingRequests.delete(key);
                return response;
            })
            .catch(error => {
                // Remove from pending requests on error
                this.pendingRequests.delete(key);
                throw error;
            });

        // Store as pending
        this.pendingRequests.set(key, requestPromise);
        return requestPromise;
    }

    // Make the actual HTTP request
    async makeRequest(endpoint, params = {}) {
        if (Object.keys(params).length > 0) {
            return axiosInstance.get(endpoint, { params });
        } else {
            return axiosInstance.get(endpoint);
        }
    }

    // Clear cache for specific key or all
    clearCache(key = null) {
        if (key) {
            this.cache.delete(key);
            console.log('🧹 Cleared cache for:', key);
        } else {
            this.cache.clear();
            console.log('🧹 Cleared all cache');
        }
    }

    // Clear expired cache entries
    clearExpiredCache() {
        const now = Date.now();
        for (const [key, cached] of this.cache.entries()) {
            if (now - cached.timestamp >= this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }

    // Specific methods for common data fetching
    async getUserProfile() {
        return this.fetchData('/api/users/me');
    }

    async getWalletData() {
        return this.fetchData('/api/wallets/my-wallet');
    }

    async getCo2TransferRequests() {
        return this.fetchData('/api/co2-transfer/my-requests');
    }

    async getUserCarbonCredits(userId) {
        return this.fetchData(`/carbon-credits/user/${userId}`);
    }

    // Force refresh specific data
    async refreshUserProfile() {
        this.clearCache(this.generateKey('/api/users/me'));
        return this.getUserProfile();
    }

    async refreshWalletData() {
        this.clearCache(this.generateKey('/api/wallets/my-wallet'));
        return this.getWalletData();
    }

    async refreshCo2TransferRequests() {
        this.clearCache(this.generateKey('/api/co2-transfer/my-requests'));
        return this.getCo2TransferRequests();
    }

    // Invalidate cache when data changes (call after mutations)
    invalidateUserData() {
        this.clearCache(this.generateKey('/api/users/me'));
    }

    invalidateWalletData() {
        this.clearCache(this.generateKey('/api/wallets/my-wallet'));
    }

    invalidateCo2TransferData() {
        this.clearCache(this.generateKey('/api/co2-transfer/my-requests'));
    }
}

// Export singleton instance
const userDataFetcher = new UserDataFetcher();

// Setup periodic cache cleanup
setInterval(() => {
    userDataFetcher.clearExpiredCache();
}, 60000); // Clean every minute

export default userDataFetcher;
