import React, { useState, useEffect } from 'react';
import { transactionApi } from '../../api/transactionApi';
import { Activity, RefreshCw, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TransactionManagement = () => {
    const [statistics, setStatistics] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

    // Fetch statistics
    const fetchStatistics = async () => {
        setIsLoading(true);
        try {
            const response = await transactionApi.getTransactionStatistics();
            if (response && typeof response === 'object') {
                setStatistics(response);
            }
        } catch (err) {
            console.error("Failed to fetch statistics:", err);
            toast.error('Failed to load statistics');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch all transactions using admin endpoint
    const fetchTransactions = async () => {
        console.log('🔍 fetchTransactions called - using ADMIN endpoint');
        setIsLoadingTransactions(true);
        try {
            console.log('🔍 Calling transactionApi.getAllTransactions...');
            const response = await transactionApi.getAllTransactions(0, 100);
            console.log('📦 Raw Transactions Response:', response);

            // Handle ApiResponse wrapper format: { success, message, data }
            let transactionsData = null;

            if (response?.data) {
                // If response has data property (ApiResponse format)
                if (response.data.content) {
                    // Paginated response
                    transactionsData = response.data.content;
                } else if (Array.isArray(response.data)) {
                    // Direct array
                    transactionsData = response.data;
                } else {
                    transactionsData = response.data;
                }
            } else if (response?.content) {
                // Direct Page object
                transactionsData = response.content;
            } else if (Array.isArray(response)) {
                // Direct array
                transactionsData = response;
            }

            console.log('✅ Extracted transactions:', transactionsData);

            if (transactionsData && Array.isArray(transactionsData)) {
                setTransactions(transactionsData);
                toast.success(`Loaded ${transactionsData.length} transactions`);
            } else {
                console.warn('⚠️ No valid transaction data found');
                setTransactions([]);
            }
        } catch (err) {
            console.error("❌ Failed to fetch transactions:", err);
            console.error("❌ Error details:", err.response?.data);
            toast.error('Failed to load transaction history');
            setTransactions([]);
        } finally {
            setIsLoadingTransactions(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
        fetchTransactions();
    }, []);

    // Log transactions state
    useEffect(() => {
        console.log('📊 Transactions state updated:', transactions);
        console.log('📊 Number of transactions:', transactions.length);
    }, [transactions]);

    // Parse data with improved calculations
    const totalTransactions = Number(statistics?.totalTransactions || statistics?.total_transactions) || 0;
    const completedTransactions = Number(statistics?.completedTransactions || statistics?.completed_transactions) || 0;
    const pendingTransactions = Number(statistics?.pendingTransactions || statistics?.pending_transactions) || 0;
    const processingTransactions = Number(statistics?.processingTransactions || statistics?.processing_transactions) || 0;
    const disputedTransactions = Number(statistics?.disputedTransactions || statistics?.disputed_transactions) || 0;
    const cancelledTransactions = Number(statistics?.cancelledTransactions || statistics?.cancelled_transactions) || 0;

    // Revenue calculations - handle both BigDecimal and number formats
    const totalRevenue = Number(statistics?.totalRevenue || statistics?.total_revenue || 0);
    const averageTransactionValue = Number(statistics?.averageTransactionValue || statistics?.average_transaction_value || 0);

    // Calculate additional metrics from transaction data if backend values are 0
    const calculatedRevenue = transactions.length > 0 && totalRevenue === 0
        ? transactions
            .filter(t => t.status === 'COMPLETED')
            .reduce((sum, t) => sum + Number(t.amount || t.totalPrice || 0), 0)
        : totalRevenue;

    const calculatedAverage = transactions.length > 0 && averageTransactionValue === 0
        ? calculatedRevenue / Math.max(completedTransactions, 1)
        : averageTransactionValue;

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            'COMPLETED': { bg: 'bg-green-100', text: 'text-green-700', label: 'COMPLETED' },
            'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'PENDING' },
            'PROCESSING': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'PROCESSING' },
            'CANCELLED': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'CANCELLED' },
            'DISPUTED': { bg: 'bg-red-100', text: 'text-red-700', label: 'DISPUTED' }
        };
        const config = statusConfig[status] || statusConfig['PENDING'];
        return (
            <span className={`px-3 py-1 rounded text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    // Get payment method badge
    const getPaymentBadge = (method) => {
        const methodConfig = {
            'WALLET': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'WALLET' },
            'VNPAY': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'VNPAY' },
            'MOMO': { bg: 'bg-pink-100', text: 'text-pink-700', label: 'MOMO' }
        };
        const config = methodConfig[method] || { bg: 'bg-gray-100', text: 'text-gray-700', label: method };
        return (
            <span className={`px-3 py-1 rounded text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transaction Statistics</h1>
                    <p className="text-sm text-gray-500 mt-1">Overview of platform transactions</p>
                </div>
                <button
                    onClick={fetchStatistics}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
            ) : !statistics ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                    <Activity className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                    <p className="text-yellow-800 font-medium">No data available</p>
                </div>
            ) : (
                <>
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Total Transactions */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Transactions</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalTransactions.toLocaleString()}</p>
                                </div>
                                <Activity className="h-10 w-10 text-blue-600" />
                            </div>
                        </div>

                        {/* Total Revenue */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Revenue</p>
                                    <p className="text-3xl font-bold text-green-600 mt-1">
                                        ${calculatedRevenue.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        From {completedTransactions} completed transactions
                                    </p>
                                </div>
                                <DollarSign className="h-10 w-10 text-green-600" />
                            </div>
                        </div>

                        {/* Average Value */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Average Transaction Value</p>
                                    <p className="text-3xl font-bold text-purple-600 mt-1">
                                        ${calculatedAverage.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Average per completed transaction
                                    </p>
                                </div>
                                <DollarSign className="h-10 w-10 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Status Breakdown</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Completed */}
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                                <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-green-700">Completed</p>
                                    <p className="text-2xl font-bold text-green-900">{completedTransactions.toLocaleString()}</p>
                                    <p className="text-xs text-green-600 mt-1">
                                        {totalTransactions > 0 ? ((completedTransactions / totalTransactions) * 100).toFixed(1) : 0}% success
                                    </p>
                                </div>
                            </div>

                            {/* Pending */}
                            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                                <Clock className="h-8 w-8 text-yellow-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-yellow-700">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-900">{pendingTransactions.toLocaleString()}</p>
                                    <p className="text-xs text-yellow-600 mt-1">
                                        {totalTransactions > 0 ? ((pendingTransactions / totalTransactions) * 100).toFixed(1) : 0}% pending
                                    </p>
                                </div>
                            </div>

                            {/* Processing */}
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                                <Activity className="h-8 w-8 text-blue-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-blue-700">Processing</p>
                                    <p className="text-2xl font-bold text-blue-900">{processingTransactions.toLocaleString()}</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        {totalTransactions > 0 ? ((processingTransactions / totalTransactions) * 100).toFixed(1) : 0}% processing
                                    </p>
                                </div>
                            </div>

                            {/* Cancelled */}
                            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                                <XCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-red-700">Cancelled</p>
                                    <p className="text-2xl font-bold text-red-900">{cancelledTransactions.toLocaleString()}</p>
                                    <p className="text-xs text-red-600 mt-1">
                                        {totalTransactions > 0 ? ((cancelledTransactions / totalTransactions) * 100).toFixed(1) : 0}% failed
                                    </p>
                                </div>
                            </div>

                            {/* Disputed (only show if there are disputed transactions) */}
                            {disputedTransactions > 0 && (
                                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg lg:col-span-4">
                                    <XCircle className="h-8 w-8 text-orange-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-orange-700">⚠️ Disputed - Needs Review</p>
                                        <p className="text-2xl font-bold text-orange-900">{disputedTransactions.toLocaleString()}</p>
                                        <p className="text-xs text-orange-600 mt-1">
                                            {totalTransactions > 0 ? ((disputedTransactions / totalTransactions) * 100).toFixed(1) : 0}% disputed - requires admin attention
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transaction History List */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
                                <p className="text-sm text-gray-500">{transactions.length} transactions</p>
                            </div>
                            <button
                                onClick={fetchTransactions}
                                disabled={isLoadingTransactions}
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        {isLoadingTransactions ? (
                            <div className="text-center py-8">
                                <RefreshCw className="h-6 w-6 text-blue-600 animate-spin mx-auto" />
                                <p className="text-sm text-gray-500 mt-2">Loading transactions...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium mb-1">No transactions found</p>
                                <p className="text-sm">
                                    {totalTransactions > 0
                                        ? 'Transactions exist but may not be accessible with current permissions'
                                        : 'No transactions have been created yet'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                {/* Icon */}
                                                <div className="bg-gray-100 rounded-full p-2 mt-1">
                                                    <Activity className="h-5 w-5 text-gray-600" />
                                                </div>

                                                {/* Transaction Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-gray-900">Transaction</h3>
                                                        {getStatusBadge(transaction.status)}
                                                        {getPaymentBadge(transaction.paymentMethod)}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-1">Transaction</p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(transaction.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Amount */}
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-gray-900">
                                                    ${Number(transaction.totalPrice || transaction.amount || 0).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
};

export default TransactionManagement;