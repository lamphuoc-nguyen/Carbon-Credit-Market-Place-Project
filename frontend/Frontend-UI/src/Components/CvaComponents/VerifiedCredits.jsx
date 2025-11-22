import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cvaApi } from '../../api/cvaApi';
import { userApi } from '../../api/userApi';
import {
    CheckCircle, XCircle, Clock, User, MapPin, Leaf,
    Calendar, Eye, Filter, Search, Loader2, DollarSign
} from 'lucide-react';

// --- Component Status Badge (Hiển thị trạng thái) ---
const StatusBadge = ({ status }) => {
    let bgColor, textColor, text, Icon;

    switch (status) {
        case 'VERIFIED':
        case 'APPROVED':
            bgColor = 'bg-emerald-50 border-emerald-200';
            textColor = 'text-emerald-700';
            text = 'Verified';
            Icon = CheckCircle;
            break;
        case 'REJECTED':
            bgColor = 'bg-rose-50 border-rose-200';
            textColor = 'text-rose-700';
            text = 'Rejected';
            Icon = XCircle;
            break;
        case 'PENDING':
            bgColor = 'bg-amber-50 border-amber-200';
            textColor = 'text-amber-700';
            text = 'Pending';
            Icon = Clock;
            break;
        default:
            bgColor = 'bg-gray-50 border-gray-200';
            textColor = 'text-gray-700';
            text = status || 'Unknown';
            Icon = Clock;
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full border ${bgColor} ${textColor}`}>
            <Icon size={12} strokeWidth={2.5} />
            {text}
        </span>
    );
};

const VerifiedCredits = () => {
    const [credits, setCredits] = useState([]);
    const [filteredCredits, setFilteredCredits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Các state cho bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // State cho modal chi tiết
    const [selectedCredit, setSelectedCredit] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [ownerDetails, setOwnerDetails] = useState(null);
    const [loadingOwner, setLoadingOwner] = useState(false);

    const navigate = useNavigate();

    // --- 1. Tải dữ liệu ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Gọi API lấy danh sách tín chỉ
                // Backend CẦN trả về kèm thông tin user (username/ownerName) trong DTO
                const data = await cvaApi.getVerifiedCredits();

                const safeData = Array.isArray(data) ? data : [];
                setCredits(safeData);
                setFilteredCredits(safeData);

            } catch (err) {
                console.error("Error fetching verified credits:", err);
                setError(err.message || 'Unable to load credits list.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // --- 2. Xử lý Lọc & Tìm kiếm ---
    useEffect(() => {
        let result = credits;

        // Lọc theo trạng thái
        if (statusFilter !== 'ALL') {
            result = result.filter(c => c.status === statusFilter);
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(c => {
                // Tìm tên từ owner object (backend trả về owner là UserDTO)
                const name = c.owner?.fullName || c.owner?.username || '';
                const id = c.id || '';
                return name.toLowerCase().includes(lowerTerm) || id.toLowerCase().includes(lowerTerm);
            });
        }

        setFilteredCredits(result);
    }, [searchTerm, statusFilter, credits]);

    // --- 3. Tính toán thống kê (Stats) ---
    const stats = {
        total: credits.length,
        verified: credits.filter(c => c.status === 'VERIFIED' || c.status === 'APPROVED').length,
        listed: credits.filter(c => c.isListed).length,
        // Tổng số tín chỉ (hỗ trợ cả field 'amount' và 'creditAmount')
        totalCredits: credits.reduce((sum, c) => sum + (Number(c.amount || c.creditAmount) || 0), 0),
        // Giá trị ước tính ($10/credit nếu chưa có giá)
        totalValue: credits.reduce((sum, c) => {
            const amount = Number(c.amount || c.creditAmount) || 0;
            const price = Number(c.price || c.estimatedValue) || 10;
            return sum + (amount * price);
        }, 0)
    };

    // --- Render trạng thái Loading ---
    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

    // --- Render trạng thái Lỗi ---
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 p-4 text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4"><XCircle className="h-12 w-12 text-red-500" /></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
                <p className="text-gray-600 mb-6 max-w-md">{error}</p>
                <button onClick={() => window.location.reload()} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Leaf className="h-6 w-6 text-emerald-600" />
                        Verified Credits
                    </h1>
                    <p className="text-gray-500 mt-1">Manage and track verified carbon credits issuance.</p>
                </div>

                
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Credits */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Credits Issued</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCredits.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg"><Leaf className="h-5 w-5 text-emerald-600" /></div>
                    </div>
                </div>

                {/* Verified Count */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Certificates</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.verified}</p>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg"><CheckCircle className="h-5 w-5 text-emerald-600" /></div>
                    </div>
                </div>

                {/* Listed Count */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Listed for Sale</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.listed}</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg"><MapPin className="h-5 w-5 text-blue-600" /></div>
                    </div>
                </div>

                {/* Estimated Value */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Market Value (Est.)</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">${stats.totalValue.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded-lg"><DollarSign className="h-5 w-5 text-yellow-600" /></div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by owner name or credit ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredCredits.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Search className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-lg font-medium">No matching credits found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Issued Date</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCredits.map((credit) => {
                                    // Logic lấy tên hiển thị từ owner object (backend trả về owner là UserDTO)
                                    const displayName = credit.owner?.fullName || credit.owner?.username || 'Unknown User';

                                    return (
                                        <tr key={credit.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm mr-3 shadow-sm">
                                                        {displayName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {displayName}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono" title={credit.id}>
                                                            ID: {credit.id.substring(0, 8)}...
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-bold">
                                                    {Number(credit.amount || credit.creditAmount || 0).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-500">credits</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={credit.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} />
                                                    {new Date(credit.createdAt).toLocaleDateString('en-US')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={async () => {
                                                        setSelectedCredit(credit);
                                                        setShowDetailModal(true);
                                                        setOwnerDetails(null);

                                                        // Fetch owner details nếu có userId
                                                        if (credit.owner?.id) {
                                                            try {
                                                                setLoadingOwner(true);
                                                                const userData = await userApi.getUserById(credit.owner.id);
                                                                setOwnerDetails(userData);
                                                            } catch (err) {
                                                                console.error('Failed to fetch owner details:', err);
                                                            } finally {
                                                                setLoadingOwner(false);
                                                            }
                                                        }
                                                    }}
                                                    className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                                                >
                                                    <Eye size={14} /> Detail
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Info */}
            {filteredCredits.length > 0 && (
                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-medium">{filteredCredits.length}</span> of <span className="font-medium">{credits.length}</span> credits
                    </div>
                    {/* Nút phân trang có thể thêm ở đây sau này */}
                </div>
            )}

            {/* Modal Chi Tiết Credit */}
            {showDetailModal && selectedCredit && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-emerald-50 to-green-50">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Leaf className="w-6 h-6 text-emerald-600" />
                                    Carbon Credit Details
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Certificate Information</p>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content (Scrollable) */}
                        <div className="p-6 overflow-y-auto bg-gray-50 space-y-6">

                            {/* Credit Summary - Green Box */}
                            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                                <h4 className="text-emerald-800 font-semibold mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Credit Summary
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-emerald-600 mb-1">Credit Amount</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {Number(selectedCredit.creditAmount || selectedCredit.amount || 0).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Carbon Credits</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-emerald-600 mb-1">CO2 Reduced</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {Number(selectedCredit.co2ReducedKg || 0).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">kg CO2</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-emerald-600 mb-1">Status</p>
                                        <StatusBadge status={selectedCredit.status} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-emerald-600 mb-1">Credit ID</p>
                                        <p className="font-mono text-xs text-gray-600 bg-white p-2 rounded border border-emerald-100 truncate" title={selectedCredit.id}>
                                            {selectedCredit.id}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Owner Information */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <h4 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    Owner Information
                                    {loadingOwner && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1 uppercase">Full Name</p>
                                        <p className="font-medium text-gray-900">
                                            {loadingOwner ? (
                                                <span className="text-gray-400">Loading...</span>
                                            ) : (
                                                ownerDetails?.fullName || selectedCredit.owner?.fullName || 'N/A'
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1 uppercase">Username</p>
                                        <p className="font-medium text-gray-900">
                                            {ownerDetails?.username || selectedCredit.owner?.username || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1 uppercase">Email</p>
                                        <p className="font-medium text-gray-900 text-sm">
                                            {loadingOwner ? (
                                                <span className="text-gray-400">Loading...</span>
                                            ) : (
                                                ownerDetails?.email || selectedCredit.owner?.email || 'N/A'
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1 uppercase">Role</p>
                                        <span className="inline-block px-2 py-1 bg-blue-50 text-green-700 text-xs font-medium rounded">
                                            {ownerDetails?.role || selectedCredit.owner?.role || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-500 mb-1 uppercase">User ID</p>
                                        <p className="font-mono text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 truncate" title={ownerDetails?.id || selectedCredit.owner?.id}>
                                            {ownerDetails?.id || selectedCredit.owner?.id || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Verification & Dates */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <h4 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    Timeline & Verification
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Created At</p>
                                            <p className="font-medium text-gray-900 mt-1">
                                                {selectedCredit.createdAt ? new Date(selectedCredit.createdAt).toLocaleString('en-US', {
                                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                }) : 'N/A'}
                                            </p>
                                        </div>
                                        <Clock className="w-5 h-5 text-gray-400" />
                                    </div>

                                    {selectedCredit.verifiedAt && (
                                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Verified At</p>
                                                <p className="font-medium text-gray-900 mt-1">
                                                    {new Date(selectedCredit.verifiedAt).toLocaleString('en-US', {
                                                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        </div>
                                    )}

                                    {selectedCredit.verifiedByUsername && (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Verified By</p>
                                                <p className="font-medium text-gray-900 mt-1">
                                                    {selectedCredit.verifiedByUsername}
                                                </p>
                                                {selectedCredit.verifiedById && (
                                                    <p className="font-mono text-xs text-gray-400 mt-1" title={selectedCredit.verifiedById}>
                                                        ID: {selectedCredit.verifiedById.substring(0, 8)}...
                                                    </p>
                                                )}
                                            </div>
                                            <User className="w-5 h-5 text-blue-500" />
                                        </div>
                                    )}

                                    {selectedCredit.journeyId && (
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Journey ID</p>
                                                <p className="font-mono text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 mt-1 truncate" title={selectedCredit.journeyId}>
                                                    {selectedCredit.journeyId}
                                                </p>
                                            </div>
                                            <MapPin className="w-5 h-5 text-purple-500" />
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t bg-white flex justify-end">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifiedCredits;