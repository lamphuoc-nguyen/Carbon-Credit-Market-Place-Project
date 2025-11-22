import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, AlertCircle, CheckCircle } from 'lucide-react';
import EvOwnerAPI from '../../api/EvOwnerAPI';
import Navbar from '../../Components/EVComponents/Navbar';
import Footer from '../../Components/Footer';
import { getValidToken } from '../../utils/tokenUtils';
import { VIETNAM_PROVINCES } from '../../utils/vietnamProvinces';


const CreateListingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [walletData, setWalletData] = useState({
    creditBalance: 0
  });
  const [carbonCredits, setCarbonCredits] = useState([]);
  const [selectedCredits, setSelectedCredits] = useState([]); // Array of selected credit IDs
  const [pricePerCredit, setPricePerCredit] = useState('');
  const [sellerLocation, setSellerLocation] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  

  useEffect(() => {
    fetchWalletData();
    fetchCarbonCredits();
  }, []);

  useEffect(() => {
    // Calculate total price when selected credits or price per credit changes
    const totalCredits = selectedCredits.reduce((sum, creditId) => {
      const credit = carbonCredits.find(c => (c.id || c.creditId) === creditId);
      return sum + (credit?.creditAmount || credit?.credit_amount || 0);
    }, 0);
    const price = parseFloat(pricePerCredit) || 0;
    setTotalPrice(totalCredits * price);
  }, [selectedCredits, pricePerCredit, carbonCredits]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        console.warn('⚠️ No token found, redirecting to login');
        navigate('/login');
        return;
      }
      
      console.log('💰 Fetching wallet data...');
      console.log('🔍 API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:8080');
      console.log('🔍 Current token exists:', !!token);

      const response = await EvOwnerAPI.wallets.getMyWallet();
      const wallet = response.data?.data || response.data || {};
      
      console.log('✅ Wallet data fetched successfully:', wallet);

      setWalletData({
        creditBalance: wallet.creditBalance || wallet.credit_balance || 0
      });
    } catch (error) {
      console.error('❌ Failed to fetch wallet:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        code: error.code
      });

      let errorMessage = 'Failed to load wallet data. Please try again.';

      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('🔐 Authentication failed, redirecting to login');
        errorMessage = 'Authentication failed. Please login again.';
        navigate('/login');
      } else if (error.response?.status === 404) {
        errorMessage = 'Wallet not found. Please contact support.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
        console.error('Network Error Details:', {
          message: error.message,
          code: error.code,
          errno: error.errno,
          syscall: error.syscall,
          address: error.address,
          port: error.port
        });
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Backend server is not responding. Please ensure the Spring Boot application is running on port 8080.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection and backend server status.';
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarbonCredits = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        console.warn('⚠️ No token found in storage');
        return;
      }
      
      console.log('🌱 Fetching carbon credits...');
      console.log('🔍 Token found, fetching user profile...');
      
      const profileResponse = await EvOwnerAPI.user.getProfile();
      
      // Handle different response structures
      const userData = profileResponse.data?.data || profileResponse.data || profileResponse;
      console.log('✅ User profile fetched:', userData);
      
      let userId = userData.id || userData.userId || '';
      console.log('👤 User ID (original):', userId);
      
      if (!userId) {
        console.error('❌ No userId found in profile');
        return;
      }
      
      // Convert to UPPERCASE for API endpoint
      userId = userId.toUpperCase();
      console.log('👤 User ID (UPPERCASE):', userId);
      
      // Use the authenticated endpoint with userId
      const response = await EvOwnerAPI.carbonCredits.getMyCreditsByUserId(userId);
      console.log('📦 Raw API response:', response);
      console.log('📦 Response.data:', response.data);
      
      // Try different possible data structures
      let credits = response.data?.data || response.data?.content || response.data || [];
      
      // If response.data is an array, use it directly
      if (Array.isArray(response.data)) {
        credits = response.data;
      }
      
      console.log('✅ User credits:', credits);
      console.log('📊 Total credits:', credits.length);
      
      if (credits.length > 0) {
        console.log('🔍 First credit sample:', credits[0]);
      }
      
      // Filter for verified and available credits only
      const availableCredits = Array.isArray(credits) 
        ? credits.filter(credit => {
            const isVerified = credit.status === 'VERIFIED' || credit.verificationStatus === 'VERIFIED';
            const notListed = !credit.isListed && !credit.is_listed;
            
            console.log('Filtering credit:', {
              id: credit.id || credit.creditId,
              isVerified: isVerified,
              notListed: notListed,
              willInclude: isVerified && notListed
            });
            
            return isVerified && notListed;
          })
        : [];
      
      console.log('✅ Filtered available credits:', availableCredits);
      console.log('✅ Available credits to list:', availableCredits.length);
      
      setCarbonCredits(availableCredits);
      
      // Initialize with no credits selected
      setSelectedCredits([]);
    } catch (error) {
      console.error('❌ Failed to fetch carbon credits:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('🔐 Authentication failed, redirecting to login');
        navigate('/login');
      } else {
        console.error('⚠️ API error, but not redirecting:', error);
      }
      
      setCarbonCredits([]);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();

    // Validation
    if (!pricePerCredit || parseFloat(pricePerCredit) <= 0) {
      alert('Please enter a valid price per credit');
      return;
    }

    if (selectedCredits.length === 0) {
      alert('Please select at least one carbon credit to list');
      return;
    }

    try {
      setSubmitting(true);
      console.log('📝 Creating combined listing for selected credits...');

      const priceValue = parseFloat(pricePerCredit);

      // Calculate total credits from all selected credits
      const totalCreditsToSell = selectedCredits.reduce((sum, creditId) => {
        const credit = carbonCredits.find(c => (c.id || c.creditId) === creditId);
        return sum + (credit?.creditAmount || credit?.credit_amount || 0);
      }, 0);

      console.log(`Creating combined listing: ${totalCreditsToSell} total credits at $${priceValue} per credit`);
      console.log('Selected credit IDs:', selectedCredits);

      // Use the new combined listing API
      const response = await EvOwnerAPI.marketplace.createCombinedListing(
        selectedCredits,
        priceValue,
        sellerLocation || undefined  // Pass location if provided
      );

      console.log('✅ Combined listing created successfully:', response.data);

      alert(`✅ Successfully created combined listing!\n${totalCreditsToSell} credits at $${priceValue} per credit\nTotal value: $${(totalCreditsToSell * priceValue).toFixed(2)}`);

      // Reset form
      setSelectedCredits([]);
      setPricePerCredit('');
      setSellerLocation('');
      setTotalPrice(0);

      // Refresh data
      await fetchWalletData();
      await fetchCarbonCredits();
      
      // Navigate to EV dashboard marketplace instead of buyer marketplace
      navigate('/ev-dashboard', {
        state: {
          message: `Successfully created combined listing with ${totalCreditsToSell} credits!`,
          newListing: true,
          tab: 'marketplace' // Hint to show marketplace tab
        }
      });

    } catch (error) {
      console.error('❌ Failed to create combined listing:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(`Failed to create combined listing: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <><Navbar />
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Listing</h1>
          <p className="text-gray-600 mt-1">List your carbon credits for sale</p>
        </div>

        {/* Available Credits Banner */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Available to Sell</p>
              <h2 className="text-3xl font-bold text-green-600">{walletData.creditBalance.toFixed(2)}</h2>
              <p className="text-sm text-gray-600 mt-0.5">carbon credits</p>
            </div>
            <div className="text-green-600">
              <Leaf size={32} />
            </div>
          </div>
        </div>

        {/* Warning if no credits */}
        {walletData.creditBalance === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-yellow-900 font-semibold text-sm">No Credits Available</h3>
                <p className="text-yellow-800 text-sm mt-1">
                  Complete EV journeys and get them verified to earn carbon credits.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Create Listing Form */}
        <form onSubmit={handleCreateListing} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Listing Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select credits to bundle together. All selected credits will be sold as one listing.
            </p>
          </div>

          {/* Select Carbon Credits */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Select Credits <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCredits(carbonCredits.map(c => c.id || c.creditId))}
                  className="px-3 py-1.5 text-xs text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={carbonCredits.length === 0}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCredits([])}
                  className="px-3 py-1.5 text-xs text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {carbonCredits.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Leaf className="mx-auto text-gray-400 mb-2" size={40} />
                <p className="text-gray-600 text-sm">No credits available</p>
                <p className="text-xs text-gray-500 mt-1">Verified credits will appear here</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {carbonCredits.map((credit) => {
                  const creditId = credit.id || credit.creditId;
                  const journeyId = credit.journeyId || credit.journey_id || 'N/A';
                  const creditAmount = credit.creditAmount || credit.credit_amount || 0;
                  const co2Reduced = credit.co2ReducedKg || credit.co2_reduced_kg || 0;
                  const isSelected = selectedCredits.includes(creditId);

                  return (
                    <div
                      key={creditId}
                      className={`p-3 rounded border cursor-pointer transition ${
                        isSelected 
                          ? 'border-green-600 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCredits(prev => prev.filter(id => id !== creditId));
                        } else {
                          setSelectedCredits(prev => [...prev, creditId]);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by div onClick
                            className="w-4 h-4 text-green-600 rounded"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              #{creditId.substring(0, 8)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {journeyId.toString().substring(0, 8)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{creditAmount}</p>
                          <p className="text-xs text-gray-600">{co2Reduced}kg</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              {selectedCredits.length} of {carbonCredits.length} credits selected •
              Total: {selectedCredits.reduce((sum, creditId) => {
                const credit = carbonCredits.find(c => (c.id || c.creditId) === creditId);
                return sum + (credit?.creditAmount || credit?.credit_amount || 0);
              }, 0)} credits
            </p>
          </div>

          {/* Price per Credit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Credit <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={pricePerCredit}
                onChange={(e) => setPricePerCredit(e.target.value)}
                placeholder="10.00"
                required
                className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Typical range: $8 - $15 per credit
            </p>
          </div>

          {/* Seller Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location (Optional)
            </label>
            <select
              value={sellerLocation}
              onChange={(e) => setSellerLocation(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm"
            >
              {VIETNAM_PROVINCES.map((province) => (
                <option key={province.value} value={province.value}>
                  {province.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1.5">
              Help buyers find local credits
            </p>
          </div>

          {/* Total Price Display */}
          {totalPrice > 0 && selectedCredits.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">${totalPrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCredits.reduce((sum, creditId) => {
                      const credit = carbonCredits.find(c => (c.id || c.creditId) === creditId);
                      return sum + (credit?.creditAmount || credit?.credit_amount || 0);
                    }, 0)} credits × ${pricePerCredit || '0'}
                  </p>
                </div>
                <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              </div>
            </div>
          )}

          {/* Listing Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Summary</h3>

            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Credits selected</span>
                <span className="font-medium text-gray-900">
                  {selectedCredits.length > 0 ? selectedCredits.reduce((sum, creditId) => {
                    const credit = carbonCredits.find(c => (c.id || c.creditId) === creditId);
                    return sum + (credit?.creditAmount || credit?.credit_amount || 0);
                  }, 0) : 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">CO₂ impact</span>
                <span className="font-medium text-gray-900">
                  {selectedCredits.length > 0 ? selectedCredits.reduce((sum, creditId) => {
                    const credit = carbonCredits.find(c => (c.id || c.creditId) === creditId);
                    return sum + (credit?.co2ReducedKg || credit?.co2_reduced_kg || 0);
                  }, 0).toLocaleString() : 0} kg
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Price per credit</span>
                <span className="font-medium text-gray-900">${pricePerCredit || '0.00'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || carbonCredits.length === 0 || selectedCredits.length === 0}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Creating...
              </span>
            ) : (
              'Create Listing'
            )}
          </button>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5">
            <p className="text-sm font-medium text-blue-900 mb-2">Important</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Credits are locked once listed</li>
              <li>• Price can be updated anytime</li>
              <li>• Cancel listing to unlock credits</li>
              <li>• Funds transfer after sale</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default CreateListingPage;
