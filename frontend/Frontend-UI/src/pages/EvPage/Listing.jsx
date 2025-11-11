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
  const [selectedCreditId, setSelectedCreditId] = useState('');
  const [creditsToSell, setCreditsToSell] = useState('');
  const [pricePerCredit, setPricePerCredit] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  

  useEffect(() => {
    fetchWalletData();
    fetchCarbonCredits();
  }, []);

  useEffect(() => {
    // Calculate total price when credits or price per credit changes
    const credits = parseFloat(creditsToSell) || 0;
    const price = parseFloat(pricePerCredit) || 0;
    setTotalPrice(credits * price);
  }, [creditsToSell, pricePerCredit]);

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
      const response = await EvOwnerAPI.wallet.getMyWallet();
      const wallet = response.data?.data || response.data || {};
      
      console.log('✅ Wallet data fetched:', wallet);
      
      setWalletData({
        creditBalance: wallet.creditBalance || wallet.credit_balance || 0
      });
    } catch (error) {
      console.error('❌ Failed to fetch wallet:', error);
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
        alert('Failed to load wallet data. Please try again.');
      }
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
      
      // Auto-select first credit if available
      if (availableCredits.length > 0) {
        setSelectedCreditId(availableCredits[0].id || availableCredits[0].creditId);
      }
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
    if (!creditsToSell || parseFloat(creditsToSell) <= 0) {
      alert('Please enter a valid number of credits to sell');
      return;
    }

    if (!pricePerCredit || parseFloat(pricePerCredit) <= 0) {
      alert('Please enter a valid price per credit');
      return;
    }

    if (parseFloat(creditsToSell) > walletData.creditBalance) {
      alert(`Insufficient carbon credits. You only have ${walletData.creditBalance} credits available.`);
      return;
    }

    // Check if there are available credits to list
    if (carbonCredits.length === 0) {
      alert('No verified carbon credits available to list. Please complete and verify journeys first.');
      return;
    }

    // Check if a credit is selected
    if (!selectedCreditId) {
      alert('Please select a carbon credit to list.');
      return;
    }

    try {
      setSubmitting(true);
      console.log('📝 Creating listing...');
      
      // Calculate total price
      const total = parseFloat(creditsToSell) * parseFloat(pricePerCredit);
      
      console.log('Using selected credit ID:', selectedCreditId);
      
      const response = await EvOwnerAPI.marketplace.createListing(
        selectedCreditId,
        total.toFixed(2)
      );
      
      console.log('✅ Listing created successfully:', response.data);
      
      alert(`✅ Listing created successfully!\n${creditsToSell} credits listed for ${total.toFixed(2)}`);
      
      // Reset form
      setCreditsToSell('');
      setPricePerCredit('');
      setTotalPrice(0);
      setSelectedCreditId('');
      
      // Refresh data
      await fetchWalletData();
      await fetchCarbonCredits();
      
    } catch (error) {
      console.error('❌ Failed to create listing:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(`Failed to create listing: ${error.response?.data?.message || error.message}`);
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">Listing Details</h2>

          {/* Select Carbon Credit */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Carbon Credit <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCreditId}
              onChange={(e) => setSelectedCreditId(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">-- Choose a verified credit --</option>
              {carbonCredits.map((credit) => {
                const creditId = credit.id || credit.creditId;
                const journeyId = credit.journeyId || credit.journey_id || 'N/A';
                const creditAmount = credit.creditAmount || credit.credit_amount || 0;
                const co2Reduced = credit.co2ReducedKg || credit.co2_reduced_kg || 0;
                
                return (
                  <option key={creditId} value={creditId}>
                    Credit #{creditId.substring(0, 8)}... | Journey: {journeyId.toString().substring(0, 8)}... | {creditAmount} credits | {co2Reduced}kg CO₂
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {carbonCredits.length} verified credit{carbonCredits.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {/* Credits to Sell */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Credits to Sell <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Leaf className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                min="0.01"
                step="0.01"
                max={walletData.creditBalance}
                value={creditsToSell}
                onChange={(e) => setCreditsToSell(e.target.value)}
                placeholder="e.g., 25"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Available: {walletData.creditBalance.toFixed(2)} credits
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
          {totalPrice > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Listing Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
                    <span className="text-sm text-gray-500">
                      for {creditsToSell} credits
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 mb-3">Listing Preview</h3>
            {selectedCreditId && (
              <div className="mb-3 pb-3 border-b border-gray-300">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Selected Credit ID:</span>
                  <span className="font-medium text-gray-900 font-mono text-xs">
                    {selectedCreditId.substring(0, 16)}...
                  </span>
                </div>
                {carbonCredits.find(c => (c.id || c.creditId) === selectedCreditId) && (
                  <>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600">CO₂ Reduced:</span>
                      <span className="font-medium text-green-600">
                        {carbonCredits.find(c => (c.id || c.creditId) === selectedCreditId).co2ReducedKg || 
                         carbonCredits.find(c => (c.id || c.creditId) === selectedCreditId).co2_reduced_kg || 0} kg
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600">Credit Amount:</span>
                      <span className="font-medium text-gray-900">
                        {carbonCredits.find(c => (c.id || c.creditId) === selectedCreditId).creditAmount || 
                         carbonCredits.find(c => (c.id || c.creditId) === selectedCreditId).credit_amount || 0} credits
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Credits to sell:</span>
              <span className="font-medium text-gray-900">{creditsToSell || '0'} credits</span>
            </div>
            <div className="flex justify-between text-sm">
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
            disabled={submitting || walletData.creditBalance === 0 || !selectedCreditId}
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
            Example Listing
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
            <p className="mb-2">
              <strong>Scenario:</strong> You have 25 carbon credits and want to sell them for $250 total.
            </p>
            <p className="mb-2">
              <strong>How to list:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Credits to sell: <strong>25</strong></li>
              <li>Price per credit: <strong>$10.00</strong></li>
              <li>Total price: <strong>$250.00</strong></li>
            </ul>
            <p className="mt-3 text-green-600 font-medium">
              ✓ Buyers will pay $250 to purchase all 25 credits from you!
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CreateListingPage;
