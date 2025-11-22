import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Clock, CheckCircle, TrendingUp, XCircle, Shield, ArrowRightLeft,
    BarChart as ChartIcon
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

// Import API services
import { cvaApi } from '../../api/cvaApi';
// import { carbonCreditApi } from '../../api/carbonCreditApi'; // Có thể không cần nếu CVA chỉ duyệt Transfer

// --- HELPER COMPONENTS ---

const RenderIcon = ({ name, className }) => {
    switch (name) {
        case 'Clock': return <Clock className={className} />;
        case 'CheckCircle': return <CheckCircle className={className} />;
        case 'TrendingUp': return <TrendingUp className={className} />;
        case 'ArrowRightLeft': return <ArrowRightLeft className={className} />;
        default: return <ChartIcon className={className} />;
    }
};

const StatusBadge = ({ status }) => {
    let color = 'bg-gray-100 text-gray-700 border border-gray-200';
    let text = status || 'PENDING';

    switch (status) {
        case 'PENDING':
            color = 'bg-orange-100 text-orange-700 border border-orange-200';
            text = 'Pending';
            break;
        case 'APPROVED':
        case 'VERIFIED':
            color = 'bg-green-100 text-green-700 border border-green-200';
            text = 'Approved';
            break;
        case 'REJECTED':
            color = 'bg-red-100 text-red-700 border border-red-200';
            text = 'Rejected';
            break;
        default:
            break;
    }
    return (
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md capitalize ${color}`}>
            {text}
        </span>
    );
};

// --- MOCK DATA (Cho biểu đồ - Cần thay thế bằng API thật nếu backend hỗ trợ trả về lịch sử theo tháng) ---
const chartData = [
    { name: 'Jul', verified: 45, pending: 12, rejected: 3 },
    { name: 'Aug', verified: 52, pending: 8, rejected: 8 },
    { name: 'Sep', verified: 38, pending: 15, rejected: 5 },
    { name: 'Oct', verified: 61, pending: 9, rejected: 4 },
    { name: 'Nov', verified: 48, pending: 11, rejected: 8 },
    { name: 'Dec', verified: 55, pending: 18, rejected: 2 },
];

const initialStats = [
    { name: 'Pending Requests', value: '...', trend: 'Waiting review', icon: 'Clock', iconColor: 'text-orange-500' },
    { name: 'Total Approved', value: '...', trend: 'CO2 Transfers', icon: 'CheckCircle', iconColor: 'text-green-500' },
    { name: 'Total Rejected', value: '...', trend: 'Invalid requests', icon: 'XCircle', iconColor: 'text-red-500' },
    { name: 'Accuracy Rate', value: '98.2%', trend: 'System health', icon: 'TrendingUp', iconColor: 'text-purple-500', barWidth: 'w-[98.2%]' },
];

// --- MAIN COMPONENT ---
const Dashboard = () => {

    const [pendingRequests, setPendingRequests] = useState([]);
    const [statsData, setStatsData] = useState(initialStats);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [approvalNotes, setApprovalNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // 1. Gọi API: Lấy danh sách chờ duyệt & Thống kê
            // Sử dụng cvaApi.getPendingTransferRequests thay vì carbonCreditApi
            const [pendingTransfers, transferStats] = await Promise.all([
                cvaApi.getPendingTransferRequests(),
                cvaApi.getTransferStatistics() // Đã sửa tên hàm cho đúng với cvaApi.js mới
            ]);

            // console.log("Pending Transfers:", pendingTransfers);
            // console.log("Transfer Stats:", transferStats);

            setPendingRequests(pendingTransfers);

            // 2. Cập nhật Stats Cards dựa trên dữ liệu thật từ API
            // Backend trả về: pendingTransfers, approvedTransfers, rejectedTransfers
            setStatsData(prevStats => prevStats.map(stat => {
                if (stat.name === 'Pending Requests') {
                    return {
                        ...stat,
                        value: (transferStats.pendingTransfers || pendingTransfers.length).toString(),
                        trend: 'Needs attention'
                    };
                } else if (stat.name === 'Total Approved') {
                    return {
                        ...stat,
                        value: (transferStats.approvedTransfers || 0).toString(),
                        trend: 'Successfully credited'
                    };
                } else if (stat.name === 'Total Rejected') {
                    return {
                        ...stat,
                        value: (transferStats.rejectedTransfers || 0).toString(),
                        trend: 'Returned to wallet'
                    };
                }
                return stat;
            }));

        } catch (err) {
            console.error("Failed to load dashboard data:", err);
            if (err.response?.status !== 401) {
                setError('Cannot load dashboard data.');
                setStatsData(prevStats => prevStats.map(stat => ({ ...stat, value: '-', trend: 'Error' })));
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleApprove = async () => {
        if (!selectedRequest) return;
        try {
            setProcessing(true);
            await cvaApi.approveTransferRequest(selectedRequest.id, approvalNotes);
            toast.success('Request approved successfully!');
            setShowApprovalModal(false);
            setApprovalNotes('');
            setSelectedRequest(null);
            // Refresh dashboard data
            await fetchDashboardData();
        } catch (error) {
            toast.error('Failed to approve: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }
        try {
            setProcessing(true);
            await cvaApi.rejectTransferRequest(selectedRequest.id, rejectionReason);
            toast.success('Request rejected successfully!');
            setShowRejectionModal(false);
            setRejectionReason('');
            setSelectedRequest(null);
            // Refresh dashboard data
            await fetchDashboardData();
        } catch (error) {
            toast.error('Failed to reject: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">CVA Dashboard</h1>
                <p className="text-gray-500">Manage CO2 to Credit transfer requests</p>
            </header>

            {/* 1. Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {statsData.map((stat, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between min-h-[150px]">
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-500 flex items-center">
                                {stat.name}
                            </p>
                            <div className={`p-2 rounded-full bg-opacity-10 ${stat.iconColor.replace('text-', 'bg-')}`}>
                                <RenderIcon name={stat.icon} className={`h-6 w-6 ${stat.iconColor}`} />
                            </div>
                        </div>
                        <p className={`text-4xl font-extrabold text-gray-900 mt-2 ${stat.value === 'Error' ? 'text-red-500' : ''}`}>
                            {stat.value}
                        </p>
                        {stat.name === 'Accuracy Rate' ? (
                            <div className="mt-3">
                                <p className="text-sm text-green-600 font-semibold">{stat.trend}</p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                    <div className={`bg-purple-600 h-2.5 rounded-full ${stat.barWidth}`}></div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs mt-3 text-gray-500">
                                {stat.trend}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* 2. Pending Requests & Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- Pending Transfer Requests List --- */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg flex flex-col space-y-6">
                    <div>
                        <div className="flex items-center space-x-2">
                            <Shield className="h-6 w-6 text-gray-500" />
                            <h2 className="text-xl font-semibold text-gray-800">Pending Requests</h2>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Requests to convert CO2 to Credits</p>
                    </div>

                    {isLoading && <div className="text-center text-gray-500 py-4">Loading...</div>}
                    {error && <div className="text-center text-red-500 py-4">{error}</div>}

                    {!isLoading && !error && pendingRequests.slice(0, 3).map(req => (
                        <div key={req.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    {/* Display username from request */}
                                    <p className="font-semibold text-gray-900">{req.username || 'Unknown User'}</p>
                                    <p className="text-sm text-gray-500">
                                        Request ID: <span title={req.id} className="cursor-help">{req.id?.substring(0, 8)}...</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    {/* Hiển thị lượng CO2 thay vì Amount Credit */}
                                    <p className="text-lg font-bold text-gray-900">
                                        {req.co2Amount ? req.co2Amount.toLocaleString() : 0} kg
                                    </p>
                                    <p className="text-sm text-gray-500">CO2 Reduced</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 mt-3">
                                <StatusBadge status={req.status} />
                                <span className="text-xs text-gray-400">
                                    {req.requestDate ? new Date(req.requestDate).toLocaleDateString('vi-VN') : 'Just now'}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-3 mt-4">
                                <button
                                    onClick={() => {
                                        setSelectedRequest(req);
                                        setShowRejectionModal(true);
                                    }}
                                    className="flex items-center justify-center w-1/2 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                >
                                    <XCircle className="h-4 w-4 mr-1.5" /> Reject
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedRequest(req);
                                        setShowApprovalModal(true);
                                    }}
                                    className="flex items-center justify-center w-1/2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                    <CheckCircle className="h-4 w-4 mr-1.5" /> Approve
                                </button>
                            </div>
                        </div>
                    ))}

                    {!isLoading && !error && pendingRequests.length > 3 && (
                        <Link
                            to="/cva/pending-transfer-requests" // Sửa lại route nếu cần
                            className="w-full text-center py-2 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-purple-600 font-semibold transition focus:outline-none focus:ring-2 focus:ring-purple-300"
                        >
                            See all requests ({pendingRequests.length})
                        </Link>
                    )}

                    {!isLoading && !error && pendingRequests.length === 0 && (
                        <div className="text-center text-gray-500 py-4">No pending requests found.</div>
                    )}
                </div>

                {/* --- Analytics Chart (Giữ nguyên Mock data hoặc tích hợp API nếu có) --- */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800">Verification Analytics</h2>
                    <p className="text-sm text-gray-500 mb-4">Monthly request processing</p>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
                            >
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', borderColor: '#e5e7eb' }} />
                                <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                                <Bar dataKey="verified" fill="#22c55e" name="Approved" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="pending" fill="#f97316" name="Pending" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Approval Modal */}
            {showApprovalModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Approve Transfer Request
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            This will convert <span className="font-bold text-gray-900">{selectedRequest.co2Amount?.toLocaleString()} kg CO2</span> into{' '}
                            <span className="font-bold text-gray-900">{selectedRequest.creditsToGenerate} Credits</span> for the user.
                        </p>
                        <textarea
                            className="w-full border border-gray-300 p-3 mb-4 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="Approval notes (optional)..."
                            value={approvalNotes}
                            onChange={e => setApprovalNotes(e.target.value)}
                            rows={3}
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setShowApprovalModal(false);
                                    setApprovalNotes('');
                                    setSelectedRequest(null);
                                }}
                                disabled={processing}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={processing}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Processing...' : 'Confirm Approval'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectionModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 text-red-600 flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            Reject Transfer Request
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Please provide a clear reason for rejection. The CO2 will be refunded to the user's wallet.
                        </p>
                        <textarea
                            className="w-full border border-red-300 p-3 mb-4 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-red-50"
                            placeholder="Rejection reason (required)..."
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            rows={4}
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setShowRejectionModal(false);
                                    setRejectionReason('');
                                    setSelectedRequest(null);
                                }}
                                disabled={processing}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={processing || !rejectionReason.trim()}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Processing...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default Dashboard;