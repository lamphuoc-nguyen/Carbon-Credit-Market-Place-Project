import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { Link } from 'react-router-dom'; // Import Link for navigation
import {
    Clock, CheckCircle, TrendingUp, XCircle, Shield,
    BarChart as ChartIcon // Renamed BarChart to avoid conflict
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

// Import API service
import { carbonCreditApi } from '../../api/carbonCreditApi'; // Adjust path if needed

// --- HELPER COMPONENTS ---

// RenderIcon component (using ChartIcon for default)
const RenderIcon = ({ name, className }) => {
    switch (name) {
        case 'Clock': return <Clock className={className} />;
        case 'CheckCircle': return <CheckCircle className={className} />;
        case 'TrendingUp': return <TrendingUp className={className} />;
        // Add ArrowUpRight and ArrowDownRight if needed by stats
        // case 'ArrowUpRight': return <ArrowUpRight className={className} />;
        // case 'ArrowDownRight': return <ArrowDownRight className={className} />;
        default: return <ChartIcon className={className} />; // Use ChartIcon
    }
};

// PriorityBadge (Simplified based on status - adjust colors/text as needed)
const StatusBadge = ({ status }) => {
    let color = 'bg-gray-100 text-gray-700 border border-gray-200'; // Default: PENDING
    let text = status || 'PENDING';

    switch (status) {
        case 'PENDING_VERIFICATION':
            color = 'bg-orange-100 text-orange-700 border border-orange-200';
            text = 'Pending';
            break;
        case 'VERIFIED':
            color = 'bg-green-100 text-green-700 border border-green-200';
            text = 'Verified';
            break;
        case 'REJECTED':
            color = 'bg-red-100 text-red-700 border border-red-200';
            text = 'Rejected';
            break;
        // Add other statuses if applicable
    }
    return (
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md capitalize ${color}`}>
            {text}
        </span>
    );
};


// --- MOCK DATA (for Stats & Chart only) ---
const stats = [
    { name: 'Pending Reviews', value: '...', trend: 'Loading...', icon: 'Clock', iconColor: 'text-orange-500' }, // Value will be updated
    { name: 'Verified Credits', value: '299', trend: 'This month: 55', icon: 'CheckCircle', iconColor: 'text-green-500' },
    { name: 'Accuracy Rate', value: '94.6%', trend: 'Industry leading', icon: 'TrendingUp', iconColor: 'text-purple-500', barWidth: 'w-[94.6%]' },
    { name: 'Average Review Time', value: '2.4 days', trend: '-0.3 from last month', icon: 'Clock', iconColor: 'text-gray-500' },
];

const chartData = [
    { name: 'Jul', verified: 45, pending: 12, rejected: 3 },
    { name: 'Aug', verified: 52, pending: 8, rejected: 8 },
    { name: 'Sep', verified: 38, pending: 15, rejected: 5 },
    { name: 'Oct', verified: 61, pending: 9, rejected: 4 },
    { name: 'Nov', verified: 48, pending: 11, rejected: 8 },
    { name: 'Dec', verified: 55, pending: 18, rejected: 2 },
];

// --- MAIN COMPONENT ---
const Dashboard = () => {

    const [pendingRequests, setPendingRequests] = useState([]);
    const [statsData, setStatsData] = useState(stats); // Use state for stats too
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPendingData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                // Call API to get pending credits list
                const data = await carbonCreditApi.getPendingCredits();
                console.log("Pending Credits Data:", JSON.stringify(data, null, 2)); // Log the data structure
                setPendingRequests(data);

                // Update the 'Pending Reviews' stat card count
                setStatsData(prevStats => prevStats.map(stat =>
                    stat.name === 'Pending Reviews'
                        ? { ...stat, value: data.length.toString(), trend: `Fetched ${new Date().toLocaleTimeString()}` }
                        : stat
                ));

            } catch (err) {
                console.error("Failed to load dashboard pending credits:", err);
                if (err.response?.status !== 401) {
                    setError('Cannot load pending list.');
                    // Update stat card to show error
                    setStatsData(prevStats => prevStats.map(stat =>
                        stat.name === 'Pending Reviews'
                            ? { ...stat, value: 'Error', trend: 'Failed to load' }
                            : stat
                    ));
                }
                // Error 401 will be handled by axios interceptor (redirect to login)
            } finally {
                setIsLoading(false);
            }
        };
        fetchPendingData();
    }, []); // Empty dependency array means run once on mount


    return (
        <div className="space-y-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Verification Dashboard</h1>
                <p className="text-gray-500">Verify and audit carbon credit issuance</p>
            </header>

            {/* 1. Stats Cards (Now uses state 'statsData') */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {statsData.map((stat, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between min-h-[150px]">
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-500 flex items-center">
                                {stat.name}
                            </p>
                            <div className={`p-2 rounded-full bg-opacity-10 ${stat.iconColor.replace('text-', 'bg-')}`}>
                                <RenderIcon name={stat.icon} className={`h-6 w-6 ${stat.iconColor}`} />
                            </div>
                        </div>
                        <p className={`text-4xl font-extrabold text-gray-900 mt-2 ${stat.value === 'Error' ? 'text-red-500' : ''}`}>
                            {stat.value}
                        </p>
                        {stat.name === 'Accuracy Rate' ? (
                            <div className="mt-3">
                                <p className="text-sm text-green-600 font-semibold">{stat.trend}</p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                    <div className={`bg-purple-600 h-2.5 rounded-full ${stat.barWidth}`}></div>
                                </div>
                            </div>
                        ) : (
                            <p className={`text-xs mt-3 ${stat.value === 'Error' ? 'text-red-500' :
                                    stat.trend.includes('+') ? 'text-green-500' :
                                        stat.trend.includes('-') ? 'text-red-500' : 'text-gray-500'
                                }`}>
                                {stat.trend}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* 2. Pending Verifications & Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- Pending Requests Block --- */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg flex flex-col space-y-6">
                    {/* Card Header */}
                    <div>
                        <div className="flex items-center space-x-2">
                            <Shield className="h-6 w-6 text-gray-500" />
                            <h2 className="text-xl font-semibold text-gray-800">Pending Verifications</h2>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Credit issuance requests awaiting review</p>
                    </div>

                    {/* Loading State */}
                    {isLoading && <div className="text-center text-gray-500 py-4">Loading...</div>}

                    {/* Error State */}
                    {error && <div className="text-center text-red-500 py-4">{error}</div>}

                    {/* Display List (slice(0, 3)) */}
                    {!isLoading && !error && pendingRequests.slice(0, 3).map(req => (
                        // IMPORTANT: Adjust fields below (req.xxx) to match your CarbonCreditDTO
                        <div key={req.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    {/* Example: Display User info (adjust based on your DTO) */}
                                    <p className="font-semibold text-gray-900">{req.journey?.user?.fullName || req.userName || req.id}</p>
                                    <p className="text-sm text-gray-500">{req.journey?.vehicle?.model || req.vehicleModel || 'Unknown Category'}</p>
                                </div>
                                <div className="text-right">
                                    {/* Example: Display Credit amount & CO2 (adjust based on your DTO) */}
                                    <p className="text-lg font-bold text-gray-900">{req.amount || 0} credits</p>
                                    <p className="text-sm text-gray-500">{req.journey?.co2ReducedKg ? `${req.journey.co2ReducedKg.toFixed(2)} kg CO2` : 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 mt-3">
                                {/* Use StatusBadge based on req.status */}
                                <StatusBadge status={req.status} />
                                {/* Documents count might not be in DTO, remove if needed */}
                                {/* <span className="text-xs text-gray-500">{req.documents} documents</span> */}
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">
                                Submitted: {req.createdAt ? new Date(req.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                            </p>

                            {/* Approve/Reject Buttons (Disabled on dashboard) */}
                            <div className="flex items-center space-x-3 mt-4 opacity-50 pointer-events-none" title="Review details on the Pending Verifications page">
                                <button className="flex items-center justify-center w-1/2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium">
                                    <XCircle className="h-4 w-4 mr-1.5" /> Reject
                                </button>
                                <button className="flex items-center justify-center w-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium">
                                    <CheckCircle className="h-4 w-4 mr-1.5" /> Approve
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* "See more" Link */}
                    {!isLoading && !error && pendingRequests.length > 3 && (
                        <Link
                            to="/cva/pending" // Link to the Pending Verifications page route
                            className="w-full text-center py-2 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-purple-600 font-semibold transition focus:outline-none focus:ring-2 focus:ring-purple-300"
                        >
                            See all pending requests ({pendingRequests.length})
                        </Link>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && pendingRequests.length === 0 && (
                        <div className="text-center text-gray-500 py-4">No pending requests found.</div>
                    )}
                </div>

                {/* --- Analytics Chart Block (Uses Mock Data) --- */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800">Verification Analytics</h2>
                    <p className="text-sm text-gray-500 mb-4">Monthly verification activity</p>
                    <div className="h-96"> {/* Ensure chart has height */}
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
                            >
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', borderColor: '#e5e7eb' }} />
                                <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                                <Bar dataKey="verified" fill="#22c55e" name="Verified" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="pending" fill="#f97316" name="Pending" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;