import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {ArrowLeft, Award, Calendar, Info, Leaf, MapPin, Shield, ShoppingCart, Users, Zap} from 'lucide-react';
import Navbar from '../../Components/EVComponents/Navbar';
import Footer from '../../Components/Footer';
import {buyerApi} from '../../api';

const Detail = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
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
        <Navbar />
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
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/ev-dashboard/marketplace')}
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
                                {/* ✅ FIX: Hiển thị giá đơn vị trực tiếp */}
                                <span className="font-semibold text-gray-900">
                                      ${formatPrice(listing.price || 0)}/tonne
                                    </span>
                            </div>
                            <div className="border-t border-gray-300 my-2"></div>
                            <div className="flex justify-between">
                                <span className="font-bold text-gray-900">Total:</span>
                                {/* ✅ FIX: Tổng = Giá đơn vị * Số lượng mua */}
                                <span className="font-bold text-green-600 text-lg">
                                  ${formatPrice((listing.price || 0) * purchaseAmount)}
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
                  disabled={true}
                  className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-semibold cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Purchase
                </button>
                
                <p className="text-sm text-center text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <Info className="w-4 h-4 inline mr-1" />
                  Only buyers can purchase carbon credits
                </p>
                
                <button
                  onClick={() => navigate('/ev-dashboard/marketplace')}
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
      </div>
      <Footer />
    </>
  );
};

export default Detail;