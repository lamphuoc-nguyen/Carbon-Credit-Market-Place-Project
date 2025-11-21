import React, { useState, useEffect } from 'react';
import {
    ArrowRightLeft,
    Leaf,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Zap
} from 'lucide-react';
import { co2TransferApi, walletApi } from '../../api';
import userDataFetcher from '../../api/userDataFetcher';

const Co2TransferComponent = ({ onTransferComplete }) => {
    const [loading, setLoading] = useState(true);
    const [availableCo2, setAvailableCo2] = useState(0);
    const [pendingCo2, setPendingCo2] = useState(0);
    const [transferRequests, setTransferRequests] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [transferAmount, setTransferAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            console.log('🔄 CO2TransferComponent: Fetching CO2 data...');

            // Fetch CO2 balances and transfer requests
            const [available, pending, requests] = await Promise.all([
                walletApi.getAvailableCo2Balance().catch(err => {
                    console.error('❌ Failed to get available CO2:', err);
                    return 0;
                }),
                walletApi.getPendingCo2Balance().catch(err => {
                    console.error('❌ Failed to get pending CO2:', err);
                    return 0;
                }),
                co2TransferApi.getMyTransferRequests().catch(err => {
                    console.error('❌ Failed to get transfer requests:', err);
                    return [];
                })
            ]);

            console.log('✅ CO2TransferComponent: Data fetched successfully', {
                available,
                pending,
                requestCount: Array.isArray(requests) ? requests.length : 0,
                requests: requests // Added for debugging
            });

            setAvailableCo2(available);
            setPendingCo2(pending);
            setTransferRequests(Array.isArray(requests) ? requests : []);
        } catch (error) {
            console.error('Failed to fetch CO2 data:', error);
            // Set default values to prevent UI issues
            setAvailableCo2(0);
            setPendingCo2(0);
            setTransferRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTransfer = async () => {
        const amount = parseFloat(transferAmount);

        if (!transferAmount || amount < 1000) {
            alert('Minimum 1000kg CO2 required for transfer');
            return;
        }

        // Ensure amount is integer multiple of 1000
        if (amount % 1000 !== 0) {
            alert('Transfer amount must be a multiple of 1000kg (integer credits only)');
            return;
        }

        const maxTransferable = Math.floor(availableCo2 / 1000) * 1000;
        if (amount > maxTransferable) {
            alert(`Maximum transferable amount is ${maxTransferable}kg (for integer credits)`);
            return;
        }

        try {
            setSubmitting(true);

            await co2TransferApi.createTransferRequest({
                co2Amount: amount
            });

            alert(`Transfer request created successfully! ${amount}kg CO2 → ${amount / 1000} credit(s)`);
            setShowCreateModal(false);
            setTransferAmount('');
            await fetchData();

            // Call the parent refresh callback if provided
            if (onTransferComplete) {
                onTransferComplete();
            }
        } catch (error) {
            console.error('Failed to create transfer request:', error);
            alert('Failed to create transfer request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'APPROVED':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'REJECTED':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            {/* Header */}
            <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Leaf className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                CO2 Transfer
                            </h3>
                            <p className="text-sm text-gray-500">
                                Convert your CO2 reduction to tradeable credits
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        disabled={availableCo2 < 1000}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 
                            ${availableCo2 >= 1000 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                        <span>Create Transfer</span>
                    </button>
                </div>
            </div>

            {/* CO2 Balance Summary */}
            <div className="p-6 border-b">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-900">Available CO2</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {availableCo2.toLocaleString()} kg
                                </p>
                            </div>
                            <Zap className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-900">Pending Transfer</p>
                                <p className="text-2xl font-bold text-yellow-700">
                                    {pendingCo2.toLocaleString()} kg
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-900">Potential Credits</p>
                                <p className="text-2xl font-bold text-blue-700">
                                    {Math.floor(availableCo2 / 1000).toLocaleString()}
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Conversion Rate:</strong> 1,000 kg CO2 = 1 Carbon Credit
                        {availableCo2 >= 1000 && (
                            <span className="ml-2">
                                • You can create up to {Math.floor(availableCo2 / 1000)} credit(s)
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Transfer Requests History */}
            <div className="p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Transfer History</h4>

                {transferRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Leaf className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p>No transfer requests yet</p>
                        <p className="text-sm">Create your first transfer when you have 1,000kg+ CO2</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transferRequests.map((request) => (
                            <div key={request.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {getStatusIcon(request.status)}
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">
                                                    {request.co2Amount.toLocaleString()} kg CO2
                                                </span>
                                                <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium">
                                                    {request.creditsToGenerate} credits
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(request.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                        {request.status}
                                    </span>
                                </div>

                                {request.processedAt && (
                                    <div className="mt-2 pt-2 border-t text-sm">
                                        <p className="text-gray-600">
                                            Processed: {formatDate(request.processedAt)}
                                            {request.processedByUsername && (
                                                <span className="ml-2">by {request.processedByUsername}</span>
                                            )}
                                        </p>
                                        {request.cvaNotes && (
                                            <p className="text-green-600 mt-1">
                                                <strong>Notes:</strong> {request.cvaNotes}
                                            </p>
                                        )}
                                        {request.rejectionReason && (
                                            <p className="text-red-600 mt-1">
                                                <strong>Rejection Reason:</strong> {request.rejectionReason}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Transfer Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold mb-4">Create CO2 Transfer Request</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CO2 Amount (kg)
                            </label>

                            {/* Quick Select Buttons */}
                            <div className="flex space-x-2 mb-3">
                                <button
                                    onClick={() => setTransferAmount(String(Math.floor(availableCo2 / 1000) * 1000))}
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                                    disabled={availableCo2 < 1000}
                                >
                                    Max Integer ({Math.floor(availableCo2 / 1000) * 1000}kg)
                                </button>
                                {availableCo2 >= 2000 && (
                                    <button
                                        onClick={() => setTransferAmount('2000')}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                                    >
                                        2,000kg
                                    </button>
                                )}
                                {availableCo2 >= 5000 && (
                                    <button
                                        onClick={() => setTransferAmount('5000')}
                                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                                    >
                                        5,000kg
                                    </button>
                                )}
                            </div>

                            <input
                                type="number"
                                min="1000"
                                max={Math.floor(availableCo2 / 1000) * 1000}
                                step="1000"
                                value={transferAmount}
                                onChange={(e) => {
                                    // Ensure only integer thousands
                                    const value = Math.floor(parseFloat(e.target.value) / 1000) * 1000;
                                    setTransferAmount(String(value || ''));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Must be multiple of 1000"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Available: {availableCo2.toLocaleString()} kg • Maximum transferable: {Math.floor(availableCo2 / 1000) * 1000} kg
                            </p>
                        </div>

                        {transferAmount && parseFloat(transferAmount) >= 1000 && (
                            <div className="mb-4 p-3 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-800">
                                    <strong>Will generate:</strong> {Math.floor(parseFloat(transferAmount) / 1000)} carbon credit(s)
                                </p>
                            </div>
                        )}

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateTransfer}
                                disabled={
                                    submitting ||
                                    !transferAmount ||
                                    parseFloat(transferAmount) < 1000 ||
                                    parseFloat(transferAmount) % 1000 !== 0 ||
                                    parseFloat(transferAmount) > Math.floor(availableCo2 / 1000) * 1000
                                }
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Creating...' : 'Create Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Co2TransferComponent;
