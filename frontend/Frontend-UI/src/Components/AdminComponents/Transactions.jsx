import React, { useState, useEffect, useCallback } from 'react';
import { transactionApi } from '../../api/transactionApi';
import {
    TrendingUp,
    DollarSign,
    Activity,
    Calendar,
    BarChart3,
    RefreshCw,
    Download,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Helper Components ---

/**
 * StatCard: Card hiển thị thống kê
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
 * DateRangeFilter: Component chọn khoảng thời gian
 */
const DateRangeFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange, onApply, onReset }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">From:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">To:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button
                    onClick={onApply}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Apply Filter
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

/**
 * DetailSection: Hiển thị chi tiết thống kê
 */
// eslint-disable-next-line no-unused-vars
const DetailSection = ({ title, data, icon: Icon }) => {
    if (!data || Object.keys(data).length === 0) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
                <Icon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            </div>
            <div className="space-y-3">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm font-medium text-gray-600 capitalize">
                            {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                            {typeof value === 'number'
                                ? key.toLowerCase().includes('amount') || key.toLowerCase().includes('total') || key.toLowerCase().includes('revenue')
                                    ? `$${Number(value).toLocaleString()}`
                                    : Number(value).toLocaleString()
                                : String(value) || 'N/A'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const TransactionManagement = () => {
    const [statistics, setStatistics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Date filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [appliedStartDate, setAppliedStartDate] = useState('');
    const [appliedEndDate, setAppliedEndDate] = useState('');

    // Hàm tải dữ liệu thống kê
    const fetchStatistics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Chuyển đổi date string sang ISO datetime format chỉ khi có giá trị
            let formattedStartDate = undefined;
            let formattedEndDate = undefined;

            if (appliedStartDate && appliedStartDate.trim() !== '') {
                const startDateTime = new Date(appliedStartDate);
                if (!isNaN(startDateTime.getTime())) {
                    startDateTime.setHours(0, 0, 0, 0);
                    formattedStartDate = startDateTime.toISOString().slice(0, -5); // Remove 'Z'
                }
            }

            if (appliedEndDate && appliedEndDate.trim() !== '') {
                const endDateTime = new Date(appliedEndDate);
                if (!isNaN(endDateTime.getTime())) {
                    endDateTime.setHours(23, 59, 59, 999);
                    formattedEndDate = endDateTime.toISOString().slice(0, -5); // Remove 'Z'
                }
            }

            console.log('Fetching statistics with dates:', {
                original: { appliedStartDate, appliedEndDate },
                formatted: { formattedStartDate, formattedEndDate }
            });

            const response = await transactionApi.getTransactionStatistics(
                formattedStartDate,
                formattedEndDate
            );

            console.log('Statistics response:', response);

            // Validate response is an object
            if (response && typeof response === 'object' && !Array.isArray(response)) {
                setStatistics(response);
                toast.success('Statistics loaded successfully!');
            } else {
                console.error("Invalid response format:", response);
                setError('Received invalid data format from server.');
                toast.error('Invalid data format received.');
                setStatistics(null);
            }
        } catch (err) {
            console.error("Failed to fetch transaction statistics:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch transaction statistics.';
            setError(errorMessage);
            toast.error(`Error: ${errorMessage}`);
            setStatistics(null);
        } finally {
            setIsLoading(false);
        }
    }, [appliedStartDate, appliedEndDate]);

    // Effect để tải dữ liệu lần đầu
    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    // Xử lý apply filter
    const handleApplyFilter = () => {
        if (startDate && endDate && startDate > endDate) {
            toast.error('Start date cannot be after end date!');
            return;
        }
        setAppliedStartDate(startDate);
        setAppliedEndDate(endDate);
        toast.info('Applying filter...');
    };

    // Xử lý reset filter
    const handleResetFilter = () => {
        setStartDate('');
        setEndDate('');
        setAppliedStartDate('');
        setAppliedEndDate('');
        toast.info('Filter reset');
    };

    // Xuất báo cáo (placeholder)
    const handleExportReport = () => {
        toast.info('Export functionality coming soon!');
    };

    // Parse statistics data with safe fallbacks (support both camelCase and snake_case)
    const totalTransactions = Number(statistics?.totalTransactions || statistics?.total_transactions) || 0;
    const completedTransactions = Number(statistics?.completedTransactions || statistics?.completed_transactions) || 0;
    const pendingTransactions = Number(statistics?.pendingTransactions || statistics?.pending_transactions) || 0;
    const cancelledTransactions = Number(statistics?.cancelledTransactions || statistics?.cancelled_transactions) || 0;
    const totalRevenue = Number(statistics?.totalRevenue || statistics?.total_revenue) || 0;
    const averageTransactionValue = Number(statistics?.averageTransactionValue || statistics?.average_transaction_value) || 0;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <BarChart3 className="h-8 w-8 text-blue-600" />
                            Transaction Management
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Monitor and analyze all platform transactions
                        </p>
                    </div>
                    <button
                        onClick={handleExportReport}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download className="h-5 w-5" />
                        Export Report
                    </button>
                </div>
            </header>

            {/* Date Range Filter */}
            <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onApply={handleApplyFilter}
                onReset={handleResetFilter}
            />

            {/* Loading / Error States */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading transaction statistics...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Statistics</h3>
                    <p className="text-red-600 font-medium mb-4">{error}</p>
                    <div className="text-sm text-red-500 mb-4">
                        <p>Possible reasons:</p>
                        <ul className="list-disc list-inside mt-2 text-left max-w-md mx-auto">
                            <li>Backend server is not running</li>
                            <li>Network connection issue</li>
                            <li>Authentication required</li>
                            <li>API endpoint not accessible</li>
                        </ul>
                    </div>
                    <button
                        onClick={fetchStatistics}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Retry
                    </button>
                </div>
            ) : statistics === null ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <Activity className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Data Available</h3>
                    <p className="text-yellow-600">No transaction statistics found. Please check if:</p>
                    <ul className="list-disc list-inside mt-2 text-yellow-600">
                        <li>Backend server is running</li>
                        <li>You have admin permissions</li>
                        <li>Transactions exist in the database</li>
                    </ul>
                </div>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <StatCard
                            title="Total Transactions"
                            value={totalTransactions.toLocaleString()}
                            icon={Activity}
                            bgColor="bg-blue-50"
                            textColor="text-blue-600"
                            subtitle="All time transactions"
                        />
                        <StatCard
                            title="Total Revenue"
                            value={`$${totalRevenue.toLocaleString()}`}
                            icon={DollarSign}
                            bgColor="bg-green-50"
                            textColor="text-green-600"
                            subtitle="Platform revenue"
                        />
                        <StatCard
                            title="Average Transaction"
                            value={`$${averageTransactionValue.toLocaleString()}`}
                            icon={TrendingUp}
                            bgColor="bg-purple-50"
                            textColor="text-purple-600"
                            subtitle="Per transaction"
                        />
                    </div>

                    {/* Transaction Status Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <StatCard
                            title="Completed"
                            value={completedTransactions.toLocaleString()}
                            icon={CheckCircle}
                            bgColor="bg-green-50"
                            textColor="text-green-600"
                            subtitle={`${totalTransactions > 0 ? ((completedTransactions / totalTransactions) * 100).toFixed(1) : 0}% success rate`}
                        />
                        <StatCard
                            title="Pending"
                            value={pendingTransactions.toLocaleString()}
                            icon={Clock}
                            bgColor="bg-yellow-50"
                            textColor="text-yellow-600"
                            subtitle="Awaiting completion"
                        />
                        <StatCard
                            title="Cancelled"
                            value={cancelledTransactions.toLocaleString()}
                            icon={XCircle}
                            bgColor="bg-red-50"
                            textColor="text-red-600"
                            subtitle="Failed transactions"
                        />
                    </div>

                    {/* Detailed Statistics */}
                    {statistics && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DetailSection
                                title="Transaction Details"
                                data={{
                                    total_transactions: totalTransactions,
                                    completed_transactions: completedTransactions,
                                    pending_transactions: pendingTransactions,
                                    cancelled_transactions: cancelledTransactions,
                                    success_rate: `${totalTransactions > 0 ? ((completedTransactions / totalTransactions) * 100).toFixed(2) : 0}%`,
                                    dispute_rate: `${statistics?.disputeRate || 0}%`
                                }}
                                icon={BarChart3}
                            />
                            <DetailSection
                                title="Revenue Analytics"
                                data={{
                                    total_revenue: `$${totalRevenue.toLocaleString()}`,
                                    average_transaction_value: `$${averageTransactionValue.toLocaleString()}`,
                                    estimated_platform_fee: `$${(totalRevenue * 0.05).toLocaleString()}`,
                                }}
                                icon={DollarSign}
                            />
                        </div>
                    )}


                </>
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

export default TransactionManagement;