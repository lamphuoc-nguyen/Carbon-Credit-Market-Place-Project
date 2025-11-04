import React, { useState, useEffect } from 'react';
import EvOwnerAPI from '../../api/EvOwnerApi';
import { Search, Grid3x3, List, Map, Phone, ChevronDown } from 'lucide-react';

const MainContent = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('highest');
    const [viewMode, setViewMode] = useState('grid');
    const [setFilters] = useState({
        country: [],
        category: [],
        vintage: [],
        registry: [],
        sdg: []
    });

    // Fetch listings on component mount
    useEffect(() => {
        fetchListings();
    }, [sortBy]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const response = await EvOwnerAPI.marketplace.getActiveListings({
                page: 0,
                size: 20,
                sortBy: sortBy === 'highest' ? 'price_desc' : 'price_asc'
            });
            setListings(response.data);
        } catch (error) {
            console.error('Failed to fetch listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
    };

    const clearFilters = () => {
        setFilters({
            country: [],
            category: [],
            vintage: [],
            registry: [],
            sdg: []
        });
    };

    return (
        <div className="flex gap-6 p-6 bg-gray-50 min-h-screen">
            {/* Left Sidebar - Filters */}
            <aside className="w-72 bg-white p-5 rounded-lg shadow-sm h-fit sticky top-6">
                {/* Country Filter */}
                <div className="mb-5 pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">Country</h3>
                        <span className="text-xs text-gray-500">0 Selected</span>
                    </div>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Select countries...</option>
                    </select>
                </div>

                {/* Category Filter */}
                <div className="mb-5 pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">Category</h3>
                        <span className="text-xs text-gray-500">0 Selected</span>
                    </div>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Select categories...</option>
                    </select>
                </div>

                {/* Vintage Filter */}
                <div className="mb-5 pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">Vintage</h3>
                        <span className="text-xs text-gray-500">0 Selected</span>
                    </div>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Select vintage...</option>
                    </select>
                </div>

                {/* Registry Filter */}
                <div className="mb-5 pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">Registry</h3>
                        <span className="text-xs text-gray-500">0 Selected</span>
                    </div>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Select registry...</option>
                    </select>
                </div>

                {/* UN SDG Filter */}
                <div className="mb-5 pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">UN SDG</h3>
                        <span className="text-xs text-gray-500">0 Selected</span>
                    </div>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Select UN SDG...</option>
                    </select>
                </div>

                {/* Listing Types */}
                <div className="mb-5">
                    <label className="flex items-center gap-2 py-2.5 cursor-pointer text-sm text-gray-700">
                        <input type="radio" name="listing-type" defaultChecked className="cursor-pointer" />
                        <span>Featured merchant listings</span>
                    </label>
                    <label className="flex items-center gap-2 py-2.5 cursor-pointer text-sm text-gray-700">
                        <input type="radio" name="listing-type" className="cursor-pointer" />
                        <span>Carbonmark Direct listings</span>
                    </label>
                </div>

                {/* Clear Filters Button */}
                <button
                    onClick={clearFilters}
                    className="w-full px-4 py-3 bg-white border-2 border-blue-500 text-blue-500 font-semibold text-xs rounded-md hover:bg-blue-500 hover:text-white transition-all tracking-wide"
                >
                    CLEAR FILTERS
                </button>

                {/* Results Count */}
                <div className="my-5 px-3 py-3 bg-gray-50 rounded-md text-center font-semibold text-sm text-gray-700">
                    {listings.length} of {listings.length} Results
                </div>

                {/* Help Section */}
                <div className="mt-6 pt-5 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                        Need help selecting a project? Our team is here to support.
                    </p>
                    <button className="w-full px-4 py-3 bg-yellow-400 text-gray-900 font-semibold text-xs rounded-md hover:bg-yellow-500 transition-colors tracking-wide flex items-center justify-center gap-2">
                        <Phone size={14} />
                        SCHEDULE A CALL
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1">
                {/* Search and Controls Bar */}
                <div className="flex justify-between items-center mb-6 gap-5 flex-wrap">
                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-lg flex">
                        <input
                            type="text"
                            placeholder="Search for a project"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="px-5 py-3 bg-gray-500 rounded-r-md text-white hover:bg-gray-600 transition-colors"
                        >
                            <Search size={18} />
                        </button>
                    </form>

                    {/* View Controls */}
                    <div className="flex items-center gap-4">
                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2 text-sm">
                            <label className="font-medium text-gray-700">Sort:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="highest">Price Highest</option>
                                <option value="lowest">Price Lowest</option>
                                <option value="newest">Newest First</option>
                            </select>
                        </div>

                        {/* View Mode Buttons */}
                        <div className="flex border border-gray-300 rounded-md overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-yellow-400 text-gray-900' : 'bg-white hover:bg-gray-50'
                                    }`}
                            >
                                <Grid3x3 size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 border-l border-gray-300 transition-colors ${viewMode === 'list' ? 'bg-yellow-400 text-gray-900' : 'bg-white hover:bg-gray-50'
                                    }`}
                            >
                                <List size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`p-2.5 border-l border-gray-300 transition-colors ${viewMode === 'map' ? 'bg-yellow-400 text-gray-900' : 'bg-white hover:bg-gray-50'
                                    }`}
                            >
                                <Map size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading carbon credits...</div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {listings.map((listing) => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

// Listing Card Component
const ListingCard = ({ listing }) => {
    const handlePurchase = async () => {
        try {
            await EvOwnerAPI.transactions.initiatePurchase(listing.id);
            alert('Purchase initiated successfully!');
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Failed to purchase. Please try again.');
        }
    };

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
            {/* Image */}
            <div className="w-full h-48 bg-gray-200 overflow-hidden">
                <img
                    src={listing.imageUrl || 'https://via.placeholder.com/400x300'}
                    alt={listing.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Price */}
                <div className="text-2xl font-bold text-gray-900 mb-3">
                    ${listing.price || '0.00'}
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-gray-900 mb-3 leading-snug line-clamp-2">
                    {listing.title || 'Carbon Credit Project'}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 mb-4 leading-relaxed line-clamp-3">
                    {listing.description || 'This project helps reduce carbon emissions and supports sustainable development.'}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {listing.country && (
                        <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-xs font-medium text-gray-700">
                            {listing.country}
                        </span>
                    )}
                    {listing.category && (
                        <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-700">
                            {listing.category}
                        </span>
                    )}
                    {listing.year && (
                        <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-xs font-medium text-gray-700">
                            {listing.year}
                        </span>
                    )}
                </div>

                {/* SDG Badges */}
                {listing.sdgs && (
                    <div className="mb-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-full text-xs font-semibold text-blue-700">
                            🎯 {listing.sdgs} SDGs
                        </span>
                    </div>
                )}

                {/* Purchase Button */}
                <button
                    onClick={handlePurchase}
                    className="w-full px-4 py-3 bg-green-500 text-white font-semibold text-sm rounded-md hover:bg-green-600 transition-colors"
                >
                    Purchase Credit
                </button>
            </div>
        </div>
    );
};

export default MainContent;