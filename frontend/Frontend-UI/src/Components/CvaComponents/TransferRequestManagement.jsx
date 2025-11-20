import React, { useState, useEffect } from 'react';
import {
    ArrowRightLeft,
    User,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    Leaf,
    AlertTriangle,
    FileText,
    TrendingUp,
    Search,
    Filter
} from 'lucide-react';
import { cvaApi } from '../../api';

const TransferRequestManagement = () => {
    const [loading, setLoading] = useState(true);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [approvalNotes, setApprovalNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [statistics, setStatistics] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [requests, stats] = await Promise.all([
                cvaApi.getPendingTransferRequests(),
                cvaApi.getTransferRequestStatistics()
            ]);

            setPendingRequests(requests);
            setStatistics(stats);
        } catch (error) {
            console.error('Failed to fetch transfer requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async () => {
        if (!selectedRequest) return;

        try {
            setProcessingId(selectedRequest.id);

            await cvaApi.approveTransferRequest(selectedRequest.id, approvalNotes);

            alert('Transfer request approved successfully!');
            setShowApprovalModal(false);
            setApprovalNotes('');
            setSelectedRequest(null);
            await fetchData();
        } catch (error) {
            console.error('Failed to approve transfer request:', error);
            alert('Failed to approve transfer request. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejection = async () => {
        if (!selectedRequest || !rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            setProcessingId(selectedRequest.id);

            await cvaApi.rejectTransferRequest(selectedRequest.id, rejectionReason);

            alert('Transfer request rejected and CO2 refunded to user!');
            setShowRejectionModal(false);
            setRejectionReason('');
            setSelectedRequest(null);
            await fetchData();
        } catch (error) {
            console.error('Failed to reject transfer request:', error);
            alert('Failed to reject transfer request. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header and Statistics */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                CO2 Transfer Requests
                            </h2>
                            <p className="text-gray-600 mt-1">
                                Review and approve CO2 to credit conversion requests
                            </p>
                        </div>
                        <button
                            onClick={fetchData}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                        >
                            <TrendingUp className="w-4 h-4" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-900">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-700">
                                        {statistics.pendingTransfers || 0}
                                    </p>
                                </div>
                                <Clock className="w-8 h-8 text-yellow-600" />
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-900">Approved</p>
                                    <p className="text-2xl font-bold text-green-700">
                                        {statistics.approvedTransfers || 0}
                                    </p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-red-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-900">Rejected</p>
                                    <p className="text-2xl font-bold text-red-700">
                                        {statistics.rejectedTransfers || 0}
                                    </p>
                                </div>
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Approval Rate</p>
                                    <p className="text-2xl font-bold text-blue-700">
                                        {statistics.transferApprovalRate ?
                                            `${statistics.transferApprovalRate.toFixed(1)}%` :
                                            '0%'
                                        }
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Requests List */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Pending Transfer Requests ({pendingRequests.length})
                    </h3>
                </div>

                <div className="p-6">
                    {pendingRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <ArrowRightLeft className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No Pending Transfer Requests
                            </h3>
                            <p className="text-gray-500">
                                All transfer requests have been processed
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingRequests.map((request) => (
                                <div key={request.id} className="border rounded-lg p-6 hover:bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                    <span className="font-medium text-gray-900">
                                                        {request.username}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-600">
                                                        {formatDate(request.createdAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-6 mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <Leaf className="w-5 h-5 text-green-600" />
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        {request.co2Amount.toLocaleString()} kg CO2
                                                    </span>
                                                </div>
                                                <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                                                <div className="flex items-center space-x-2">
                                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        {request.creditsToGenerate} Credits
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-600">
                                                Conversion rate: 1,000 kg CO2 = 1 Credit
                                            </div>
                                        </div>

                                        <div className="flex space-x-3 ml-6">
                                            <button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowApprovalModal(true);
                                                }}
                                                disabled={processingId === request.id}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Approve</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowRejectionModal(true);
                                                }}
                                                disabled={processingId === request.id}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center space-x-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                <span>Reject</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Approval Modal */}
            {showApprovalModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold mb-4">Approve Transfer Request</h3>

                        <div className="mb-4 p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">Transfer Details:</h4>
                            <p className="text-sm text-green-800">
                                User: <strong>{selectedRequest.username}</strong><br/>
                                CO2 Amount: <strong>{selectedRequest.co2Amount.toLocaleString()} kg</strong><br/>
                                Credits to Generate: <strong>{selectedRequest.creditsToGenerate}</strong>
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Approval Notes (Optional)
                            </label>
                            <textarea
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Add any notes about this approval..."
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowApprovalModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApproval}
                                disabled={processingId === selectedRequest.id}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {processingId === selectedRequest.id ? 'Processing...' : 'Approve'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectionModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold mb-4">Reject Transfer Request</h3>

                        <div className="mb-4 p-4 bg-red-50 rounded-lg">
                            <h4 className="font-medium text-red-900 mb-2">Transfer Details:</h4>
                            <p className="text-sm text-red-800">
                                User: <strong>{selectedRequest.username}</strong><br/>
                                CO2 Amount: <strong>{selectedRequest.co2Amount.toLocaleString()} kg</strong><br/>
                                Credits to Generate: <strong>{selectedRequest.creditsToGenerate}</strong>
                            </p>
                        </div>

                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> Rejecting will refund the CO2 back to the user's available balance.
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Please provide a clear reason for rejection..."
                                required
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowRejectionModal(false);
                                    setRejectionReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejection}
                                disabled={processingId === selectedRequest.id || !rejectionReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                            >
                                {processingId === selectedRequest.id ? 'Processing...' : 'Reject & Refund'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransferRequestManagement;
