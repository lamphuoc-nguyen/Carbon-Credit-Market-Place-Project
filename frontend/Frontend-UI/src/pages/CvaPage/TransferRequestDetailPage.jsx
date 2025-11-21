import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User, Calendar, CheckCircle, XCircle, Clock,
    Leaf, TrendingUp, MapPin, Car, Hash, AlertCircle
} from 'lucide-react';
import { cvaApi } from '../../api/cvaApi';
import { vehicleApi } from '../../api/vehicleApi';
import { userApi } from '../../api/userApi';

const TransferRequestDetailPage = () => {
    const { id } = useParams(); // Sửa từ requestId thành id
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [request, setRequest] = useState(null);
    const [userVehicles, setUserVehicles] = useState([]);
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState(null);

    // State for approval/rejection
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [approvalNotes, setApprovalNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchRequestDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Looking for id:', id);

            // Fetch all pending requests and find the one we need
            const pendingRequests = await cvaApi.getPendingTransferRequests();
            console.log('Pending requests:', pendingRequests);
            console.log('Request IDs:', pendingRequests.map(r => r.id));

            const foundRequest = pendingRequests.find(req => req.id === id);
            console.log('Found request:', foundRequest);

            if (!foundRequest) {
                setError('Transfer request not found');
                return;
            }

            setRequest(foundRequest);

            // Fetch user details and vehicles if userId is available
            if (foundRequest.userId) {
                try {
                    // Fetch user details
                    const userInfo = await userApi.getUserById(foundRequest.userId);
                    setUserDetails(userInfo);

                    // Fetch user vehicles
                    const vehicles = await vehicleApi.getVehiclesByUserId(foundRequest.userId);
                    setUserVehicles(Array.isArray(vehicles) ? vehicles : []);
                } catch (err) {
                    console.error('Could not fetch user details or vehicles:', err);
                    setUserVehicles([]);
                }
            }
        } catch (err) {
            console.error('Error fetching request detail:', err);
            setError(err.message || 'Failed to load request details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequestDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleApprove = async () => {
        if (!request) return;
        try {
            setProcessing(true);
            await cvaApi.approveTransferRequest(request.id, approvalNotes);
            alert('Request approved successfully!');
            navigate('/cva/transfer-requests');
        } catch (error) {
            alert('Failed to approve: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!request || !rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }
        try {
            setProcessing(true);
            await cvaApi.rejectTransferRequest(request.id, rejectionReason);
            alert('Request rejected successfully!');
            navigate('/cva/transfer-requests');
        } catch (error) {
            alert('Failed to reject: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Clock className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading request details...</p>
                </div>
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error || 'Request not found'}</p>
                    <button
                        onClick={() => navigate('/cva/transfer-requests')}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                        Back to List
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/cva/transfer-requests')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Transfer Requests</span>
                    </button>
                </div>

                {/* Page Title */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Transfer Request Details</h1>
                    <p className="text-gray-500">Review and process CO2 to Credit conversion request</p>
                </div>

                {/* Request Summary - Blue Box */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                    <h2 className="text-blue-800 font-semibold mb-4 text-sm uppercase tracking-wide">Request Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-blue-600 mb-1">CO2 Amount</p>
                            <p className="text-3xl font-bold text-gray-900">{request.co2Amount?.toLocaleString()} kg</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 mb-1">Credits to Generate</p>
                            <p className="text-3xl font-bold text-gray-900">{request.creditsToGenerate}</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 mb-1">Request Date</p>
                            <p className="font-medium text-gray-900 text-sm mt-2">{formatDate(request.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 mb-1">Status</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 mt-1">
                                <Clock className="w-4 h-4 mr-1" />
                                {request.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* User Information */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-500" />
                        User Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs text-gray-500 mb-1 uppercase">Username</p>
                            <p className="font-medium text-gray-900">{request.username || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1 uppercase">Requester Name</p>
                            <p className="font-medium text-gray-900">{userDetails?.fullName || userDetails?.email || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs text-gray-500 mb-1 uppercase">User ID</p>
                            <p className="font-mono text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 truncate" title={request.userId}>
                                {request.userId || 'N/A'}
                            </p>
                        </div>
                        {(request.userCurrentCo2Balance !== undefined || request.userCurrentCreditBalance !== undefined) && (
                            <div className="col-span-2 pt-3 border-t border-gray-100">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Wallet Balance</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                        <p className="text-xs text-green-600 mb-1">Current CO2</p>
                                        <p className="text-2xl font-bold text-gray-900">{request.userCurrentCo2Balance?.toLocaleString() || 0} kg</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <p className="text-xs text-blue-600 mb-1">Current Credits</p>
                                        <p className="text-2xl font-bold text-gray-900">{request.userCurrentCreditBalance || 0}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* User's Vehicles */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-gray-900 font-semibold mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Car className="w-5 h-5 text-gray-500" />
                            User's Vehicles
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">{userVehicles.length}</span>
                    </h2>

                    {userVehicles.length > 0 ? (
                        <div className="space-y-3">
                            {userVehicles.map((v, idx) => (
                                <div key={idx} className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                    <div className="p-2 bg-white rounded shadow-sm mr-3">
                                        <Car className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800">{v.model || 'Unknown Model'}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs text-gray-500 flex items-center bg-white px-2 py-1 rounded border border-gray-200">
                                                <Hash className="w-3 h-3 mr-1" /> {v.vin}
                                            </span>
                                            {v.licensePlate && (
                                                <span className="text-xs font-mono bg-yellow-50 px-2 py-1 rounded border border-yellow-200 text-yellow-800">
                                                    {v.licensePlate}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <Car className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">User has no registered vehicles.</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-gray-900 font-semibold mb-4">CVA Decision</h2>
                    <p className="text-sm text-gray-600 mb-6">Review the information above and make a decision on this transfer request.</p>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowRejectionModal(true)}
                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <XCircle className="w-5 h-5" />
                            Reject Request
                        </button>
                        <button
                            onClick={() => setShowApprovalModal(true)}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Approve Request
                        </button>
                    </div>
                </div>

            </div>

            {/* Approval Modal */}
            {showApprovalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Approve Transfer Request
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            This will convert <span className="font-bold text-gray-900">{request.co2Amount?.toLocaleString()} kg CO2</span> into{' '}
                            <span className="font-bold text-gray-900">{request.creditsToGenerate} Credits</span> for the user.
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
                                onClick={() => setShowApprovalModal(false)}
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
            {showRejectionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                                onClick={() => setShowRejectionModal(false)}
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
        </div>
    );
};

export default TransferRequestDetailPage;
