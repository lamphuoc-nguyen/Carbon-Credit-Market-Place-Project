import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    // Icons for Stats
    Users, DollarSign, TrendingUp, Activity as HealthIcon,
    // Icons for other sections
    Clock, CheckCircle, XCircle, FileText, AlertTriangle, ArrowRight
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    LineChart, Line, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';

// Import API services
import { carbonCreditApi } from '../../api/carbonCreditApi';
import { userApi } from '../../api/userApi';
import { transactionApi } from '../../api/transactionApi';

// --- HELPER COMPONENTS ---

// Map icon for Stats
const statIconMap = {
    Users: Users,
    DollarSign: DollarSign,
    TrendingUp: TrendingUp,
    HealthIcon: HealthIcon,
};

// Render Icon for Stats
const RenderStatIcon = ({ name, className }) => {
    const IconComponent = statIconMap[name] || Users;
    return <IconComponent className={className} />;
};

// StatusBadge (Used for Recent Transactions)
const StatusBadge = ({ status }) => {
    let color, text;
    // Chuyển status về chữ hoa để so sánh
    const upperStatus = status ? status.toUpperCase() : 'UNKNOWN';

    switch (upperStatus) {
        case 'COMPLETED':
            color = 'bg-green-100 text-green-700 border border-green-200';
            text = 'Completed';
            break;
        case 'PENDING':
            color = 'bg-yellow-100 text-yellow-700 border border-yellow-200';
            text = 'Pending';
            break;
        case 'CANCELLED':
            color = 'bg-red-100 text-red-700 border border-red-200';
            text = 'Cancelled';
            break;
        case 'DISPUTED':
            color = 'bg-orange-100 text-orange-700 border border-orange-200';
            text = 'Disputed';
            break;
        default:
            color = 'bg-gray-100 text-gray-700 border border-gray-200';
            text = status || 'Unknown';
    }
    return (
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${color}`}>
            {text}
        </span>
    );
};

// --- CHART COMPONENTS ---

// PlatformGrowthChart (Includes mock data)
const platformChartData = [
    { name: 'Jul', users: 240, transactions: 180, volume: 12000 },
    { name: 'Aug', users: 275, transactions: 220, volume: 14000 },
    { name: 'Sep', users: 290, transactions: 280, volume: 19000 },
    { name: 'Oct', users: 270, transactions: 260, volume: 16700 },
    { name: 'Nov', users: 334, transactions: 245, volume: 16700 },
    { name: 'Dec', users: 360, transactions: 310, volume: 22000 },
];
const PlatformGrowthChart = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full">
        <h3 className="text-lg font-semibold text-gray-800">Platform Growth</h3>
        <p className="text-sm text-gray-500 mb-4">Users, transactions, and trading volume</p>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={platformChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis yAxisId="left" domain={[0, 360]} stroke="#6b7280" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 24000]} stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" dataKey="users" name="Users" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line yAxisId="left" type="monotone" dataKey="transactions" name="Transactions" stroke="#22c55e" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="volume" name="Volume (SK)" stroke="#f97316" strokeWidth={2} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

// UserDistributionChart (Includes mock data and label helper)
const userChartData = [
    { name: 'EV Owners', value: 186 },
    { name: 'Buyers', value: 142 },
    { name: 'Verifiers', value: 36 },
    { name: 'Admins', value: 63 },
];
const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f97316'];
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, name, value }) => {
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="#333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={13}>
            {`${name}: ${value}`}
        </text>
    );
};
const UserDistributionChart = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full">
        <h3 className="text-lg font-semibold text-gray-800">User Distribution</h3>
        <p className="text-sm text-gray-500 mb-4">Platform users by role</p>
        <ResponsiveContainer width="100%" height={300}>
            <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <Tooltip />
                <Pie
                    data={userChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    fill="#8884d8"
                    paddingAngle={1}
                    dataKey="value"
                    labelLine={true}
                    label={renderCustomizedLabel}
                >
                    {userChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    </div>
);

// --- BOTTOM ROW COMPONENTS ---

// RecentTransactions (Includes mock data)

const RecentTransactions = () => {
    // State để lưu trữ transactions, loading, và error
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Lấy 5 giao dịch bị khiếu nại gần nhất (phân trang)
                // API trả về một đối tượng Page, vì vậy chúng ta cần .content
                const response = await transactionApi.getDisputedTransactions(0, 5);
                setTransactions(response.content || []); // Đảm bảo transactions luôn là mảng
            } catch (err) {
                console.error("Failed to fetch recent transactions:", err);
                setError(err.message || 'Could not load data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, []); // Chạy một lần khi component mount

    // Helper để định dạng ngày
    const formatDate = (dateString) => {
        if (!dateString) return 'Invalid date';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col space-y-4 h-full">
            <div>
                <div className="flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-gray-500" />
                    {/* Đổi tiêu đề để phản ánh đúng API đang gọi */}
                    <h2 className="text-xl font-semibold text-gray-800">Recent Disputed Transactions</h2>
                </div>
                <p className="text-sm text-gray-500 mt-2">Latest platform disputes</p>
            </div>

            {/* --- Xử lý trạng thái Loading --- */}
            {isLoading && (
                Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border-t border-gray-100 pt-4 animate-pulse">
                        <div className="flex justify-between items-start">
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            <div className="h-5 bg-gray-200 rounded-full w-1/4"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3 mt-1.5"></div>
                    </div>
                ))
            )}

            {/* --- Xử lý trạng thái Error --- */}
            {!isLoading && error && (
                <div className="border-t border-gray-100 pt-4 text-center text-red-500">
                    <p>Error loading transactions: {error}</p>
                </div>
            )}

            {/* --- Xử lý khi không có dữ liệu --- */}
            {!isLoading && !error && transactions.length === 0 && (
                <div className="border-t border-gray-100 pt-4 text-center text-gray-500">
                    <p>No disputed transactions found.</p>
                </div>
            )}

            {/* --- Hiển thị dữ liệu --- */}
            {!isLoading && !error && transactions.length > 0 && (
                transactions.map(tx => (
                    <div key={tx.id} className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center font-semibold text-gray-800 text-sm">
                                {/* LƯU Ý: Giả định TransactionDTO của bạn có 'sellerName' và 'buyerName'
                                  Nếu không, bạn cần thay thế bằng:
                                  tx.listing?.credit?.user?.username (cho seller)
                                  tx.buyer?.username (cho buyer)
                                */}
                                <span>{tx.sellerName || 'Unknown Seller'}</span>
                                <ArrowRight className="h-4 w-4 mx-1 text-gray-400" />
                                <span>{tx.buyerName || 'Unknown Buyer'}</span>
                            </div>
                            <StatusBadge status={tx.status} />
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                            {/* Giả định DTO có 'credits' và 'totalPrice' */}
                            <span>{tx.credits || 0} credits</span>
                            <span className="text-gray-300">•</span>
                            <span>${(tx.totalPrice || 0).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">
                            {/* Giả định DTO có 'createdAt' */}
                            {formatDate(tx.createdAt)}
                        </p>
                    </div>
                ))
            )}

            {/* Link để xem tất cả */}
            {!isLoading && (
                <Link to="/admin/disputes" className="mt-auto text-center text-sm text-blue-600 hover:underline pt-2">
                    View All Disputes
                </Link>
            )}
        </div>
    );
};

// SystemAlerts (Displays error and pending count)
const SystemAlerts = ({ pendingCount, isLoading, error }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col space-y-4 h-full"> {/* Added h-full */}
        <div>
            <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-gray-500" />
                <h2 className="text-xl font-semibold text-gray-800">System Alerts</h2>
            </div>
            <p className="text-sm text-gray-500 mt-2">Platform monitoring and alerts</p>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-red-800">API Error: {error}</p>
                    <p className="text-sm text-red-600">Could not load dashboard data.</p>
                </div>
            </div>
        )}

        {!error && (
            <>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-yellow-800">
                            High verification queue - {isLoading ? '...' : pendingCount} pending reviews
                        </p>
                        <p className="text-sm text-yellow-600">2 hours ago</p> {/* Mock time */}
                    </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-blue-800">Monthly report generation completed</p>
                        <p className="text-sm text-blue-600">5 hours ago</p> {/* Mock time */}
                    </div>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-red-800">Payment gateway timeout detected</p>
                        <p className="text-sm text-red-600">1 day ago</p> {/* Mock time */}
                    </div>
                </div>
            </>
        )}
    </div>
);


// --- MAIN DASHBOARD COMPONENT ---

// Initial state for Stats Cards
const initialStats = [
    { name: 'Total Users', value: '...', trend: 'Loading...', icon: 'Users' },
    { name: 'Platform Revenue', value: '$...', trend: 'Loading...', icon: 'DollarSign' },
    { name: 'Credits Traded', value: '...', subtext: 'Loading...', icon: 'TrendingUp' },
    { name: 'System Health', value: '...%', subtext: 'Loading...', icon: 'HealthIcon', barValue: 0 },
];

const AdminDashboard = () => {

    const [statsData, setStatsData] = useState(initialStats);
    const [pendingCount, setPendingCount] = useState(0);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoadingStats(true);
            setStatsError(null);
            try {
                // Fetch data in parallel
                const [pendingDataResponse, totalUsersResponse] = await Promise.all([
                    carbonCreditApi.getPendingCredits(),
                    userApi.getAllUsers() // Assuming getAllUsers returns an array of users
                ]);

                // Process pending count
                const currentPendingCount = pendingDataResponse.length;
                setPendingCount(currentPendingCount);

                // Process total users
                const currentTotalUsers = totalUsersResponse.length;
                // TODO: Calculate changeThisMonth based on actual user data (e.g., created_at date)
                const changeThisMonth = 24; // Placeholder

                // Mock data for other stats (replace with API calls when available)
                const revenueData = { value: 45750, changePercent: 18.2 };
                const creditsTradedData = { value: 2927 };
                const systemHealthData = { value: 98.7 };

                // Update stats state
                setStatsData([
                    { name: 'Total Users', value: currentTotalUsers.toString(), trend: `+${changeThisMonth} this month`, icon: 'Users' },
                    { name: 'Platform Revenue', value: `$${revenueData.value.toLocaleString()}`, trend: `+${revenueData.changePercent}% from last month`, icon: 'DollarSign' },
                    { name: 'Credits Traded', value: creditsTradedData.value.toLocaleString(), subtext: 'Total volume this month', icon: 'TrendingUp' },
                    { name: 'System Health', value: `${systemHealthData.value}%`, subtext: 'Uptime this month', icon: 'HealthIcon', barValue: systemHealthData.value },
                ]);

            } catch (err) {
                console.error("Failed to load dashboard data:", err);
                const errorMsg = err.response?.data?.message || err.message || 'Cannot load dashboard data.';
                setStatsError(errorMsg);
                // Reset stats to error state
                setStatsData(initialStats.map(s => ({ ...s, value: 'Error', trend: 'Failed', subtext: 'Failed' })));
                setPendingCount(0); // Reset pending count on error
            } finally {
                setIsLoadingStats(false);
            }
        };
        fetchDashboardData();
    }, []); // Empty dependency array ensures this runs only once on mount


    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-500">Platform overview and key metrics</p>
            </header>

            {/* Row 1: Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoadingStats ? (
                    // Skeleton Loading for Stats
                    Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm animate-pulse min-h-[140px]">
                            <div className="flex justify-between items-start mb-2"> <div className="h-4 bg-gray-200 rounded w-1/2"></div> <div className="h-6 w-6 bg-gray-200 rounded"></div> </div> <div className="h-8 bg-gray-300 rounded w-1/3 mb-3"></div> <div className="h-3 bg-gray-200 rounded w-3/4"></div> {index === 3 && <div className="h-1.5 bg-gray-300 rounded-full mt-2"></div>}
                        </div>
                    ))
                ) : statsError ? (
                    // Error Display for Stats
                    <div className="md:col-span-2 lg:col-span-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                        {statsError}
                    </div>
                ) : (
                    // Stat Cards Display
                    statsData.map((stat, index) => (
                        <div key={index} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm min-h-[140px] flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                    <RenderStatIcon name={stat.icon} className="h-5 w-5 text-gray-400" />
                                </div>
                                <p className={`text-3xl font-bold ${stat.name === 'System Health' ? 'text-green-600' : 'text-gray-900'}`}>
                                    {stat.value === 'Error' ? <span className="text-red-500">Error</span> : stat.value}
                                </p>
                            </div>
                            <div>
                                <p className={`text-xs mt-1 ${stat.value === 'Error' ? 'text-red-500' :
                                        stat.trend?.includes('+') ? 'text-green-600' :
                                            stat.trend?.includes('-') ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                    {stat.trend || stat.subtext}
                                </p>
                                {stat.name === 'System Health' && stat.value !== 'Error' && (
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                        <div
                                            className="bg-green-600 h-1.5 rounded-full"
                                            style={{ width: `${stat.barValue || 0}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Row 2: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PlatformGrowthChart />
                <UserDistributionChart />
            </div>

            {/* Row 3: Transactions & Alerts */}
            {/* Chia làm 2 cột bằng nhau */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentTransactions />
                <SystemAlerts
                    pendingCount={pendingCount}
                    isLoading={isLoadingStats} // Use stats loading state
                    error={statsError}       // Use stats error state
                />
            </div>
        </div>
    );
};

export default AdminDashboard;