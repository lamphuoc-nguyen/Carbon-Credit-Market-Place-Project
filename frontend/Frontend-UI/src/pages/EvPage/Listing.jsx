import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Leaf, DollarSign, TrendingUp, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import EvOwnerAPI from '../../api/EvOwnerAPI';
import Navbar from '../../Components/EVComponents/Navbar';


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
        priceValue
      );

      console.log('✅ Combined listing created successfully:', response.data);

      alert(`✅ Successfully created combined listing!\n${totalCreditsToSell} credits at $${priceValue} per credit\nTotal value: $${(totalCreditsToSell * priceValue).toFixed(2)}`);

      // Reset form
      setSelectedCredits([]);
      setPricePerCredit('');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Store className="text-green-600" size={36} />
            Create Listing
          </h1>
          <p className="text-gray-600 mt-2">List your carbon credits for sale on the marketplace</p>
        </div>

        {/* Available Credits Banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Available Carbon Credits</p>
              <h2 className="text-4xl font-bold">{walletData.creditBalance.toFixed(2)}</h2>
              <p className="text-green-100 text-sm mt-1">Credits ready to sell</p>
            </div>
            <div className="p-4 bg-white bg-opacity-20 rounded-full">
              <Leaf size={40} />
            </div>
          </div>
        </div>

        {/* Warning if no credits */}
        {walletData.creditBalance === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle className="text-yellow-400 mt-0.5 mr-3" size={20} />
              <div>
                <h3 className="text-yellow-800 font-semibold">No Carbon Credits Available</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  You need to have verified carbon credits in your wallet before creating a listing. 
                  Complete EV journeys and get them verified by CVA to earn carbon credits.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning if credits exist but none are listable */}
       

        {/* Create Listing Form */}
        <form onSubmit={handleCreateListing} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Create Combined Listing</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select credits to combine into one marketplace lot. All selected credits will be sold together as a single listing.
            </p>
          </div>

          {/* Select Carbon Credits */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Select Credits for Combined Lot <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedCredits(carbonCredits.map(c => c.id || c.creditId))}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  disabled={carbonCredits.length === 0}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCredits([])}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Clear All
                </button>
              </div>
            </div>

            {carbonCredits.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Leaf className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600 font-medium">No credits available for listing</p>
                <p className="text-sm text-gray-500 mt-1">You need verified carbon credits to create a listing</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {carbonCredits.map((credit) => {
                  const creditId = credit.id || credit.creditId;
                  const journeyId = credit.journeyId || credit.journey_id || 'N/A';
                  const creditAmount = credit.creditAmount || credit.credit_amount || 0;
                  const co2Reduced = credit.co2ReducedKg || credit.co2_reduced_kg || 0;
                  const isSelected = selectedCredits.includes(creditId);

                  return (
                    <div
                      key={creditId}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
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
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by div onClick
                            className="w-4 h-4 text-green-600"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              Credit #{creditId.substring(0, 8)}...
                            </p>
                            <p className="text-sm text-gray-500">
                              Journey: {journeyId.toString().substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{creditAmount} credits</p>
                          <p className="text-sm text-green-600">{co2Reduced}kg CO₂</p>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price per Credit (USD) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={pricePerCredit}
                onChange={(e) => setPricePerCredit(e.target.value)}
                placeholder="e.g., 10.00"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Suggested price: $8.00 - $15.00 per credit
            </p>
          </div>

          {/* Total Price Display */}
          {totalPrice > 0 && selectedCredits.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Combined Lot Value</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
                    <span className="text-sm text-gray-500">
                      for {selectedCredits.reduce((sum, creditId) => {
                        const credit = carbonCredits.find(c => (c.id || c.creditId) === creditId);
                        return sum + (credit?.creditAmount || credit?.credit_amount || 0);
                      }, 0)} credits (1 listing)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <TrendingUp size={16} className="text-green-600" />
                    <span>Price per credit: ${pricePerCredit || '0.00'}</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
              </div>
            </div>
          )}

          {/* Listing Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Listing Preview</h3>

            {selectedCredits.length > 0 ? (
              <div className="space-y-3">
                <div className="pb-3 border-b border-gray-300">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Credits ({selectedCredits.length}):</p>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {selectedCredits.map(creditId => {
                      const credit = carbonCredits.find(c => (c.id || c.creditId) === creditId);
                      if (!credit) return null;

                      return (
                        <div key={creditId} className="flex justify-between text-xs bg-white rounded p-2">
                          <span className="text-gray-600">#{creditId.substring(0, 12)}...</span>
                          <span className="font-medium text-gray-900">
                            {credit.creditAmount || credit.credit_amount || 0} credits
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total credits to sell:</span>
                  <span className="font-medium text-gray-900">
                    {selectedCredits.reduce((sum, creditId) => {
                      const credit = carbonCredits.find(c => (c.id || c.creditId) === creditId);
                      return sum + (credit?.creditAmount || credit?.credit_amount || 0);
                    }, 0)} credits
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total CO₂ impact:</span>
                  <span className="font-medium text-green-600">
                    {selectedCredits.reduce((sum, creditId) => {
                      const credit = carbonCredits.find(c => (c.id || c.creditId) === creditId);
                      return sum + (credit?.co2ReducedKg || credit?.co2_reduced_kg || 0);
                    }, 0).toLocaleString()} kg
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No credits selected</p>
            )}

            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-600">Price per credit:</span>
              <span className="font-medium text-gray-900">${pricePerCredit || '0.00'}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
              <span className="text-gray-900 font-semibold">Total price:</span>
              <span className="font-bold text-green-600">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || carbonCredits.length === 0 || selectedCredits.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold text-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Creating Listing...
              </>
            ) : (
              <>
                Create Listing
                <ArrowRight size={20} />
              </>
            )}
          </button>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Important Information:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Once listed, credits will be locked until sold or cancelled</li>
                  <li>You can update the price or cancel the listing anytime</li>
                  <li>Buyers will pay the total price you set</li>
                  <li>Funds will be transferred to your wallet after successful sale</li>
                </ul>
              </div>
            </div>
          </div>
        </form>

        {/* Example Card */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            How Combined Listing Works
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
            <p className="mb-2">
              <strong>Combined Lot System:</strong> All selected credits are combined into 1 marketplace listing.
            </p>
            <p className="mb-2">
              <strong>Example scenario:</strong> You have 3 credits worth 10, 15, and 20 credits each.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Select all 3 credits using checkboxes or "Select All" button</li>
              <li>Set price per credit: <strong>$12.00</strong></li>
              <li>Total combined lot: <strong>(10 + 15 + 20) = 45 credits</strong></li>
              <li>Total value: <strong>45 × $12 = $540.00</strong></li>
              <li>Creates <strong>1 listing</strong> for 45 credits at $540</li>
            </ul>
            <p className="mt-3 text-green-600 font-medium">
              ✓ Buyers purchase the entire lot of 45 credits for $540!
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CreateListingPage;
