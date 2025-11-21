import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Leaf, Shield, ArrowLeft, ShoppingCart, Info, Award, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <Navbar_Buyer />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Back Button */}
        <button
          onClick={() => navigate('/marketplace')}
          className="group flex items-center text-gray-600 hover:text-green-600 mb-8 transition-all duration-200"
        >
          <div className="p-2 rounded-full bg-white shadow-md group-hover:shadow-lg group-hover:bg-green-50 transition-all duration-200">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="ml-3 font-medium">Back to Marketplace</span>
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Main Content - Left Side */}
          <div className="xl:col-span-3 space-y-8">
            {/* Hero Section with Location */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white">
                {/* Decorative background elements */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full"></div>
                </div>

                <div className="relative z-10">
                  <div className="flex flex-wrap items-start justify-between mb-6">
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                        listing.listingType === 'FIXED' 
                          ? 'bg-white/20 backdrop-blur' 
                          : 'bg-orange-500'
                      }`}>
                        <Zap className="w-4 h-4" />
                        {listing.listingType === 'FIXED' ? 'Fixed Price' : 'Auction'}
                      </span>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                        listing.status === 'ACTIVE' 
                          ? 'bg-green-400 text-green-900' 
                          : 'bg-gray-400 text-gray-900'
                      }`}>
                        <Shield className="w-4 h-4" />
                        {listing.status}
                      </span>
                    </div>

                    {/* Location Badge */}
                    {listing.sellerLocation && (
                      <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {listing.sellerLocation.split('-').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h1 className="text-4xl font-bold mb-2 leading-tight">
                      Premium Carbon Credits
                    </h1>
                    <p className="text-lg text-green-100 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      by {listing.credit?.owner?.username || 'Carbon Credit Provider'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-green-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Listed {new Date(listing.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Verified Credit
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Credit Details */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Leaf className="w-7 h-7 text-green-600" />
                Carbon Credit Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listing.credit?.creditAmount && (
                  <div className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100 hover:border-green-200 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Leaf className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">{listing.credit.creditAmount}</div>
                        <div className="text-sm text-gray-500 font-medium">tonnes CO₂e</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Total Credit Amount</p>
                  </div>
                )}
                
                {listing.credit?.co2ReducedKg && (
                  <div className="group p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-100 hover:border-blue-200 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Zap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">{listing.credit.co2ReducedKg}</div>
                        <div className="text-sm text-gray-500 font-medium">kg CO₂</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">CO₂ Emissions Reduced</p>
                  </div>
                )}
                
                {listing.credit?.journeyId && (
                  <div className="col-span-full p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <Info className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 font-medium mb-2">Journey Reference</p>
                        <p className="font-mono text-lg text-gray-900 bg-white px-4 py-2 rounded-lg border">
                          {listing.credit.journeyId}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          This credit is generated from a verified journey with complete tracking data.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {listing.credit?.status && (
                  <div className="col-span-full p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 rounded-xl">
                        <Shield className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Verification Status</p>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          listing.credit.status === 'VERIFIED' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {listing.credit.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Seller Information */}
            {listing.credit?.owner && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Users className="w-7 h-7 text-blue-600" />
                  Seller Information
                </h2>

                <div className="flex items-center space-x-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-100">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-500 to-green-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {listing.credit.owner.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-900 mb-1">{listing.credit.owner.username}</p>
                    <p className="text-lg text-gray-600 mb-2">{listing.credit.owner.role}</p>
                    {listing.sellerLocation && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">
                          {listing.sellerLocation.split('-').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}, Vietnam
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold">
                      Verified Seller
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Sidebar - Right Side */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <ShoppingCart className="w-7 h-7 text-green-600" />
                  Purchase Details
                </h2>
                <p className="text-gray-600">Secure and verified transaction</p>
              </div>

              {/* Enhanced Price Section */}
              <div className="mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                  <p className="text-sm text-gray-600 font-medium mb-2">Price per Tonne</p>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-green-600">
                      ${formatPrice((listing.price || 0) / (listing.credit?.creditAmount || 1))}
                    </span>
                    <span className="text-lg text-gray-500 ml-2">USD</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-semibold text-gray-900">
                      {listing.credit?.creditAmount || 0} tonnes
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Amount Selection Preview */}
              <div className="mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Your Selection</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Amount:</span>
                      <span className="font-bold text-blue-600 text-lg">{purchaseAmount} tonnes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Rate:</span>
                      <span className="font-semibold text-gray-900">
                        ${formatPrice((listing.price || 0) / (listing.credit?.creditAmount || 1))}/tonne
                      </span>
                    </div>
                    <div className="border-t border-blue-200 my-3"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-lg">Total Cost:</span>
                      <span className="font-bold text-blue-600 text-2xl">
                        ${formatPrice(((listing.price || 0) / (listing.credit?.creditAmount || 1)) * purchaseAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              {listing.sellerLocation && (
                <div className="mb-8">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      Origin Location
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <MapPin className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {listing.sellerLocation.split('-').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </p>
                        <p className="text-sm text-gray-600">Vietnam</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Credits generated from verified journeys in this region
                    </p>
                  </div>
                </div>
              )}

              {/* Enhanced Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handlePurchase}
                  disabled={listing.status !== 'ACTIVE'}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-bold text-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {listing.status === 'ACTIVE' ? 'Select Amount & Purchase' : 'Not Available'}
                </button>
                
                <button
                  onClick={() => navigate('/marketplace')}
                  className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 py-3 px-6 rounded-2xl font-semibold transition-all duration-200 hover:shadow-md"
                >
                  Browse More Credits
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="p-2 bg-green-100 rounded-lg mb-2">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Verified</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mb-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Instant</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mb-2">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Certified</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-4">
                  All transactions are secure and blockchain-verified
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Amount Selection Modal */}
      {showAmountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 transform animate-in fade-in duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Purchase Amount</h3>
              <p className="text-gray-600">Choose how many tonnes of carbon credits you want to purchase</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
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
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl text-xl font-semibold text-center focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="1"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  tonnes
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Available: <span className="font-semibold">{listing.credit?.creditAmount || 0} tonnes</span>
              </p>
            </div>

            {/* Quick Selection Buttons */}
            <div className="mb-6">
              <p className="text-sm font-bold text-gray-700 mb-3">Quick Select:</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPurchaseAmount(1)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  1 tonne
                </button>
                <button
                  onClick={() => setPurchaseAmount(Math.max(1, Math.floor((listing.credit?.creditAmount || 1) / 2)))}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  Half ({Math.max(1, Math.floor((listing.credit?.creditAmount || 1) / 2))})
                </button>
                <button
                  onClick={() => setPurchaseAmount(listing.credit?.creditAmount || 1)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  All ({listing.credit?.creditAmount || 0})
                </button>
              </div>
            </div>

            {/* Price Calculation in Modal */}
            <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-green-600" />
                Purchase Summary
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Amount:</span>
                  <span className="font-bold text-green-600">{purchaseAmount} tonnes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Rate:</span>
                  <span className="font-semibold text-gray-900">${formatPrice((listing.price || 0) / (listing.credit?.creditAmount || 1))}/tonne</span>
                </div>
                {listing.sellerLocation && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Location:</span>
                    <span className="font-medium text-gray-900">
                      {listing.sellerLocation.split('-').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </div>
                )}
                <div className="border-t border-green-200 my-3"></div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900 text-lg">Total Cost:</span>
                  <span className="font-bold text-green-600 text-2xl">
                    ${formatPrice(((listing.price || 0) / (listing.credit?.creditAmount || 1)) * purchaseAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowAmountModal(false);
                  setPurchaseAmount(1);
                }}
                className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
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