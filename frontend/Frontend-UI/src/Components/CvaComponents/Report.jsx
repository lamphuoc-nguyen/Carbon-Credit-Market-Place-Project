import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cvaApi } from '../../api/cvaApi';
import { userApi } from '../../api/userApi';
import { vehicleApi } from '../../api/vehicleApi';
import { carbonCreditApi } from '../../api/carbonCreditApi';
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
    FileDown,
    Download,
    User,
    Car,
    Leaf
} from 'lucide-react';

const Report = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [additionalStats, setAdditionalStats] = useState({
        totalUsers: 0,
        totalVehicles: 0,
        totalCreditsIssued: 0,
        pendingCredits: 0
    });
    const navigate = useNavigate();

    const fetchStats = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            // Fetch main transfer statistics
            const data = await cvaApi.getTransferStatistics();
            setStats(data);

            // Fetch additional statistics in parallel
            try {
                const [users, vehicles, credits, pendingCredits] = await Promise.all([
                    userApi.getAllUsers().catch(err => {
                        console.warn('Failed to fetch users (may require admin permission):', err);
                        return [];
                    }),
                    vehicleApi.getAllVehicles().catch(err => {
                        console.warn('Failed to fetch vehicles:', err);
                        return [];
                    }),
                    cvaApi.getVerifiedCredits().catch(err => {
                        console.warn('Failed to fetch verified credits:', err);
                        return [];
                    }),
                    carbonCreditApi.getPendingCredits().catch(err => {
                        console.warn('Failed to fetch pending credits:', err);
                        return [];
                    })
                ]);

                console.log('Additional Stats Raw Data:', {
                    users: Array.isArray(users) ? `Array(${users.length})` : users,
                    vehicles: Array.isArray(vehicles) ? `Array(${vehicles.length})` : vehicles,
                    credits: Array.isArray(credits) ? `Array(${credits.length})` : credits,
                    pendingCredits: Array.isArray(pendingCredits) ? `Array(${pendingCredits.length})` : pendingCredits
                });

                setAdditionalStats({
                    totalUsers: Array.isArray(users) ? users.length : 0,
                    totalVehicles: Array.isArray(vehicles) ? vehicles.length : 0,
                    totalCreditsIssued: Array.isArray(credits) ? credits.length : 0,
                    pendingCredits: Array.isArray(pendingCredits) ? pendingCredits.length : 0
                });

                console.log('Additional Stats Set:', {
                    totalUsers: Array.isArray(users) ? users.length : 0,
                    totalVehicles: Array.isArray(vehicles) ? vehicles.length : 0,
                    totalCreditsIssued: Array.isArray(credits) ? credits.length : 0,
                    pendingCredits: Array.isArray(pendingCredits) ? pendingCredits.length : 0
                });
            } catch (additionalErr) {
                console.error('Could not fetch additional statistics:', additionalErr);
                // Continue with main stats even if additional stats fail
            }
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

    const handleExportReport = async (format = 'csv') => {
        try {
            setExporting(true);

            // Fetch verified credits data
            const verifiedCredits = await cvaApi.getVerifiedCredits();

            if (format === 'csv') {
                exportToCSV(verifiedCredits);
            } else if (format === 'json') {
                exportToJSON(verifiedCredits);
            }
        } catch (err) {
            console.error('Error exporting report:', err);
            alert('Failed to export report. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const exportToCSV = (credits) => {
        // Format data for Excel with tab separator (more reliable than comma)
        const headers = [
            'Credit ID',
            'Owner Username',
            'Owner Email',
            'CO2 Amount (kg)',
            'Credit Value',
            'Status',
            'Issued Date',
            'Verified By',
            'Certificate ID'
        ];

        // Create rows with tab separation
        const rows = credits.map(credit => {
            const issuedDate = credit.issuedDate
                ? new Date(credit.issuedDate).toLocaleString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
                : '';

            return [
                credit.id || '',
                credit.owner?.username || credit.ownerUsername || '',
                credit.owner?.email || '',
                credit.co2Amount || '0',
                credit.creditValue || '0',
                credit.status || '',
                issuedDate,
                credit.verifiedByUsername || '',
                credit.certificateId || ''
            ].join('\t'); // Use TAB instead of comma
        });

        // Combine with newlines
        const tsvContent = [headers.join('\t'), ...rows].join('\r\n'); // Windows line ending

        // Create Excel-compatible file
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + tsvContent], {
            type: 'text/tab-separated-values;charset=utf-8;'
        });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `carbon-credit-report-${timestamp}.xls`); // Use .xls extension
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportToJSON = (credits) => {
        // Create comprehensive report object
        const report = {
            reportTitle: 'Carbon Credit Issuance Report',
            generatedDate: new Date().toISOString(),
            statistics: {
                totalCreditsIssued: credits.length,
                totalCO2Converted: credits.reduce((sum, c) => sum + (c.co2Amount || 0), 0),
                totalCreditValue: credits.reduce((sum, c) => sum + (c.creditValue || 0), 0)
            },
            credits: credits.map(credit => ({
                id: credit.id,
                owner: {
                    username: credit.owner?.username || credit.ownerUsername,
                    email: credit.owner?.email,
                    userId: credit.ownerId
                },
                co2Amount: credit.co2Amount,
                creditValue: credit.creditValue,
                status: credit.status,
                issuedDate: credit.issuedDate,
                verifiedBy: credit.verifiedByUsername,
                certificateId: credit.certificateId,
                journeyIds: credit.journeyIds
            }))
        };

        // Create blob and download
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `carbon-credit-report-${timestamp}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const calculateMetrics = () => {
        if (!stats) return {};

        const total = stats.totalProcessedTransfers || 0;
        const verified = stats.approvedTransfers || 0;
        const rejected = stats.rejectedTransfers || 0;

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
                            {stats.totalProcessedTransfers ?? 0}
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
                            {stats.approvedTransfers ?? 0}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-medium">Approved transfers</span>
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
                            {stats.rejectedTransfers ?? 0}
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
                            {stats.pendingTransfers ?? 0}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">Awaiting review</span>
                        </div>
                    </div>
                </div>

                {/* Metrics Section - Style đơn giản */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - (stats.transferApprovalRate || 0) / 100)
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
                                        {stats.transferApprovalRate != null
                                            ? stats.transferApprovalRate.toFixed(1)
                                            : '0.0'}
                                    </span>
                                    <span className="text-lg font-bold text-indigo-600">%</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-sm text-gray-500">
                            Percentage of transfers approved
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
                                    Total Approved
                                </p>
                            </div>
                            <p className="text-3xl font-bold text-blue-600">
                                {stats.approvedTransfers ?? 0}
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
                                {stats.rejectedTransfers ?? 0}
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

                {/* System Overview Statistics */}
                <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            System Overview
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Leaf className="h-5 w-5 text-emerald-600" />
                                <p className="text-sm text-emerald-700 font-semibold">
                                    CO₂ Reduced
                                </p>
                            </div>
                            <p className="text-3xl font-bold text-emerald-900">
                                {((additionalStats.totalCreditsIssued || 0) * 1.5).toFixed(1)}
                            </p>
                            <p className="text-xs text-emerald-600 mt-1">tons</p>
                        </div>
                        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4 border border-cyan-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Car className="h-5 w-5 text-cyan-600" />
                                <p className="text-sm text-cyan-700 font-semibold">
                                    Total Vehicles
                                </p>
                            </div>
                            <p className="text-3xl font-bold text-cyan-900">
                                {additionalStats.totalVehicles}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Award className="h-5 w-5 text-green-600" />
                                <p className="text-sm text-green-700 font-semibold">
                                    Credits Issued
                                </p>
                            </div>
                            <p className="text-3xl font-bold text-green-900">
                                {additionalStats.totalCreditsIssued}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Export Report Section */}
                <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FileDown className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Export Carbon Credit Report
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Download detailed report of issued carbon credits
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => handleExportReport('csv')}
                            disabled={exporting}
                            className={`flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md ${exporting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            <Download className={`h-5 w-5 ${exporting ? 'animate-bounce' : ''}`} />
                            <span>Export as CSV</span>
                        </button>
                        <button
                            onClick={() => handleExportReport('json')}
                            disabled={exporting}
                            className={`flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md ${exporting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            <Download className={`h-5 w-5 ${exporting ? 'animate-bounce' : ''}`} />
                            <span>Export as JSON</span>
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-blue-900 mb-1">Report Information</p>
                                <p className="text-sm text-blue-700">
                                    The report includes all verified carbon credits with details such as owner information,
                                    CO2 amounts, credit values, issuance dates, and verification data.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                
            </div>
        </div>
    );
};

export default Report;