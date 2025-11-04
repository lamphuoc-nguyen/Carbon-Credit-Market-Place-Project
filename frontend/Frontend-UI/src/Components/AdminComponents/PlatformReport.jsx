import React, { useState, useEffect, useCallback } from 'react';
import { transactionApi } from '../../api/transactionApi';
import { userApi } from '../../api/userApi';
import {
    Download,
    Calendar,
    DollarSign,
    Database,
    FileText,
    Users,
    Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Helper Components ---

/**
 * 1. StatCard: Component thẻ hiển thị số liệu
 *
 * ✅ SỬA LỖI/REFACTOR:
 * Đã đổi tên prop `icon: Icon` thành `icon: IconComponent`.
 * Tên "IconComponent" rõ ràng hơn, tránh nhầm lẫn.
 */
const StatCard = ({ title, value, icon: IconComponent, note, isLoading }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[140px]">
        {isLoading ? (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
        ) : (
            <>
                <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    {/* Sử dụng tên đã đổi là IconComponent */}
                    {IconComponent && <IconComponent className="h-5 w-5 text-gray-400" />}
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
            </>
        )}
    </div>
);

/**
 * 2. UserDistributionChart: Biểu đồ tròn phân phối user
 * (Component này đã đúng, giữ nguyên)
 */
const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f97316'];
const UserDistributionChart = ({ data, isLoading }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full min-h-[350px]">
        <h3 className="text-lg font-semibold text-gray-800">User Distribution</h3>
        {isLoading ? (
            <div className="flex items-center justify-center h-[250px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        ) : (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={2}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        )}
    </div>
);


// --- Main Component ---

const PlatformReport = () => {
    // State cho số liệu
    const [stats, setStats] = useState(null);
    const [userStats, setUserStats] = useState({ totalUsers: 0, chartData: [] });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho Date Picker (định dạng 'YYYY-MM-DD' cho input)
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30); // Mặc định 30 ngày trước
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]); // Mặc định hôm nay

    /**
     * Hàm fetch dữ liệu chính, được gọi lại khi ngày tháng thay đổi
     */
    const fetchReportData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const fullEndDate = new Date(endDate);
        fullEndDate.setHours(23, 59, 59, 999);

        const fullStartDate = new Date(startDate);
        fullStartDate.setHours(0, 0, 0, 0);

        try {
            // Gọi API song song
            const [statsResponse, usersResponse] = await Promise.all([
                // ✅ SỬA LỖI 400: Áp dụng .slice(0, -5) để xóa múi giờ (chữ Z)
                transactionApi.getTransactionStatistics(
                    fullStartDate.toISOString().slice(0, -5),
                    fullEndDate.toISOString().slice(0, -5)
                ),
                userApi.getAllUsers()
            ]);

            // Xử lý Transaction Stats
            const revenue = statsResponse.totalRevenue || 0;
            const credits = statsResponse.totalCreditsTraded || 0;
            const transactions = statsResponse.totalTransactions || 0;
            const avgPrice = credits > 0 ? (revenue / credits) : 0;

            setStats({
                totalRevenue: revenue,
                totalCreditsTraded: credits,
                totalTransactions: transactions,
                avgPrice: avgPrice
            });

            // Xử lý User Stats
            const roleCounts = usersResponse.reduce((acc, user) => {
                const role = user.role || 'UNKNOWN';
                acc[role] = (acc[role] || 0) + 1;
                return acc;
            }, {});

            setUserStats({
                totalUsers: usersResponse.length,
                chartData: [
                    { name: 'EV Owners', value: roleCounts.EV_OWNER || 0 },
                    { name: 'Buyers', value: roleCounts.BUYER || 0 },
                    { name: 'Verifiers', value: roleCounts.CVA || 0 },
                    { name: 'Admins', value: roleCounts.ADMIN || 0 },
                ]
            });

        } catch (err) {
            console.error("Failed to fetch report data:", err);
            // Hiển thị lỗi từ axios interceptor (nếu có)
            const errorMsg = err.response?.data?.message || err.message || "Failed to load report data.";
            setError(errorMsg);
            setStats(null);
            setUserStats({ totalUsers: 0, chartData: [] });
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate]); // Phụ thuộc vào state ngày tháng

    // Tự động fetch khi component mount hoặc ngày tháng thay đổi
    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    /**
     * Xử lý khi nhấn nút preset (vd: 7 ngày, 30 ngày)
     */
    const handleDatePreset = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    /**
     * Placeholder cho chức năng xuất CSV
     */
    const handleExportCSV = () => {
        console.log("Exporting data:", { stats, userStats });
        alert("Chức năng xuất CSV đang được phát triển. Dữ liệu đã được log ra console.");
    };

    // Helper định dạng
    const formatCurrency = (val) => `$${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatNumber = (val) => (val || 0).toLocaleString();

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">Platform Report</h1>
                <p className="text-gray-500">Generate comprehensive transaction and platform reports.</p>
            </header>

            {/* --- Toolbar: Date Picker & Export --- */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Date Pickers */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="startDate" className="text-sm font-medium text-gray-700">From:</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <label htmlFor="endDate" className="text-sm font-medium text-gray-700">To:</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                            className="border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {/* Preset Buttons */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleDatePreset(7)} className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                            Last 7 Days
                        </button>
                        <button onClick={() => handleDatePreset(30)} className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                            Last 30 Days
                        </button>
                    </div>
                </div>
                {/* Export Button */}
                <button
                    onClick={handleExportCSV}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    <Download className="h-4 w-4" />
                    Export Report (CSV)
                </button>
            </div>

            {/* Báo cáo lỗi chung */}
            {error && (
                <div className="p-4 text-center text-red-700 bg-red-100 border border-red-200 rounded-lg">
                    {/* Hiển thị lỗi từ `axiosInstance` của bạn */}
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* --- Section 1: Transaction Metrics --- */}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Transaction Metrics (Selected Period)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats?.totalRevenue)}
                        icon={DollarSign}
                        note={`From ${formatNumber(stats?.totalTransactions)} transactions`}
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Total Credits Traded"
                        value={formatNumber(stats?.totalCreditsTraded)}
                        icon={Database}
                        note="Carbon credits (tCO2e)"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Total Transactions"
                        value={formatNumber(stats?.totalTransactions)}
                        icon={FileText}
                        note="Completed sales"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Avg. Price / Credit"
                        value={formatCurrency(stats?.avgPrice)}
                        icon={DollarSign}
                        note="Revenue / Credits"
                        isLoading={isLoading}
                    />
                </div>
            </div>

            {/* --- Section 2: Platform Statistics --- */}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Platform Statistics (All-Time)</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <StatCard
                            title="Total Active Users"
                            value={formatNumber(userStats.totalUsers)}
                            icon={Users}
                            note="All user roles"
                            isLoading={isLoading}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <UserDistributionChart data={userStats.chartData} isLoading={isLoading} />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PlatformReport;