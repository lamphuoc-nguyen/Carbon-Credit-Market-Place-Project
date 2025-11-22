import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowRightLeft, Calendar, CheckCircle, XCircle, Clock,
    Leaf, TrendingUp, Eye
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { cvaApi } from '../../api/cvaApi';

const TransferRequestManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [statistics, setStatistics] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (location.state?.successMessage) {
            toast.success(location.state.successMessage);
            // Clear the state to prevent showing toast on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [requests, stats] = await Promise.all([
                cvaApi.getPendingTransferRequests(),
                cvaApi.getTransferStatistics()
            ]);
            setPendingRequests(requests || []);
            setStatistics(stats || {});
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

    return (
        <div className="space-y-6">
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
            />
            {/* Header Stats (Giữ nguyên như cũ) */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">CO2 Transfer Requests</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg flex justify-between items-center border border-yellow-100">
                        <div><p className="text-sm text-yellow-900">Pending</p><p className="text-2xl font-bold text-yellow-700">{statistics.pendingTransfers || pendingRequests.length}</p></div>
                        <Clock className="text-yellow-600 w-8 h-8" />
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg flex justify-between items-center border border-green-100">
                        <div><p className="text-sm text-green-900">Approved</p><p className="text-2xl font-bold text-green-700">{statistics.approvedTransfers || 0}</p></div>
                        <CheckCircle className="text-green-600 w-8 h-8" />
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg flex justify-between items-center border border-red-100">
                        <div><p className="text-sm text-red-900">Rejected</p><p className="text-2xl font-bold text-red-700">{statistics.rejectedTransfers || 0}</p></div>
                        <XCircle className="text-red-600 w-8 h-8" />
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center border border-blue-100">
                        <div><p className="text-sm text-blue-900">Total Processed</p><p className="text-2xl font-bold text-blue-700">{statistics.totalTransfers || 0}</p></div>
                        <TrendingUp className="text-blue-600 w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* List Requests */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b"><h3 className="text-lg font-semibold">Pending List</h3></div>
                <div className="p-6 space-y-4">
                    {pendingRequests.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No pending requests found.</div>
                    ) : (
                        pendingRequests.map((req) => (
                            <div key={req.id} className="border rounded-lg p-6 hover:bg-gray-50 flex flex-col md:flex-row justify-between items-start gap-4 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                            {(req.username || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-900">{req.requesterName || req.username}</span>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {formatDate(req.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center space-x-4">
                                        <div className="flex items-center text-green-600 font-bold bg-green-50 px-3 py-1 rounded-md">
                                            <Leaf className="w-4 h-4 mr-2" />
                                            {req.co2Amount?.toLocaleString()} kg
                                        </div>
                                        <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                                        <div className="flex items-center text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-md">
                                            <TrendingUp className="w-4 h-4 mr-2" />
                                            {req.creditsToGenerate} Credits
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2 w-full md:w-auto">
                                    <button
                                        onClick={() => navigate(`/cva/transfer-request/${req.id}`)}
                                        className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center transition-colors"
                                    >
                                        <Eye className="w-4 h-4 mr-2" /> View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransferRequestManagement;
