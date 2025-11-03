import React, { useState, useEffect, useCallback } from 'react';
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
    AlertCircle,
    Zap,
    Target,
    Award,
    Calendar,
    ArrowUp,
    ArrowDown,
    Sparkles,
} from 'lucide-react';

const Report = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    const fetchStats = useCallback(async (isRefresh = false) => {
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
            console.error('Error fetching CVA statistics:', err);

            if (err.response?.status === 401) {
                navigate('/login');
                return;
            }

            setError('Could not load statistics. Please try again later.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleRefresh = () => {
        fetchStats(true);
    };

    const calculateMetrics = () => {
        if (!stats) return {};

        const total = stats.totalProcessed || 0;
        const verified = stats.totalVerified || 0;
        const rejected = stats.totalRejected || 0;

        return {
            rejectionRate: total > 0 ? ((rejected / total) * 100).toFixed(1) : 0,
            avgPerDay: total > 0 ? (total / 30).toFixed(1) : 0,
            efficiency: total > 0 ? ((verified / total) * 100).toFixed(0) : 0,
        };
    };

    const metrics = calculateMetrics();

    if (loading) {
        return <LoadingOverlay />;
    }

    if (error) {
        // Giữ nguyên màn hình lỗi, nó sẽ hoạt động tốt trên nền sáng/tối
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="bg-rose-100 border border-rose-200 rounded-3xl p-8 inline-block mb-6 shadow-sm">
                        <XCircle className="h-16 w-16 text-rose-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Data Load Error
                    </h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!stats) {
        // Giữ nguyên màn hình không có dữ liệu
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="bg-slate-100 border border-slate-200 rounded-3xl p-8 inline-block mb-6 shadow-sm">
                        <BarChart className="h-16 w-16 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Data</h3>
                    <p className="text-gray-600 mb-6">Could not retrieve CVA statistics.</p>
                    <button
                        onClick={handleRefresh}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg"
                    >
                        Reload
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="relative z-10">
                {/* Header đơn giản */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Verification Report
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Overview of your verification activity
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className={`flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg shadow-sm transition-all ${refreshing ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            <RefreshCcw
                                className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`}
                            />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Hero Stats Grid - Style đơn giản */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Processed */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Total Processed
                            </h3>
                            <div className="p-3 bg-cyan-100 rounded-full">
                                <ListChecks className="h-6 w-6 text-cyan-600" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                            {stats.totalProcessed ?? 0}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Activity className="h-4 w-4" />
                            <span>~{metrics.avgPerDay} / day</span>
                        </div>
                    </div>

                    {/* Approved */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Approved
                            </h3>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                            {stats.totalVerified ?? 0}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-medium">Verified journeys</span>
                        </div>
                    </div>

                    {/* Rejected */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Rejected
                            </h3>
                            <div className="p-3 bg-rose-100 rounded-full">
                                <XCircle className="h-6 w-6 text-rose-600" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                            {stats.totalRejected ?? 0}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Percent className="h-4 w-4" />
                            <span>{metrics.rejectionRate}% rejection rate</span>
                        </div>
                    </div>

                    {/* Pending */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Pending
                            </h3>
                            <div className="p-3 bg-amber-100 rounded-full">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                            {stats.pendingReview ?? 0}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">Awaiting review</span>
                        </div>
                    </div>
                </div>

                {/* Metrics Section - Style đơn giản */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Approval Rate - Circular Progress */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Target className="h-5 w-5 text-indigo-600" />
                                Approval Rate
                            </h3>
                        </div>
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative w-40 h-40">
                                <svg className="transform -rotate-90 w-40 h-40">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        className="text-gray-200"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="url(#gradient1)"
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={`${2 * Math.PI * 70}`}
                                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - (stats.approvalRate || 0) / 100)
                                            }`}
                                        className="transition-all duration-1000"
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient
                                            id="gradient1"
                                            x1="0%"
                                            y1="0%"
                                            x2="100%"
                                            y2="100%"
                                        >
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-gray-900">
                                        {stats.approvalRate != null
                                            ? stats.approvalRate.toFixed(1)
                                            : '0.0'}
                                    </span>
                                    <span className="text-lg font-bold text-indigo-600">%</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-sm text-gray-500">
                            Percentage of journeys approved
                        </p>
                    </div>

                    {/* Work Efficiency - Card đơn giản */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Zap className="h-5 w-5 text-purple-600" />
                                Efficiency
                            </h3>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Award className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="mb-6">
                            <div className="flex items-end gap-2">
                                <p className="text-7xl font-bold text-gray-900 tracking-tighter">
                                    {metrics.efficiency}
                                </p>
                                <span className="text-3xl font-bold text-gray-500 mb-2">%</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-purple-600 h-3 rounded-full transition-all duration-1000"
                                    style={{ width: `${metrics.efficiency}%` }}
                                ></div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">Based on approval rate</p>
                    </div>

                    {/* Quick Actions - Card đơn giản */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                            Quick Actions
                        </h3>
                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/cva/pending')}
                                className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold py-4 px-5 rounded-xl transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5" />
                                        <span>View Pending</span>
                                    </div>
                                    <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
                                        {stats.pendingReview ?? 0}
                                    </span>
                                </div>
                            </button>
                            <button
                                onClick={() => navigate('/cva/verified')}
                                className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold py-4 px-5 rounded-xl transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5" />
                                        <span>View History</span>
                                    </div>
                                    <ArrowUp className="h-5 w-5" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Performance Summary - Bento Grid đơn giản */}
                <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Performance Summary
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <ListChecks className="h-5 w-5 text-blue-600" />
                                <p className="text-sm text-gray-500 font-semibold">
                                    Total Verified
                                </p>
                            </div>
                            <p className="text-3xl font-bold text-blue-600">
                                {stats.totalVerified ?? 0}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <XCircle className="h-5 w-5 text-rose-600" />
                                <p className="text-sm text-gray-500 font-semibold">
                                    Total Rejected
                                </p>
                            </div>
                            <p className="text-3xl font-bold text-rose-600">
                                {stats.totalRejected ?? 0}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                                <p className="text-sm text-gray-500 font-semibold">
                                    Success Rate
                                </p>
                            </div>
                            <p className="text-3xl font-bold text-emerald-600">
                                {metrics.efficiency}%
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-5 w-5 text-amber-600" />
                                <p className="text-sm text-gray-500 font-semibold">
                                    Average/Day
                                </p>
                            </div>
                            <p className="text-3xl font-bold text-amber-600">
                                {metrics.avgPerDay}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer đơn giản */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500">
                        Last updated:{' '}
                        <span className="text-gray-700 font-semibold">
                            {new Date().toLocaleString('en-US')}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Report;