import React from 'react';
import {
    Clock, CheckCircle, TrendingUp, XCircle, Shield,
    BarChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
// Import Recharts
import {
    ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

// --- HELPER COMPONENTS & DATA ---

// Giả định hàm RenderIcon
const RenderIcon = ({ name, className }) => {
    switch (name) {
        case 'Clock': return <Clock className={className} />;
        case 'CheckCircle': return <CheckCircle className={className} />;
        case 'TrendingUp': return <TrendingUp className={className} />;
        case 'ArrowUpRight': return <ArrowUpRight className={className} />;
        case 'ArrowDownRight': return <ArrowDownRight className={className} />;
        default: return <BarChart className={className} />;
    }
};

// Component PriorityBadge
const PriorityBadge = ({ priority }) => {
    let color = '';
    switch (priority) {
        case 'high':
            color = 'bg-red-100 text-red-700 border border-red-200';
            break;
        case 'medium':
            color = 'bg-gray-800 text-white';
            break;
        case 'low':
            color = 'bg-blue-100 text-blue-700 border border-blue-200';
            break;
        default:
            color = 'bg-gray-100 text-gray-700 border border-gray-200';
    }
    return (
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md capitalize ${color}`}>
            {priority} priority
        </span>
    );
};

// --- MOCK DATA ---

// Dữ liệu Stats
const stats = [
    { name: 'Pending Reviews', value: '47', trend: '+8 since yesterday', icon: 'Clock', iconColor: 'text-orange-500' },
    { name: 'Verified Credits', value: '299', trend: 'This month: 55', icon: 'CheckCircle', iconColor: 'text-green-500' },
    { name: 'Accuracy Rate', value: '94.6%', trend: 'Industry leading', icon: 'TrendingUp', iconColor: 'text-purple-500', barWidth: 'w-[94.6%]' },
    { name: 'Average Review Time', value: '2.4 days', trend: '-0.3 from last month', icon: 'Clock', iconColor: 'text-gray-500' },
];

// Dữ liệu Pending Requests (Thêm 1-2 item để test "See more")
const pendingRequests = [
    {
        id: 'R001',
        name: 'Michael Johnson',
        category: 'EV Transport',
        credits: 42.5,
        co2: '112.3 kg CO2',
        priority: 'high',
        date: '2024-01-20',
        documents: 5
    },
    {
        id: 'R002',
        name: 'Green Fleet Corp',
        category: 'Fleet Optimization',
        credits: 85,
        co2: '225.8 kg CO2',
        priority: 'medium',
        date: '2024-01-19',
        documents: 8
    },
    {
        id: 'R003',
        name: 'Sarah Chen',
        category: 'EV Transport',
        credits: 28.2,
        co2: '74.6 kg CO2',
        priority: 'low',
        date: '2024-01-18',
        documents: 4
    },
    {
        id: 'R004', // Item thứ 4 (sẽ bị ẩn đi)
        name: 'Eco Innovators',
        category: 'Solar Panel',
        credits: 120,
        co2: '300 kg CO2',
        priority: 'high',
        date: '2024-01-17',
        documents: 7
    },
];

// Dữ liệu cho biểu đồ
const chartData = [
    { name: 'Jul', verified: 45, pending: 12, rejected: 3 },
    { name: 'Aug', verified: 52, pending: 8, rejected: 8 },
    { name: 'Sep', verified: 38, pending: 15, rejected: 5 },
    { name: 'Oct', verified: 61, pending: 9, rejected: 4 },
    { name: 'Nov', verified: 48, pending: 11, rejected: 8 },
    { name: 'Dec', verified: 55, pending: 18, rejected: 2 },
];

// --- MAIN COMPONENT ---

// CẬP NHẬT: Nhận 'setCurrentPage' làm prop
const Dashboard = ({ setCurrentPage }) => {

    // (Trong tương lai, bạn sẽ dùng useEffect để fetch 'pendingRequests' từ API)

    return (
        <div className="space-y-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Verification Dashboard</h1>
                <p className="text-gray-500">Verify and audit carbon credit issuance</p>
            </header>

            {/* 1. Stats Cards (Không đổi) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-500 flex items-center">
                                {stat.name}
                            </p>
                            <div className={`p-2 rounded-full bg-opacity-10 ${stat.iconColor.replace('text-', 'bg-')}`}>
                                <RenderIcon name={stat.icon} className={`h-6 w-6 ${stat.iconColor}`} />
                            </div>
                        </div>
                        <p className="text-4xl font-extrabold text-gray-900 mt-2">{stat.value}</p>
                        {stat.name === 'Accuracy Rate' ? (
                            <div className="mt-3">
                                <p className="text-sm text-green-600 font-semibold">{stat.trend}</p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                    <div className={`bg-purple-600 h-2.5 rounded-full ${stat.barWidth}`}></div>
                                </div>
                            </div>
                        ) : (
                            <p className={`text-xs mt-3 ${stat.trend.includes('+') ? 'text-green-500' : stat.trend.includes('-') ? 'text-red-500' : 'text-gray-500'}`}>
                                {stat.trend}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* 2. Pending Verifications & Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- KHỐI PENDING REQUESTS (Đã cập nhật) --- */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg flex flex-col space-y-6">
                    {/* Header Thẻ */}
                    <div>
                        <div className="flex items-center space-x-2">
                            <Shield className="h-6 w-6 text-gray-500" />
                            <h2 className="text-xl font-semibold text-gray-800">Pending Verifications</h2>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Credit issuance requests awaiting review</p>
                    </div>

                    {/* CẬP NHẬT: Dùng .slice(0, 3) để chỉ lấy 3 item đầu tiên 
                      Sử dụng `space-y-6` của div cha để tạo khoảng cách
                    */}
                    {pendingRequests.slice(0, 3).map(req => (
                        <div key={req.id} className="border-b border-gray-100 pb-6 last:border-b-0">

                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-900">{req.name}</p>
                                    <p className="text-sm text-gray-500">{req.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">{req.credits} credits</p>
                                    <p className="text-sm text-gray-500">{req.co2}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 mt-3">
                                <PriorityBadge priority={req.priority} />
                                <span className="text-xs text-gray-500">{req.documents} documents</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">Submitted: {req.date}</p>

                            <div className="flex items-center space-x-3 mt-4">
                                <button className="flex items-center justify-center w-1/2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium transition">
                                    <XCircle className="h-4 w-4 mr-1.5" /> Reject
                                </button>
                                <button className="flex items-center justify-center w-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium transition">
                                    <CheckCircle className="h-4 w-4 mr-1.5" /> Approve
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* CẬP NHẬT: Thêm nút "See more"
                      Chỉ hiển thị nút này nếu có nhiều hơn 3 request
                    */}
                    {pendingRequests.length > 3 && (
                        <button
                            onClick={() => setCurrentPage('pending_verifications')}
                            className="w-full text-center py-2 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-purple-600 font-semibold transition focus:outline-none focus:ring-2 focus:ring-purple-300"
                        >
                            See all pending requests
                        </button>
                    )}
                </div>

                {/* --- KHỐI BIỂU ĐỒ (Không đổi) --- */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800">Verification Analytics</h2>
                    <p className="text-sm text-gray-500 mb-4">Monthly verification activity</p>

                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart
                                data={chartData}
                                margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
                            >
                                <XAxis
                                    dataKey="name"
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '8px',
                                        borderColor: '#e5e7eb'
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                                <Bar dataKey="verified" fill="#22c55e" name="Verified" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="pending" fill="#f97316" name="Pending" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;