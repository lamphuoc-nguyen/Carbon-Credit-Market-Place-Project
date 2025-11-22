import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Leaf, Shield, ArrowLeft, ShoppingCart, Info, Award, Zap } from 'lucide-react';
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer';
import Footer from '../../Components/Footer';
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center text-gray-600 hover:text-green-600 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Back to Marketplace</span>
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Main Content - Left Side */}
          <div className="xl:col-span-3 space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="bg-green-600 p-6 text-white">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      listing.status === 'ACTIVE' 
                        ? 'bg-green-500' 
                        : 'bg-gray-400'
                    }`}>
                      {listing.status}
                    </span>
                    {listing.sellerLocation && (
                      <span className="px-3 py-1 rounded text-xs font-semibold bg-blue-500 bg-opacity-20 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {listing.sellerLocation.split('-').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    <h1 className="text-2xl font-bold mb-2">
                      Carbon Credit Listing
                    </h1>
                    <p className="text-md  font-semibold  flex items-center gap-2">
                      <Users className="w-4 h-4  " />
                      Seller: {listing.credit?.owner?.username || 'Carbon Credit Provider'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-md ">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>

              {/* Credit Details */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-green-600" />
                      Credit Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {listing.credit?.creditAmount && (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                  <Leaf className="w-5 h-5 text-green-600"/>
                                  <div className="text-right">
                                      {/* ✅ SỬA: Hiển thị chính xác số lượng credit */}
                                      <div className="text-2xl font-bold text-green-600">
                                          {listing.credit.creditAmount}
                                      </div>
                                      <div className="text-xs text-gray-500">tonnes CO₂e</div>
                                  </div>
                              </div>
                              <p className="text-sm text-gray-600">Credit Amount</p>
                          </div>
                      )}

                      {listing.credit?.co2ReducedKg && (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                  <Zap className="w-5 h-5 text-blue-600"/>
                                  <div className="text-right">
                                      {/* ✅ SỬA: Nếu có co2ReducedKg thì hiển thị, nếu không thì tính creditAmount * 1000 */}
                                      <div className="text-2xl font-bold text-green-600">
                                          {((listing.credit?.creditAmount || 0) * 1000).toLocaleString()} kg
                                      </div>
                                      <div className="text-xs text-gray-500">kg CO₂</div>
                                  </div>
                              </div>
                              <p className="text-sm text-gray-600">Total CO₂ Offset</p>
                          </div>
                      )}

                      {listing.credit?.journeyId && (
                          <div className="col-span-full p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-start gap-3">
                                  <Info className="w-5 h-5 text-gray-600 mt-1" />
                                  <div className="flex-1">
                                      <p className="text-sm text-gray-600 font-medium mb-2">Journey ID</p>
                                      <p className="font-mono text-sm text-gray-900 bg-white px-3 py-2 rounded border border-gray-200">
                                          {listing.credit.journeyId}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      )}

                      {listing.credit?.status && (
                          <div className="col-span-full p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-3">
                                  <Shield className="w-5 h-5 text-gray-600" />
                                  <div>
                                      <p className="text-sm text-gray-600 mb-1">Status</p>
                                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                                          listing.credit.status === 'VERIFIED'
                                              ? 'bg-green-100 text-green-700'
                                              : 'bg-yellow-100 text-yellow-700'
                                      }`}>
                          {listing.credit.status}
                        </span>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              </div>

            {/* Seller Information */}
            {listing.credit?.owner && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  Seller
                </h2>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                    {listing.credit.owner.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-900">{listing.credit.owner.username}</p>
                    <p className="text-sm text-gray-600">{listing.credit.owner.role}</p>
                    {listing.sellerLocation && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {listing.sellerLocation.split('-').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}, Vietnam
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                    Verified
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 sticky top-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Purchase</h2>
                <p className="text-sm text-gray-600">Secure transaction</p>
              </div>

              {/* Price Section */}
              <div className="mb-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Price per Tonne</p>
                  <div className="flex items-baseline mb-3">
                    <span className="text-3xl font-bold text-green-600">
                      ${formatPrice((listing.price || 0) / (listing.credit?.creditAmount || 1))}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">USD</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-semibold text-gray-900">
                      {listing.credit?.creditAmount || 0} tonnes
                    </span>
                  </div>
                </div>
              </div>

              {/* Selection Preview */}
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Your Selection</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-gray-900">{purchaseAmount} tonnes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-semibold text-gray-900">
                        ${formatPrice((listing.price || 0) / (listing.credit?.creditAmount || 1))}/tonne
                      </span>
                    </div>
                    <div className="border-t border-gray-300 my-2"></div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Total:</span>
                      <span className="font-bold text-green-600 text-lg">
                        ${formatPrice(((listing.price || 0) / (listing.credit?.creditAmount || 1)) * purchaseAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              {listing.sellerLocation && (
                <div className="mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </h3>
                    <p className="text-sm font-semibold text-gray-900">
                      {listing.sellerLocation.split('-').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}, Vietnam
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handlePurchase}
                  disabled={listing.status !== 'ACTIVE'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {listing.status === 'ACTIVE' ? 'Purchase' : 'Not Available'}
                </button>
                
                <button
                  onClick={() => navigate('/marketplace')}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-semibold transition"
                >
                  Browse More
                </button>
              </div>

              {/* Trust Info */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Secure & verified transaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amount Selection Modal */}
      {showAmountModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Select Amount</h3>
              <p className="text-sm text-gray-600">Choose tonnes to purchase</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (tonnes)
              </label>
              <input
                type="number"
                min="1"
                max={listing.credit?.creditAmount || 1}
                step="1"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(Math.max(1, Math.min(parseInt(e.target.value) || 1, listing.credit?.creditAmount || 1)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="1"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Available: {listing.credit?.creditAmount || 0} tonnes
              </p>
            </div>

            {/* Quick Select */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">Quick Select:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPurchaseAmount(1)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
                >
                  1
                </button>
                <button
                  onClick={() => setPurchaseAmount(Math.max(1, Math.floor((listing.credit?.creditAmount || 1) / 2)))}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
                >
                  Half
                </button>
                <button
                  onClick={() => setPurchaseAmount(listing.credit?.creditAmount || 1)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
                >
                  All
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-bold text-gray-900 mb-3 text-sm">Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-gray-900">{purchaseAmount} tonnes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate:</span>
                  <span className="font-semibold text-gray-900">${formatPrice((listing.price || 0) / (listing.credit?.creditAmount || 1))}/tonne</span>
                </div>
                {listing.sellerLocation && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="text-gray-900">
                      {listing.sellerLocation.split('-').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </div>
                )}
                <div className="border-t border-green-300 my-2"></div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-bold text-green-600 text-lg">
                    ${formatPrice(((listing.price || 0) / (listing.credit?.creditAmount || 1)) * purchaseAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAmountModal(false);
                  setPurchaseAmount(1);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Detailpage;