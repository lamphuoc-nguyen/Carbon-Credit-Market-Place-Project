/**
 * Debugging utilities for testing API connections and authentication
 *
 * Usage in browser console:
 * - window.debugAuth() - Check authentication status
 * - window.testWalletAPI() - Test wallet API endpoint
 * - window.testMarketplaceAPI() - Test marketplace API endpoint
 */

import { buyerApi } from '../api';
import { getValidToken, decodeJWTPayload, isTokenExpired } from './tokenUtils';

// Authentication debugging
export const debugAuth = () => {
  console.log('=== AUTHENTICATION DEBUG ===');

  const token = getValidToken();
  const userLocal = localStorage.getItem('user');
  const userSession = sessionStorage.getItem('user');

  console.log('🔍 Token Info:', {
    hasValidToken: !!token,
    tokenLength: token?.length || 0,
    tokenPrefix: token?.substring(0, 30) + '...' || 'none'
  });

  if (token) {
    try {
      const payload = decodeJWTPayload(token);
      const expired = isTokenExpired(token);

      console.log('🔍 Token Payload:', {
        username: payload?.sub,
        roles: payload?.roles || payload?.authorities,
        isExpired: expired,
        expiresAt: payload?.exp ? new Date(payload.exp * 1000).toISOString() : 'unknown',
        currentTime: new Date().toISOString(),
        validForMs: payload?.exp ? (payload.exp * 1000 - Date.now()) : 'unknown'
      });
    } catch (error) {
      console.error('❌ Token decode error:', error);
    }
  }

  console.log('🔍 User Info:', {
    localStorage: userLocal ? JSON.parse(userLocal) : null,
    sessionStorage: userSession ? JSON.parse(userSession) : null
  });

  console.log('🔍 API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:8080');
  console.log('================================');
};

// Test wallet API
export const testWalletAPI = async () => {
  console.log('=== TESTING WALLET API ===');

  try {
    console.log('🔄 Testing /api/wallets/my-wallet...');
    const walletData = await buyerApi.getMyWallet();
    console.log('✅ Wallet API Success:', walletData);
    return walletData;
  } catch (error) {
    console.error('❌ Wallet API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      headers: error.config?.headers
    });
    return null;
  }
};

// Test marketplace API
export const testMarketplaceAPI = async () => {
  console.log('=== TESTING MARKETPLACE API ===');

  try {
    console.log('🔄 Testing /credit-listings...');
    const marketplaceData = await buyerApi.getMarketplaceListings(0, 5);
    console.log('✅ Marketplace API Success:', marketplaceData);
    return marketplaceData;
  } catch (error) {
    console.error('❌ Marketplace API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      headers: error.config?.headers
    });
    return null;
  }
};

// Test backend connectivity
export const testBackendConnectivity = async () => {
  console.log('=== TESTING BACKEND CONNECTIVITY ===');

  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  try {
    console.log('🔄 Testing backend health...');

    // Test if backend is responding
    const response = await fetch(`${baseURL}/actuator/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend Health Check:', data);
      return { status: 'UP', data };
    } else {
      console.log('⚠️ Backend Health Check Failed:', response.status, response.statusText);
      return { status: 'DOWN', error: response.statusText };
    }
  } catch (error) {
    console.error('❌ Backend Connectivity Error:', {
      message: error.message,
      name: error.name
    });
    return { status: 'ERROR', error: error.message };
  }
};

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
  window.testWalletAPI = testWalletAPI;
  window.testMarketplaceAPI = testMarketplaceAPI;
  window.testBackendConnectivity = testBackendConnectivity;

  console.log('🛠️ Debug utilities loaded. Available functions:');
  console.log('- window.debugAuth() - Check authentication');
  console.log('- window.testWalletAPI() - Test wallet API');
  console.log('- window.testMarketplaceAPI() - Test marketplace API');
  console.log('- window.testBackendConnectivity() - Test backend health');
}
