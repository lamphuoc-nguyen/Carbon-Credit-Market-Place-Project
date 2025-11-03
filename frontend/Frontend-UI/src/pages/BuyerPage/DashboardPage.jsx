import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer';
import { buyerApi } from '../../api';

const DashboardPage = () => {
  const navigate = useNavigate();
  
  // Helper function to format price
  const formatPrice = (price) => {
    return price % 1 === 0 ? price.toFixed(0) : price.toFixed(2);
  };

  // States
  const [stats, setStats] = useState({
    creditsOwned: 0,
    totalInvested: 0,
    co2Offset: 0,
    averagePrice: 0,
    annualGoal: 75,
    creditsRemaining: 126
  });
  
  const [availableListings, setAvailableListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch marketplace listings
      const listingsData = await buyerApi.getMarketplaceListings(0, 10, 'newest');
      setAvailableListings(listingsData.content || []);
      
      // Calculate stats from listings (mock data for now)
      // In real app, fetch from dedicated stats API
      setStats({
        creditsOwned: 374,
        totalInvested: 9350,
        co2Offset: 935,
        averagePrice: 25,
        annualGoal: 75,
        creditsRemaining: 126
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = availableListings.filter(listing => {
    const matchesSearch = listing.credit?.owner?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }).slice(0, 3); // Show only 3 listings

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-600 mt-1">Purchase carbon credits to offset your emissions</p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Carbon Credits Owned */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Carbon Credits Owned
              </h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-900">{stats.creditsOwned}</p>
            </div>
            <p className="text-sm text-green-600 mt-2">+24 this month</p>
          </div>

          {/* Total Invested */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Total Invested
              </h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-900">${formatPrice(stats.totalInvested)}</p>
            </div>
            <p className="text-sm text-gray-500 mt-2">Average ${stats.averagePrice}/credit</p>
          </div>

          {/* CO2 Offset */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                CO₂ Offset
              </h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-900">{stats.co2Offset}</p>
              <span className="text-xl text-gray-500 ml-2">tons</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Carbon neutralized</p>
          </div>

          {/* Annual Goal */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Annual Goal
              </h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-900">{stats.annualGoal}%</p>
            </div>
            <p className="text-sm text-gray-500 mt-2">{stats.creditsRemaining} credits remaining</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Available Credits */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Available Credits
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Browse and purchase carbon credits</p>
                </div>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="text-green-600 hover:text-green-700 font-semibold text-sm cursor-pointer"
                >
                  View All →
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-6 flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search credits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option>All Regions</option>
                  <option>North America</option>
                  <option>Europe</option>
                  <option>Asia</option>
                </select>
              </div>

              {/* Listings */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition cursor-pointer"
                      onClick={() => navigate(`/marketplace/${listing.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900">
                            {listing.credit?.owner?.username || 'Carbon Credit'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            listing.listingType === 'FIXED' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {listing.listingType === 'FIXED' ? '✓ Verified' : 'Auction'}
                          </span>
                          {listing.credit?.projectType && (
                            <span className="text-xs text-gray-500">
                              {listing.credit.projectType}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-semibold text-green-600">
                            {listing.credit?.creditAmount || 0} credits available
                          </span>
                          <span>Total: ${formatPrice((listing.price || 0) * (listing.credit?.creditAmount || 0))}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right mr-4">
                          <p className="text-2xl font-bold text-gray-900">
                            ${formatPrice(listing.price)}
                          </p>
                          <p className="text-xs text-gray-500">per credit</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/marketplace/${listing.id}`);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredListings.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p>No credits found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Charts */}
          <div className="lg:col-span-1 space-y-6">
            {/* Carbon Offset Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Carbon Offset Breakdown</h3>
              <p className="text-sm text-gray-600 mb-6">Distribution by category</p>
              
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {/* Energy - 30% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="20"
                    strokeDasharray="75.4 251.2"
                    strokeDashoffset="0"
                  />
                  {/* Manufacturing - 15% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="20"
                    strokeDasharray="37.7 251.2"
                    strokeDashoffset="-75.4"
                  />
                  {/* Transport - 45% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="20"
                    strokeDasharray="113.1 251.2"
                    strokeDashoffset="-113.1"
                  />
                  {/* Other - 10% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="20"
                    strokeDasharray="25.1 251.2"
                    strokeDashoffset="-226.2"
                  />
                </svg>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-700">Transport</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700">Energy</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">30%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-gray-700">Manufacturing</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-gray-700">Other</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">10%</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;