import React, { useState, useEffect, useCallback } from 'react';
import { creditListingApi } from '../../api/creditListingApi';
import {
    ShoppingBag,
    DollarSign,
    TrendingUp,
    Eye,
    Search,
    Filter,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Calendar,
    User,
    Package,
    CheckCircle,
    XCircle,
    Clock,
    BarChart3,
    X
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Helper Components ---

/**
 * StatusBadge: Hiển thị trạng thái listing
 */
const StatusBadge = ({ status }) => {
    const statusConfig = {
        ACTIVE: { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Active' },
        SOLD: { color: 'bg-blue-100 text-blue-700', icon: ShoppingBag, text: 'Sold' },
        CANCELLED: { color: 'bg-red-100 text-red-700', icon: XCircle, text: 'Cancelled' },
        PENDING: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, text: 'Pending' }
    };

    const config = statusConfig[status?.toUpperCase()] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.text}
        </span>
    );
};

/**
 * StatCard: Card thống kê
 */
// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, icon: Icon, bgColor, textColor, subtitle }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
                </div>
                <div className={`${bgColor} p-4 rounded-lg`}>
                    <Icon className={`h-8 w-8 ${textColor}`} />
                </div>
            </div>
        </div>
    );
};

/**
 * Pagination Component
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
            </button>
            <span className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage + 1}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage + 1 >= totalPages}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
            </button>
        </div>
    );
};

/**
 * DetailModal Component
 */
