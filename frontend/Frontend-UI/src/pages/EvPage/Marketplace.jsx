import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '../../api';
import Navbar from '../../Components/EVComponents/Navbar';
import { getValidToken } from '../../utils/tokenUtils';
import Footer from '../../Components/Footer';

const MakerPlacePage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Helper function to format price (hide .00 for whole numbers)
  const formatPrice = (price) => {
    return price % 1 === 0 ? price.toFixed(0) : price.toFixed(2);
  };
  
  // States
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allListings, setAllListings] = useState([]);

  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [pageSize] = useState(15);
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [listingTypeFilter, setListingTypeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const [isPriceSearchActive, setIsPriceSearchActive] = useState(false);

  // Computed values
  const totalItems = listings.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedListings = listings.slice(page * pageSize, (page + 1) * pageSize);

  // Sorting function
  const sortListings = useCallback((listingsToSort) => {
    return [...listingsToSort].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'credit-low':
          return (a.credit?.creditAmount || 0) - (b.credit?.creditAmount || 0);
        case 'credit-high':
          return (b.credit?.creditAmount || 0) - (a.credit?.creditAmount || 0);
        default:
          return 0;
      }
    });
  }, [sortBy]);

  // Apply all filters (username + listing type + price range)
  const applyAllFilters = useCallback(() => {
    let filtered = [...allListings];
    
    // Filter by username
    if (searchUsername.trim()) {
      filtered = filtered.filter(listing => 
        listing.credit?.owner?.username?.toLowerCase().includes(searchUsername.toLowerCase())
      );
    }
    
    // Filter by listing type
    if (listingTypeFilter !== 'ALL') {
      filtered = filtered.filter(listing => listing.listingType === listingTypeFilter);
    }
    
    // Filter by price range (client-side)
    if (minPrice && maxPrice) {
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);
      filtered = filtered.filter(listing => {
        const totalPrice = (listing.price || 0) * (listing.credit?.creditAmount || 0);
        return totalPrice >= min && totalPrice <= max;
      });
    }
    
    // Apply sorting
    const sorted = sortListings(filtered);
    
    setListings(sorted);
    setPage(0); // Reset to first page when filters change
  }, [allListings, searchUsername, listingTypeFilter, minPrice, maxPrice, sortListings]);

  // Fetch marketplace listings
  const fetchMarketplaceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const listingsData = await buyerApi.getMarketplaceListings(0, 100);

      let fetchedListings = listingsData.content || [];
      const sorted = sortListings(fetchedListings);
      
      setAllListings(sorted);
      setListings(sorted);

      console.log('✅ Marketplace Data:', {
        listings: listingsData,
        totalElements: listingsData.totalElements,
        sortBy: sortBy
      });
    } catch (err) {
      console.error('❌ Error fetching marketplace:', err);
      setError(err.message || 'Unable to load marketplace data');
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortListings]);

  // Load data when component mounts
  useEffect(() => {
    if (!isPriceSearchActive) {
      fetchMarketplaceData();
    }
  }, [fetchMarketplaceData, isPriceSearchActive]);

  // Check authentication status
  useEffect(() => {
    const token = getValidToken();
    setIsAuthenticated(!!token);
  }, []);

  // Apply filters when any filter changes
  useEffect(() => {
    applyAllFilters();
  }, [applyAllFilters]);

  // Clear all filters
  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchUsername('');
    setListingTypeFilter('ALL');
    setIsPriceSearchActive(false);
    setPage(0);
    fetchMarketplaceData();
  };

  // View credit details or buy now - redirect to login if not authenticated
  const handleViewDetails = (listingId) => {
    if (!listingId) {
      console.error('Invalid listing ID');
      return;
    }
    
    // Check if user is authenticated before allowing purchase
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login', { state: { from: `/ev-dashboard/detail/${listingId}` } });
      return;
    }
    
    navigate(`/ev-dashboard/detail/${listingId}`);
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-100 bg-cover bg-center bg-fixed" 
         style={{backgroundImage: "url('/src/image/marketbg.png')"}}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Layout: Sidebar + Listings */}
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Left Sidebar - Filters (OLD DESIGN) */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </h3>

              {/* Sort */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="credit-low">Credit Amount: Low to High</option>
                  <option value="credit-high">Credit Amount: High to Low</option>
                </select>
              </div>

              {/* Listing Type Filter */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Listing Type
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setListingTypeFilter('ALL')}
                    className={`w-full px-4 py-2.5 rounded-lg font-medium cursor-pointer text-sm transition ${
                      listingTypeFilter === 'ALL'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Listings
                  </button>
                  <button
                    onClick={() => setListingTypeFilter('FIXED')}
                    className={`w-full px-4 py-2.5 rounded-lg font-medium cursor-pointer text-sm transition ${
                      listingTypeFilter === 'FIXED'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Fixed Price
                  </button>
                  <button
                    onClick={() => setListingTypeFilter('AUCTION')}
                    className={`w-full px-4 py-2.5 rounded-lg font-medium cursor-pointer text-sm transition ${
                      listingTypeFilter === 'AUCTION'
                        ? 'bg-lime-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Auction
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h4>
                
                {/* Min Price */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">
                    Min Price ($)
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Max Price */}
                <div className="mb-4">
                  <label className="block text-xs text-gray-600 mb-1">
                    Max Price ($)
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleClearFilters}
                  className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>
          </aside>

          {/* Right Content - Listings */}
          <main className="flex-1">
            
            {/* Search Bar with View Toggle (OLD DESIGN) */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    placeholder="Search by seller username..."
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-sm"
                  />
                  {searchUsername && (
                    <button
                      onClick={() => setSearchUsername('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>

                {/* View Toggle Buttons */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition ${
                      viewMode === 'grid'
                        ? 'bg-white shadow-sm text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Grid View"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition ${
                      viewMode === 'list'
                        ? 'bg-white shadow-sm text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="List View"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {searchUsername && (
                <p className="mt-2 text-sm text-gray-600">
                  {listings.length} result{listings.length !== 1 ? 's' : ''} found for "{searchUsername}"
                </p>
              )}
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-green-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading projects...</p>
              </div>
            )}

            {/* Listings Grid - Carbonmark Style */}
            {!loading && paginatedListings.length > 0 && (
              <>
                {/* Items Count Display */}
                <div className="mb-4 text-sm text-gray-600">
                  Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalItems)} of {totalItems} items
                </div>

                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                    {paginatedListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        {/* Card Header - No Image */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b border-gray-200">
                          <div className="flex justify-between items-start mb-3">
                            {/* Listing Type Badge */}
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                              listing.listingType === 'FIXED' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-orange-500 text-white'
                            }`}>
                              {listing.listingType === 'FIXED' ? '💵 Fixed Price' : '🎯 Auction'}
                            </span>
                            
                            {/* Status Badge */}
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                              listing.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {listing.status}
                            </span>
                          </div>
                          
                          {/* Seller Username as Title */}
                          {listing.credit?.owner?.username ? (
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 flex items-center">                 
                                {listing.credit.owner.username}
                              </h3>
                              {listing.sellerLocation && (
                                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {listing.sellerLocation}
                                </p>
                              )}
                            </div>
                          ) : (
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                              Carbon Credit #{listing.id?.substring(0, 8)}
                            </h3>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-6">
                          {/* Metrics Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                            {listing.credit?.creditAmount && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Credits</p>
                                <p className="text-sm font-bold text-gray-900">{listing.credit.creditAmount}</p>
                              </div>
                            )}
                            {listing.credit?.co2ReducedKg && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">CO₂ Reduced</p>
                                <p className="text-sm font-bold text-gray-900">{listing.credit.co2ReducedKg} kg</p>
                              </div>
                            )}
                          </div>
                            
                          {/* Divider */}
                          <div className="border-t border-gray-200 my-4"></div>

                          {/* Price Section */}
                          <div className="flex items-baseline justify-between mb-4">
                            <div className="w-full">
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Price</p>
                              <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold text-green-600">
                                  ${formatPrice((listing.price || 0) * (listing.credit?.creditAmount || 0))}
                                </p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                ${formatPrice(listing.price)}/tonne × {listing.credit?.creditAmount || 0} tonnes
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(listing.id)}
                              disabled={listing.status !== 'ACTIVE'}
                              className="flex-1 bg-green-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                            >
                              Buy Now
                            </button>
                            {listing.id && (
                              <button
                                onClick={() => handleViewDetails(listing.id)}
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all"
                              >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Posted Date */}
                          {listing.createdAt && (
                            <p className="text-xs text-gray-600 mt-3 text-center">
                              Posted {new Date(listing.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="space-y-4 mb-8">
                    {paginatedListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Left Section - Main Info */}
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                {/* Seller Username */}
                                {listing.credit?.owner?.username ? (
                                  <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                      {listing.credit.owner.username}
                                    </h3>
                                    {listing.sellerLocation && (
                                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {listing.sellerLocation}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Carbon Credit #{listing.id?.substring(0, 8)}
                                  </h3>
                                )}
                                
                                {/* Listing ID */}
                                <p className="text-sm text-gray-500 font-mono mb-3">
                                  ID: {listing.id?.substring(0, 20)}...
                                </p>
                                
                                {/* Badges */}
                                <div className="flex gap-2 mb-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    listing.listingType === 'FIXED' 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-orange-500 text-white'
                                  }`}>
                                    {listing.listingType === 'FIXED' ? '💵 Fixed Price' : '🎯 Auction'}
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    listing.status === 'ACTIVE' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {listing.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Metrics Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              {listing.credit?.creditAmount && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Credits</p>
                                  <p className="text-lg font-bold text-gray-900">{listing.credit.creditAmount}</p>
                                </div>
                              )}
                              {listing.credit?.co2ReducedKg && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">CO₂ Reduced</p>
                                  <p className="text-lg font-bold text-gray-900">{listing.credit.co2ReducedKg} kg</p>
                                </div>
                              )}
                            </div>

                            {/* Date */}
                            {listing.createdAt && (
                              <p className="text-sm text-gray-500">
                                Posted {new Date(listing.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            )}
                          </div>

                          {/* Right Section - Price & Actions */}
                          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 md:w-64 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col justify-center">
                            <div className="text-center mb-4">
                              <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">Total Price</p>
                              <p className="text-3xl font-bold text-green-600 mb-1">
                                ${formatPrice((listing.price || 0) * (listing.credit?.creditAmount || 0))}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                ${formatPrice(listing.price)}/tonne × {listing.credit?.creditAmount || 0} tonnes
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                              <button
                                onClick={() => handleViewDetails(listing.id)}
                                disabled={listing.status !== 'ACTIVE'}
                                className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 cursor-pointer disabled:bg-gray-300 transition-all"
                              >
                                Buy Now
                              </button>
                              {listing.id && (
                                <button
                                  onClick={() => handleViewDetails(listing.id)}
                                  className="w-full bg-white text-gray-700 py-3 px-4 rounded-xl font-semibold border-2 border-gray-200 hover:bg-gray-50 cursor-pointer transition-all"
                                >
                                  View Details
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination - Modern Style */}
                <div className="mb-8">
                  
                  
                  <div className="flex justify-center items-center gap-3">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="p-3 rounded-xl border-2 border-gray-300 hover:border-green-600 hover:bg-green-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="px-6 py-3 bg-white rounded-xl border-2 border-gray-200 font-semibold text-gray-700">
                      Page {page + 1} of {totalPages || 1}
                    </div>

                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-3 rounded-xl border-2 border-gray-300 hover:border-green-600 hover:bg-green-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Empty State - Modern */}
            {!loading && listings.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No Projects Available
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchUsername || listingTypeFilter !== 'ALL' || minPrice || maxPrice
                    ? 'No projects match your current filters. Try adjusting your search criteria.'
                    : 'There are currently no carbon credit projects available. Check back soon for new opportunities to offset your carbon footprint.'}
                </p>
                {(searchUsername || listingTypeFilter !== 'ALL' || minPrice || maxPrice) && (
                  <button
                    onClick={handleClearFilters}
                    className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default MakerPlacePage;