/**
 * 🧪 Test API Connection - For Debugging Transaction Issues
 * 
 * Chạy file này trong browser console để test API
 */

import axiosInstance from '../api/axiosInstance';

export const testAPI = {
    /**
     * Test backend connection
     */
    async testBackendConnection() {
        console.log('🔄 Testing backend connection...');
        try {
            const response = await axiosInstance.get('/');
            console.log('✅ Backend is running!');
            console.log('Response:', response);
            return true;
        } catch (error) {
            console.error('❌ Cannot connect to backend');
            console.error('Error:', error.message);
            return false;
        }
    },

    /**
     * Test authentication token
     */
    testAuthToken() {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        console.log('🔑 Testing authentication...');
        if (token) {
            console.log('✅ Token found:', token.substring(0, 20) + '...');
            
            // Decode JWT (basic check)
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    console.log('Token payload:', payload);
                    console.log('Token expires:', new Date(payload.exp * 1000));
                    
                    if (payload.exp * 1000 < Date.now()) {
                        console.warn('⚠️ Token is EXPIRED! Please login again.');
                        return false;
                    }
                }
            } catch (e) {
                console.warn('Cannot decode token');
            }
            return true;
        } else {
            console.error('❌ No token found. Please login.');
            return false;
        }
    },

    /**
     * Test user role
     */
    testUserRole() {
        console.log('👤 Testing user role...');
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            console.log('User:', user.username);
            console.log('Role:', user.role);
            
            if (user.role === 'BUYER') {
                console.log('✅ User has BUYER role');
                return true;
            } else {
                console.warn('⚠️ User role is', user.role, '(should be BUYER)');
                return false;
            }
        } else {
            console.error('❌ No user data found');
            return false;
        }
    },

    /**
     * Test transaction API with a listing ID
     */
    async testCreateTransaction(listingId) {
        console.log('=== TESTING TRANSACTION API ===');
        console.log('Listing ID:', listingId);
        
        if (!listingId) {
            console.error('❌ Please provide a listing ID');
            console.log('Usage: testAPI.testCreateTransaction("your-listing-uuid")');
            return;
        }

        try {
            console.log('🔄 Sending POST request to /transactions/purchase...');
            const response = await axiosInstance.post('/transactions/purchase', {
                listingId: listingId
            });
            
            console.log('✅ Transaction created successfully!');
            console.log('Response Status:', response.status);
            console.log('Response Data:', response.data);
            console.log('Transaction ID:', response.data.id);
            console.log('Transaction Status:', response.data.status);
            
            return response.data;
        } catch (error) {
            console.error('❌ Transaction creation failed!');
            console.error('Error:', error.message);
            
            if (error.response) {
                console.error('HTTP Status:', error.response.status);
                console.error('Error Data:', error.response.data);
                console.error('Error Message:', error.response.data?.message);
            } else if (error.request) {
                console.error('No response from server');
            }
            
            throw error;
        }
    },

    /**
     * Test wallet balance check
     */
    async testWalletBalance() {
        console.log('💰 Testing wallet API...');
        try {
            const response = await axiosInstance.get('/api/wallets/my-wallet');
            console.log('✅ Wallet data retrieved:');
            console.log('Cash Balance:', response.data.cashBalance);
            console.log('Credit Balance:', response.data.creditBalance);
            return response.data;
        } catch (error) {
            console.error('❌ Cannot get wallet data');
            console.error('Error:', error.message);
            throw error;
        }
    },

    /**
     * Test marketplace listings
     */
    async testGetListings() {
        console.log('📋 Testing marketplace listings API...');
        try {
            const response = await axiosInstance.get('/credit-listings', {
                params: { page: 0, size: 5 }
            });
            console.log('✅ Listings retrieved:');
            console.log('Total:', response.data.totalElements);
            console.log('Listings:', response.data.content);
            
            if (response.data.content && response.data.content.length > 0) {
                const firstListing = response.data.content[0];
                console.log('\n📌 First listing details:');
                console.log('ID:', firstListing.id);
                console.log('Price:', firstListing.price);
                console.log('Status:', firstListing.status);
            }
            
            return response.data;
        } catch (error) {
            console.error('❌ Cannot get listings');
            console.error('Error:', error.message);
            throw error;
        }
    },

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 RUNNING ALL API TESTS...\n');
        
        const results = {
            backend: false,
            token: false,
            role: false,
            wallet: false,
            listings: false
        };

        // Test 1: Backend connection
        results.backend = await this.testBackendConnection();
        console.log('\n---\n');

        // Test 2: Auth token
        results.token = this.testAuthToken();
        console.log('\n---\n');

        // Test 3: User role
        results.role = this.testUserRole();
        console.log('\n---\n');

        // Test 4: Wallet
        try {
            await this.testWalletBalance();
            results.wallet = true;
        } catch (e) {
            results.wallet = false;
        }
        console.log('\n---\n');

        // Test 5: Listings
        try {
            const listings = await this.testGetListings();
            results.listings = true;
            
            // If we have listings, show how to test transaction
            if (listings.content && listings.content.length > 0) {
                const firstListingId = listings.content[0].id;
                console.log('\n📝 To test transaction creation, run:');
                console.log(`testAPI.testCreateTransaction("${firstListingId}")`);
            }
        } catch (e) {
            results.listings = false;
        }

        console.log('\n=== TEST RESULTS ===');
        console.log('Backend Connection:', results.backend ? '✅' : '❌');
        console.log('Authentication Token:', results.token ? '✅' : '❌');
        console.log('User Role (BUYER):', results.role ? '✅' : '❌');
        console.log('Wallet API:', results.wallet ? '✅' : '❌');
        console.log('Listings API:', results.listings ? '✅' : '❌');

        const allPassed = Object.values(results).every(r => r === true);
        console.log('\nOverall:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

        return results;
    }
};

// Export for browser console usage
if (typeof window !== 'undefined') {
    window.testAPI = testAPI;
}

export default testAPI;
