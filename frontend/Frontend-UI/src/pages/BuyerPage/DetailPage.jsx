import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer';
import { buyerApi } from '../../api';

const Detailpage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  
  // Helper function to format price (hide .00 for whole numbers)
  const formatPrice = (price) => {
    return price % 1 === 0 ? price.toFixed(0) : price.toFixed(2);
  };
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseAmount, setPurchaseAmount] = useState(1); // Amount buyer wants to buy
  const [showAmountModal, setShowAmountModal] = useState(false);

  const fetchListingDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Searching for listing ID:', listingId);
      
      // Try to fetch multiple pages to find the listing
      let foundListing = null;
      let page = 0;
      const maxPages = 10; // Search up to 10 pages
      
      while (!foundListing && page < maxPages) {
        const response = await buyerApi.getMarketplaceListings(page, 20, 'newest');
        console.log(`📄 Fetched page ${page}, found ${response.content.length} listings`);
        
        foundListing = response.content.find(l => l.id === listingId);
        
        if (foundListing) {
          setListing(foundListing);
          // Initialize purchase amount to 1 or minimum available
          setPurchaseAmount(Math.min(1, foundListing.credit?.creditAmount || 1));
          console.log('✅ Listing found on page', page, ':', foundListing);
          return;
        }
        
        // If we've reached the last page, stop
        if (page >= response.totalPages - 1) {
          break;
        }
        
        page++;
      }
      
      // If not found after searching
      setError('Listing not found');
      console.error('❌ Listing not found with ID:', listingId);
      
    } catch (err) {
      console.error('❌ Error fetching listing details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListingDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  const handlePurchase = () => {
    setShowAmountModal(true);
  };

  const handleConfirmPurchase = () => {
    const creditAmount = listing.credit?.creditAmount || 0;
    const pricePerTonne = listing.price / creditAmount; // Calculate price per tonne
    const totalPrice = pricePerTonne * purchaseAmount;

    // Navigate to payment page with buyer's selected amount
    navigate('/payment', {
      state: {
        listing,
        quantity: purchaseAmount, // Use buyer's selected amount
        totalPrice: totalPrice
      }
    });

    setShowAmountModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar_Buyer />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-green-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar_Buyer />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-700">{error || 'Listing not found'}</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar_Buyer />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition cursor-pointer"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    listing.listingType === 'FIXED' 
                      ? 'bg-white/20 backdrop-blur' 
                      : 'bg-orange-500'
                  }`}>
                    {listing.listingType === 'FIXED' ? '💵 Fixed Price' : '🎯 Auction'}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    listing.status === 'ACTIVE' 
                      ? 'bg-green-500' 
                      : 'bg-gray-500'
                  }`}>
                    {listing.status}
                  </span>
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  {listing.credit?.owner?.username || 'Carbon Credit'}
                </h1>
                <p className="text-green-100 text-sm">
                  Listed on {new Date(listing.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Credit Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Carbon Credit Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {listing.credit?.creditAmount && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Credit Amount</p>
                    <p className="text-2xl font-bold text-gray-900">{listing.credit.creditAmount}</p>
                    <p className="text-xs text-gray-500 mt-1">tonnes CO₂e</p>
                  </div>
                )}
                
                {listing.credit?.co2ReducedKg && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">CO₂ Reduced</p>
                    <p className="text-2xl font-bold text-gray-900">{listing.credit.co2ReducedKg}</p>
                    <p className="text-xs text-gray-500 mt-1">kilograms</p>
                  </div>
                )}
                
                {listing.credit?.journeyId && (
                  <div className="col-span-2 p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Journey ID</p>
                    <p className="text-sm font-mono text-gray-900">{listing.credit.journeyId}</p>
                  </div>
                )}

                {listing.credit?.status && (
                  <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Credit Status</p>
                    <p className="text-sm font-semibold text-gray-900">{listing.credit.status}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Information */}
            {listing.credit?.owner && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Seller Information</h2>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {listing.credit.owner.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{listing.credit.owner.username}</p>
                    <p className="text-sm text-gray-500">{listing.credit.owner.role}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase Details</h2>
              
              {/* Price */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Price per Tonne</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-green-600">
                    ${formatPrice((listing.price || 0) / (listing.credit?.creditAmount || 1))}
                  </span>
                  <span className="text-lg text-gray-500 ml-2">USD</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Total available: {listing.credit?.creditAmount || 0} tonnes
                </p>
              </div>

              {/* Amount Selection Preview */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Selected Amount:</span>
                  <span className="font-bold text-blue-600">{purchaseAmount} tonnes</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Price per tonne:</span>
                  <span className="font-semibold">${formatPrice((listing.price || 0) / (listing.credit?.creditAmount || 1))}</span>
                </div>
                <div className="border-t border-blue-300 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">You will pay:</span>
                  <span className="font-bold text-blue-600 text-2xl">
                    ${formatPrice(((listing.price || 0) / (listing.credit?.creditAmount || 1)) * purchaseAmount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handlePurchase}
                  disabled={listing.status !== 'ACTIVE'}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-green-700 disabled:bg-gray-300 cursor-pointer transition-all shadow-lg hover:shadow-xl"
                >
                  {listing.status === 'ACTIVE' ? '📋 Select Amount & Purchase' : 'Not Available'}
                </button>
                
                <button
                  onClick={() => navigate('/marketplace')}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Back to Marketplace
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  All transactions are secure and verified
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amount Selection Modal */}
      {showAmountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Select Purchase Amount</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (tonnes CO₂)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={listing.credit?.creditAmount || 1}
                  step="1"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(Math.max(1, Math.min(parseInt(e.target.value) || 1, listing.credit?.creditAmount || 1)))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  tonnes
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available: {listing.credit?.creditAmount || 0} tonnes
              </p>
            </div>

            {/* Price Calculation in Modal */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium">Amount:</span>
                <span className="font-bold text-green-600">{purchaseAmount} tonnes</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium">Price per tonne:</span>
                <span className="font-semibold">${formatPrice((listing.price || 0) / (listing.credit?.creditAmount || 1))}</span>
              </div>
              <div className="border-t border-green-300 my-2"></div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">Total Cost:</span>
                <span className="font-bold text-green-600 text-xl">
                  ${formatPrice(((listing.price || 0) / (listing.credit?.creditAmount || 1)) * purchaseAmount)}
                </span>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Select:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPurchaseAmount(1)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  1 tonne
                </button>
                <button
                  onClick={() => setPurchaseAmount(Math.floor((listing.credit?.creditAmount || 1) / 2))}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  Half
                </button>
                <button
                  onClick={() => setPurchaseAmount(listing.credit?.creditAmount || 1)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  All ({listing.credit?.creditAmount || 0})
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAmountModal(false);
                  setPurchaseAmount(1);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detailpage;