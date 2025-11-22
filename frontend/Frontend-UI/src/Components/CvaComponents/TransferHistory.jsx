import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRightLeft, Calendar, CheckCircle, XCircle, Clock,
    Leaf, TrendingUp, Eye, Filter, Search, ChevronDown
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { cvaApi } from '../../api/cvaApi';

const TransferHistory = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [rejectedRequests, setRejectedRequests] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [activeTab, setActiveTab] = useState('approved'); // 'approved' or 'rejected'
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'amount-desc', 'amount-asc'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [approved, rejected, stats] = await Promise.all([
                cvaApi.getApprovedTransferRequests().catch(() => []),
                cvaApi.getRejectedTransferRequests().catch(() => []),
                cvaApi.getTransferStatistics().catch(() => ({}))
            ]);
            setApprovedRequests(approved || []);
            setRejectedRequests(rejected || []);
            setStatistics(stats || {});
        } catch (error) {
            console.error('Failed to fetch transfer history:', error);
            toast.error('Failed to load transfer history');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatDateShort = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    // Filter and sort requests
    const getFilteredAndSortedRequests = () => {
        const requests = activeTab === 'approved' ? approvedRequests : rejectedRequests;
        
        // Filter by search query
        let filtered = requests.filter(req => {
            const searchLower = searchQuery.toLowerCase();
            return (
                (req.username || '').toLowerCase().includes(searchLower) ||
                (req.requesterName || '').toLowerCase().includes(searchLower) ||
                (req.co2Amount?.toString() || '').includes(searchLower) ||
                (req.creditsToGenerate?.toString() || '').includes(searchLower)
            );
        });

        // Sort
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.processedAt || b.createdAt) - new Date(a.processedAt || a.createdAt);
                case 'date-asc':
                    return new Date(a.processedAt || a.createdAt) - new Date(b.processedAt || b.createdAt);
                case 'amount-desc':
                    return (b.co2Amount || 0) - (a.co2Amount || 0);
                case 'amount-asc':
                    return (a.co2Amount || 0) - (b.co2Amount || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const displayedRequests = getFilteredAndSortedRequests();

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading transfer history...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
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
                style={{ zIndex: 9999 }}
            />

            {/* Header Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Transfer Request History</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg flex justify-between items-center border border-yellow-100">
                        <div>
                            <p className="text-sm text-yellow-900">Pending</p>
                            <p className="text-2xl font-bold text-yellow-700">{statistics.pendingTransfers || 0}</p>
                        </div>
                        <Clock className="text-yellow-600 w-8 h-8" />
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg flex justify-between items-center border border-green-100">
                        <div>
                            <p className="text-sm text-green-900">Approved</p>
                            <p className="text-2xl font-bold text-green-700">{statistics.approvedTransfers || approvedRequests.length}</p>
                        </div>
                        <CheckCircle className="text-green-600 w-8 h-8" />
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg flex justify-between items-center border border-red-100">
                        <div>
                            <p className="text-sm text-red-900">Rejected</p>
                            <p className="text-2xl font-bold text-red-700">{statistics.rejectedTransfers || rejectedRequests.length}</p>
                        </div>
                        <XCircle className="text-red-600 w-8 h-8" />
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center border border-blue-100">
                        <div>
                            <p className="text-sm text-blue-900">Total Processed</p>
                            <p className="text-2xl font-bold text-blue-700">{statistics.totalTransfers || (approvedRequests.length + rejectedRequests.length)}</p>
                        </div>
                        <TrendingUp className="text-blue-600 w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Filters and Tabs */}
            <div className="bg-white rounded-lg shadow-sm border">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex space-x-1 p-4">
                        <button
                            onClick={() => setActiveTab('approved')}
                            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                                activeTab === 'approved'
                                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                            }`}
                        >
                            <CheckCircle className="w-4 h-4 inline mr-2" />
                            Approved ({approvedRequests.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('rejected')}
                            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                                activeTab === 'rejected'
                                    ? 'bg-red-100 text-red-700 border-2 border-red-300'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                            }`}
                        >
                            <XCircle className="w-4 h-4 inline mr-2" />
                            Rejected ({rejectedRequests.length})
                        </button>
                    </div>
                </div>

                {/* Search and Sort */}
                <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by username, amount, or credits..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none bg-white cursor-pointer"
                        >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="amount-desc">Highest CO₂ First</option>
                            <option value="amount-asc">Lowest CO₂ First</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>
                </div>

                {/* Request List */}
                <div className="p-6">
                    {displayedRequests.length === 0 ? (
                        <div className="text-center py-12">
                            {activeTab === 'approved' ? (
                                <>
                                    <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Requests</h3>
                                    <p className="text-gray-500">
                                        {searchQuery ? 'No approved requests match your search.' : 'No requests have been approved yet.'}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Rejected Requests</h3>
                                    <p className="text-gray-500">
                                        {searchQuery ? 'No rejected requests match your search.' : 'No requests have been rejected yet.'}
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {displayedRequests.map((req) => (
                                <div
                                    key={req.id}
                                    className={`border-2 rounded-lg p-6 hover:shadow-md transition-all ${
                                        activeTab === 'approved'
                                            ? 'border-green-200 bg-green-50/30 hover:border-green-300'
                                            : 'border-red-200 bg-red-50/30 hover:border-red-300'
                                    }`}
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div className="flex-1">
                                            {/* User Info */}
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                                    activeTab === 'approved' ? 'bg-green-500' : 'bg-red-500'
                                                }`}>
                                                    {(req.username || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-900 text-lg">
                                                        {req.requesterName || req.username}
                                                    </span>
                                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        Processed: {formatDate(req.processedAt || req.updatedAt)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CO2 and Credits */}
                                            <div className="flex items-center space-x-4 mb-3">
                                                <div className={`flex items-center font-bold px-4 py-2 rounded-lg ${
                                                    activeTab === 'approved' ? 'text-green-700 bg-green-100 border border-green-300' : 'text-gray-600 bg-gray-100 border border-gray-300'
                                                }`}>
                                                    <Leaf className="w-5 h-5 mr-2" />
                                                    {req.co2Amount?.toLocaleString()} kg CO₂
                                                </div>
                                                <ArrowRightLeft className="w-5 h-5 text-gray-400" />
                                                <div className={`flex items-center font-bold px-4 py-2 rounded-lg ${
                                                    activeTab === 'approved' ? 'text-blue-700 bg-blue-100 border border-blue-300' : 'text-gray-600 bg-gray-100 border border-gray-300'
                                                }`}>
                                                    <TrendingUp className="w-5 h-5 mr-2" />
                                                    {req.creditsToGenerate} Credits
                                                </div>
                                            </div>

                                            {/* Status Badge and Notes */}
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    {activeTab === 'approved' ? (
                                                        <span className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full text-xs font-bold flex items-center">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            APPROVED
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full text-xs font-bold flex items-center">
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            REJECTED
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-500">
                                                        on {formatDateShort(req.processedAt || req.updatedAt)}
                                                    </span>
                                                </div>

                                                {/* CVA Notes/Reason */}
                                                {(req.approvalNotes || req.rejectionReason) && (
                                                    <div className={`p-3 rounded-lg text-sm ${
                                                        activeTab === 'approved'
                                                            ? 'bg-green-50 border border-green-200 text-green-800'
                                                            : 'bg-red-50 border border-red-200 text-red-800'
                                                    }`}>
                                                        <p className="font-semibold text-xs mb-1">
                                                            {activeTab === 'approved' ? 'Approval Notes:' : 'Rejection Reason:'}
                                                        </p>
                                                        <p className="italic">{req.approvalNotes || req.rejectionReason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => navigate(`/cva/transfer-request/${req.id}`)}
                                                className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors ${
                                                    activeTab === 'approved'
                                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                                        : 'bg-red-600 text-white hover:bg-red-700'
                                                }`}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Results count */}
                {displayedRequests.length > 0 && (
                    <div className="px-6 py-4 border-t bg-gray-50 text-sm text-gray-600">
                        Showing {displayedRequests.length} of {activeTab === 'approved' ? approvedRequests.length : rejectedRequests.length} {activeTab} requests
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransferHistory;