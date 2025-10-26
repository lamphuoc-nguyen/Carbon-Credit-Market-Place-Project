import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cvaApi } from '../../api/cvaApi';
import LoadingOverlay from '../../Components/LoadingOverlay';
import {
    CheckCircle,
    XCircle,
    Clock,
    Percent,
    ListChecks,
    BarChart,
    TrendingUp,
    Activity,
    RefreshCcw,
    AlertCircle
} from 'lucide-react';

const Report = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    const fetchStats = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const data = await cvaApi.getCVAStatistics();
            setStats(data);
        } catch (err) {
            console.error("Error fetching CVA statistics:", err);

            if (err.response?.status === 401) {
                navigate('/login');
                return;
            }

            setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleRefresh = () => {
        fetchStats(true);
    };

    // Calculate additional metrics
    const calculateMetrics = () => {
        if (!stats) return {};

        const total = stats.totalProcessed || 0;
        const verified = stats.totalVerified || 0;
        const rejected = stats.totalRejected || 0;

        return {
            rejectionRate: total > 0 ? ((rejected / total) * 100).toFixed(1) : 0,
            avgPerDay: total > 0 ? (total / 30).toFixed(1) : 0, // Giả sử 30 ngày
            efficiency: total > 0 ? ((verified / total) * 100).toFixed(0) : 0
        };
    };

    const metrics = calculateMetrics();

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
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Statistics</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
                        <BarChart className="h-16 w-16 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Statistics Available</h3>
                    <p className="text-gray-600 mb-4">Could not retrieve CVA statistics data.</p>
                    <button
                        onClick={handleRefresh}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-8">
            {/* Header with Refresh Button */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                                <BarChart className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                Verification Reports
                            </h1>
                        </div>
                        <p className="text-gray-600 ml-14">Overview of your verification activities</p>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className={`flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg shadow-sm border border-gray-200 transition-all ${refreshing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Processed */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Processed</h3>
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                            <ListChecks className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-gray-900 mb-2">{stats.totalProcessed ?? 0}</p>
                    <div className="flex items-center gap-2 text-sm">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500">~{metrics.avgPerDay} per day</span>
                    </div>
                </div>

                {/* Approved */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-emerald-100 uppercase tracking-wide">Approved</h3>
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-white mb-2">{stats.totalVerified ?? 0}</p>
                    <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-emerald-100" />
                        <span className="text-emerald-100">Journeys verified</span>
                    </div>
                </div>

                {/* Rejected */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-rose-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Rejected</h3>
                        <div className="p-3 bg-gradient-to-br from-rose-100 to-rose-200 rounded-xl">
                            <XCircle className="h-6 w-6 text-rose-600" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-rose-600 mb-2">{stats.totalRejected ?? 0}</p>
                    <div className="flex items-center gap-2 text-sm">
                        <Percent className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500">{metrics.rejectionRate}% rejection rate</span>
                    </div>
                </div>

                {/* Pending */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending Review</h3>
                        <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                            <Clock className="h-6 w-6 text-amber-600" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-amber-600 mb-2">{stats.pendingReview ?? 0}</p>
                    <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500">System-wide pending</span>
                    </div>
                </div>
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Approval Rate Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-gray-800">Approval Rate</h3>
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Percent className="h-5 w-5 text-indigo-600" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2 mb-3">
                        <p className="text-5xl font-bold text-indigo-600">
                            {stats.approvalRate != null ? stats.approvalRate.toFixed(1) : '0.0'}
                        </p>
                        <span className="text-2xl font-semibold text-indigo-600 mb-1">%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${stats.approvalRate || 0}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500">Percentage of approved journeys</p>
                </div>

                {/* Work Efficiency */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-purple-100">Work Efficiency</h3>
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2 mb-3">
                        <p className="text-5xl font-bold text-white">{metrics.efficiency}</p>
                        <span className="text-2xl font-semibold text-purple-100 mb-1">%</span>
                    </div>
                    <p className="text-xs text-purple-100">Based on approval ratio</p>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/cva/pending')}
                            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            <Clock className="h-4 w-4" />
                            View Pending ({stats.pendingReview ?? 0})
                        </button>
                        <button
                            onClick={() => navigate('/cva/verified')}
                            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="h-4 w-4" />
                            View History
                        </button>
                    </div>
                </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Activity className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Performance Summary</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Total Verifications</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalVerified ?? 0}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Total Rejections</p>
                        <p className="text-2xl font-bold text-rose-600">{stats.totalRejected ?? 0}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                        <p className="text-2xl font-bold text-emerald-600">{metrics.efficiency}%</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Avg Daily</p>
                        <p className="text-2xl font-bold text-amber-600">{metrics.avgPerDay}</p>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-6 text-center text-sm text-gray-500">
                <p>Last updated: {new Date().toLocaleString('vi-VN')}</p>
            </div>
        </div>
    );
};

export default Report;