const DetailModal = ({ listing, onClose }) => {
    if (!listing) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Listing Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Status</h3>
                        <StatusBadge status={listing.status} />
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">Listing ID</span>
                            </div>
                            <p className="text-sm text-gray-900 font-mono">{listing.id}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">Price</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(listing.price)}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="h-5 w-5 text-purple-600" />
                                <span className="text-sm font-medium text-gray-700">Seller</span>
                            </div>
                            <p className="text-sm text-gray-900">{listing.credit?.owner?.username || 'N/A'}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-5 w-5 text-red-600" />
                                <span className="text-sm font-medium text-gray-700">Location</span>
                            </div>
                            <p className="text-sm text-gray-900">
                                {listing.sellerLocation || listing.credit?.owner?.province || 'VietNam'}
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-5 w-5 text-orange-600" />
                                <span className="text-sm font-medium text-gray-700">Created At</span>
                            </div>
                            <p className="text-sm text-gray-900">{formatDate(listing.createdAt)}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-5 w-5 text-orange-600" />
                                <span className="text-sm font-medium text-gray-700">Updated At</span>
                            </div>
                            <p className="text-sm text-gray-900">{formatDate(listing.updatedAt)}</p>
                        </div>
                    </div>

                    {/* Credit Details */}
                    {listing.credit && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Credit ID</span>
                                    <p className="text-sm text-gray-900 font-mono mt-1">{listing.credit.id}</p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Credit Amount</span>
                                    <p className="text-sm text-gray-900 mt-1">
                                        {listing.credit.creditAmount || 0} credit(s)
                                    </p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">CO₂ Reduced</span>
                                    <p className="text-sm text-gray-900 mt-1">
                                        {listing.credit.co2ReducedKg || 0} kg CO₂
                                    </p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Credit Status</span>
                                    <p className="text-sm text-gray-900 mt-1">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${listing.credit.status === 'LISTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {listing.credit.status || 'N/A'}
                                        </span>
                                    </p>
                                </div>

                                {listing.credit.owner && (
                                    <>
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Verified By</span>
                                            <p className="text-sm text-gray-900 mt-1">{listing.credit.verifiedByUsername || 'N/A'}</p>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Verified At</span>
                                            <p className="text-sm text-gray-900 mt-1">{formatDate(listing.credit.verifiedAt)}</p>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Owner ID</span>
                                            <p className="text-sm text-gray-900 font-mono mt-1">{listing.credit.owner.id}</p>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Owner Role</span>
                                            <p className="text-sm text-gray-900 mt-1">{listing.credit.owner.role || 'N/A'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Credit IDs if available */}
                    {listing.creditIds && listing.creditIds.length > 0 && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Credit IDs</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex flex-wrap gap-2">
                                    {listing.creditIds.map((id, index) => (
                                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded-full">
                                            {id}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * SearchFilter Component
 */
const SearchFilter = ({ minPrice, maxPrice, onMinPriceChange, onMaxPriceChange, onSearch, onReset }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter by Price:</span>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Min:</label>
                    <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => onMinPriceChange(e.target.value)}
                        placeholder="0"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Max:</label>
                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => onMaxPriceChange(e.target.value)}
                        placeholder="1000"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button
                    onClick={onSearch}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    <Search className="h-4 w-4" />
                    Search
                </button>
                <button
                    onClick={onReset}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const CreditListingManagement = () => {
    const [listings, setListings] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    // Search/Filter
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // View mode
    const [viewMode, setViewMode] = useState('all'); // 'all' or 'search'

    // Modal state
    const [selectedListing, setSelectedListing] = useState(null);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Fetch all active listings
    const fetchAllListings = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await creditListingApi.getActiveListings(currentPage, pageSize);
            console.log('Listings response:', response);

            // Log chi tiết listing đầu tiên để debug
            if (response.content && response.content.length > 0) {
                console.log('First listing detail:', response.content[0]);
            }

            // Handle both direct array and paginated response
            if (Array.isArray(response)) {
                setListings(response);
                setTotalPages(1);
                setTotalElements(response.length);
            } else {
                setListings(response.content || []);
                setTotalPages(response.totalPages || 0);
                setTotalElements(response.totalElements || 0);
            }
        } catch (err) {
            console.error('Error fetching listings:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch listings');
            setListings([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage]);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const response = await creditListingApi.getMarketplaceStats();
            console.log('Stats response:', response);

            // Map API response to expected format
            // API trả về: { totalActiveListings, averagePrice }
            const mappedStats = {
                totalListings: response.totalActiveListings || 0,
                activeListings: response.totalActiveListings || 0,
                soldListings: 0, // API không trả về, để 0
                averagePrice: response.averagePrice || 0
            };

            setStats(mappedStats);
        } catch (err) {
            console.error('Error fetching stats:', err);
            // Set default stats on error
            setStats({
                totalListings: 0,
                activeListings: 0,
                soldListings: 0,
                averagePrice: 0
            });
        }
    }, []);

    // Search by price range
    const handleSearch = async () => {
        if (!minPrice && !maxPrice) {
            toast.warning('Please enter at least one price value');
            return;
        }

        setIsSearching(true);
        setIsLoading(true);
        setError(null);
        setCurrentPage(0);

        try {
            const response = await creditListingApi.searchByPriceRange(
                minPrice || 0,
                maxPrice || 999999999,
                0,
                pageSize
            );

            if (Array.isArray(response)) {
                setListings(response);
                setTotalPages(1);
                setTotalElements(response.length);
            } else {
                setListings(response.content || []);
                setTotalPages(response.totalPages || 0);
                setTotalElements(response.totalElements || 0);
            }

            setViewMode('search');
            toast.success(`Found ${response.content?.length || response.length || 0} listings`);
        } catch (err) {
            console.error('Error searching listings:', err);
            setError(err.response?.data?.message || 'Failed to search listings');
            toast.error('Search failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Reset filter
    const handleReset = () => {
        setMinPrice('');
        setMaxPrice('');
        setIsSearching(false);
        setViewMode('all');
        setCurrentPage(0);
        fetchAllListings();
    };

    // Initial load
    useEffect(() => {
        fetchAllListings();
        fetchStats();
    }, [fetchAllListings, fetchStats]);

    // Reload when page changes in search mode
    useEffect(() => {
        if (isSearching && viewMode === 'search') {
            handleSearch();
        }
    }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle page change
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        if (!isSearching) {
            fetchAllListings();
        }
    };

    // Parse stats safely
    const totalListings = Number(stats?.totalListings) || 0;
    const activeListings = Number(stats?.activeListings) || 0;
    const soldListings = Number(stats?.soldListings) || 0;
    const averagePrice = Number(stats?.averagePrice) || 0;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <ShoppingBag className="h-8 w-8 text-blue-600" />
                            Credit Listing Management
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Monitor and manage all marketplace credit listings
                        </p>
                    </div>
                    <button
                        onClick={() => { fetchAllListings(); fetchStats(); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="h-5 w-5" />
                        Refresh
                    </button>
                </div>
            </header>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard
                        title="Total Listings"
                        value={totalListings.toLocaleString()}
                        icon={Package}
                        bgColor="bg-blue-50"
                        textColor="text-blue-600"
                        subtitle="All time"
                    />
                    <StatCard
                        title="Active Listings"
                        value={activeListings.toLocaleString()}
                        icon={CheckCircle}
                        bgColor="bg-green-50"
                        textColor="text-green-600"
                        subtitle="Currently available"
                    />
                    <StatCard
                        title="Sold Listings"
                        value={soldListings.toLocaleString()}
                        icon={ShoppingBag}
                        bgColor="bg-purple-50"
                        textColor="text-purple-600"
                        subtitle="Completed sales"
                    />
                    <StatCard
                        title="Average Price"
                        value={`$${averagePrice.toLocaleString()}`}
                        icon={DollarSign}
                        bgColor="bg-yellow-50"
                        textColor="text-yellow-600"
                        subtitle="Per listing"
                    />
                </div>
            )}

            {/* Search Filter */}
            <SearchFilter
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                onSearch={handleSearch}
                onReset={handleReset}
            />

            {/* Listings Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            {viewMode === 'search' ? 'Search Results' : 'All Active Listings'}
                            <span className="text-sm font-normal text-gray-500">
                                ({totalElements} total)
                            </span>
                        </h2>
                    </div>
                </div>

                {/* Loading / Error / Data */}
                {isLoading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading listings...</p>
                    </div>
                ) : error ? (
                    <div className="p-12 text-center">
                        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 font-medium">{error}</p>
                        <button
                            onClick={fetchAllListings}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No listings found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Listing ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Seller
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Credits
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {listings.map((listing) => (
                                        <tr key={listing.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs font-mono text-gray-500" title={listing.id}>
                                                    {listing.id?.substring(0, 8)}...
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {listing.credit?.owner?.username || listing.sellerUsername || listing.seller?.username || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {Number(listing.price || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <Package className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm text-gray-600">
                                                        {listing.creditIds?.length || (listing.credit ? 1 : 0)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">
                                                        {listing.sellerLocation || listing.credit?.owner?.province || 'VietNam'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(listing.createdAt)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={listing.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                                                    title="View Details"
                                                    onClick={() => setSelectedListing(listing)}
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-200">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Detail Modal */}
            {selectedListing && (
                <DetailModal
                    listing={selectedListing}
                    onClose={() => setSelectedListing(null)}
                />
            )}

            {/* Toast Notifications */}
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
};

export default CreditListingManagement;