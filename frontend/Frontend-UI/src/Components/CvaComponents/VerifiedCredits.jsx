import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cvaApi } from '../../api/cvaApi';
import LoadingOverlay from '../../Components/LoadingOverlay';
import { CheckCircle, XCircle, Clock, User, MapPin, Leaf, Calendar, Eye, Filter, Search } from 'lucide-react';

// Component Status Badge với icon
const StatusBadge = ({ status }) => {
    let bgColor, textColor, text, Icon;

    switch (status) {
        case 'VERIFIED':
            bgColor = 'bg-emerald-50';
            textColor = 'text-emerald-700';
            text = 'Approved';
            Icon = CheckCircle;
            break;
        case 'REJECTED':
            bgColor = 'bg-rose-50';
            textColor = 'text-rose-700';
            text = 'Rejected';
            Icon = XCircle;
            break;
        case 'PENDING':
            bgColor = 'bg-amber-50';
            textColor = 'text-amber-700';
            text = 'Pending';
            Icon = Clock;
            break;
        default:
            bgColor = 'bg-gray-50';
            textColor = 'text-gray-700';
            text = status;
            Icon = Clock;
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
            <Icon size={14} />
            {text}
        </span>
    );
};

const VerifiedCredits = () => {
    const [credits, setCredits] = useState([]);
    const [filteredCredits, setFilteredCredits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyVerifications = async () => {
            try {
                setLoading(true);
                setError(null);

                // ✅ Use getVerifiedCredits to get all verified carbon credits
                const data = await cvaApi.getVerifiedCredits();

                // handleRequest already returns data directly, no need to check success
                setCredits(data || []);
                setFilteredCredits(data || []);

            } catch (err) {
                console.error("Error fetching verified credits:", err);

                // Handle 401 (Unauthorized) error
                if (err.response?.status === 401) {
                    navigate('/login');
                    return;
                }

                setError(err.response?.data?.message || 'Cannot load verified credits. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyVerifications();
    }, [navigate]);

    // Filter logic
    useEffect(() => {
        let filtered = credits;

        // Filter by status
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(c => c.status === statusFilter);
        }

        // Filter by search term (search by owner username or credit ID)
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredCredits(filtered);
    }, [searchTerm, statusFilter, credits]);

    const handleViewDetails = (creditId) => {
        // Navigate to credit detail view
        navigate(`/cva/credit-detail/${creditId}`);
    };

    // Calculate stats
    const stats = {
        total: credits.length,
        verified: credits.filter(c => c.status === 'VERIFIED').length,
        pending: credits.filter(c => c.status === 'PENDING').length,
        rejected: credits.filter(c => c.status === 'REJECTED').length,
        listed: credits.filter(c => c.isListed).length,
        totalCredits: credits.reduce((sum, c) => sum + (Number(c.creditAmount) || 0), 0),
        totalValue: credits.reduce((sum, c) => sum + ((Number(c.creditAmount) || 0) * (Number(c.estimatedValue) || 10)), 0),
        totalCO2: credits.reduce((sum, c) => sum + (Number(c.creditAmount) || 0), 0) // Assuming creditAmount represents CO2 reduced
    };

    if (loading) {
        return <LoadingOverlay />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="bg-rose-100 rounded-full p-4 inline-block mb-4">
                        <XCircle className="h-12 w-12 text-rose-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (credits.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
                        <Leaf className="h-16 w-16 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Verified Credits Yet</h3>
                    <p className="text-gray-600 mb-4">No carbon credits have been verified yet. Check back later for verified credits.</p>
                    <button
                        onClick={() => navigate('/cva/pending')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        View Pending Journeys
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <Leaf className="h-8 w-8 text-emerald-600" />
                    </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Verified Credits
                </h1>
            </div>
            <p className="text-gray-600 ml-14">View all verified carbon credits in the system</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Credits</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-xs text-gray-500 mt-1">{stats.totalCredits.toFixed(2)} credits</p>
                        </div>
                        <Leaf className="h-10 w-10 text-green-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Verified</p>
                            <p className="text-2xl font-bold text-emerald-600">{stats.verified}</p>
                            <p className="text-xs text-gray-500 mt-1">{stats.total > 0 ? ((stats.verified / stats.total) * 100).toFixed(1) : 0}% rate</p>
                        </div>
                        <CheckCircle className="h-10 w-10 text-emerald-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Listed</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.listed}</p>
                            <p className="text-xs text-gray-500 mt-1">In marketplace</p>
                        </div>
                        <MapPin className="h-10 w-10 text-blue-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Value</p>
                            <p className="text-2xl font-bold text-green-600">${stats.totalValue.toFixed(0)}</p>
                            <p className="text-xs text-gray-500 mt-1">Estimated</p>
                        </div>
                        <div className="h-10 w-10 text-green-500 opacity-20 flex items-center justify-center">
                            <span className="text-2xl">💰</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                        >
                            <option value="ALL">All Status</option>
                            <option value="VERIFIED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="PENDING">Pending</option>
                        </select>
                    </div>

                    {/* Clear Filters */}
                    {(searchTerm || statusFilter !== 'ALL') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('ALL');
                            }}
                            className="px-4 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <User size={16} />
                                        Owner
                                    </div>
                                </th>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <Leaf size={16} />
                                        Credit Amount
                                    </div>
                                </th>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        Created Date
                                    </div>
                                </th>
                                <th className="py-4 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCredits.map((credit) => (
                                <tr key={credit.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                                                {credit.user?.username?.charAt(0).toUpperCase() || credit.ownerUsername?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="font-medium text-gray-900">
                                                {credit.user?.username || credit.ownerUsername || 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                            <span className="font-semibold text-emerald-600">
                                                {credit.creditAmount ? Number(credit.creditAmount).toFixed(2) : '0.00'}
                                            </span>
                                            <span className="text-gray-500 text-sm">credits</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <StatusBadge status={credit.status} />
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-600">
                                        {credit.createdAt
                                            ? new Date(credit.createdAt).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : <span className="text-gray-400">N/A</span>}
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleViewDetails(credit.id)}
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            <Eye size={16} />
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty state for filtered results */}
                {filteredCredits.length === 0 && credits.length > 0 && (
                    <div className="text-center py-12">
                        <Search className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-gray-600 font-medium mb-1">No results found</p>
                        <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Results Count */}
            {filteredCredits.length > 0 && (
                <div className="mt-4 text-center text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredCredits.length}</span> of <span className="font-semibold">{credits.length}</span> carbon credits
                </div>
            )}
        </div>
    );
};

export default VerifiedCredits;