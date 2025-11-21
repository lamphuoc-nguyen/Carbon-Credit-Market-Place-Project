import React, { useState, useEffect, useCallback } from 'react';
import { transactionApi } from '../../api/transactionApi'; // Import API của bạn
import {
    FileText,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Eye
} from 'lucide-react';
import ConfirmationModal from '../ConfirmationModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Helper Components ---

/**
 * 1. StatusBadge: Hiển thị trạng thái giao dịch
 */
const StatusBadge = ({ status }) => {
    let config = {
        color: 'bg-gray-100 text-gray-700',
        icon: FileText,
        text: 'Unknown',
    };
    const upperStatus = status ? status.toUpperCase() : 'UNKNOWN';

    switch (upperStatus) {
        case 'COMPLETED':
            config = { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Completed' };
            break;
        case 'PENDING':
            config = { color: 'bg-yellow-100 text-yellow-700', icon: RotateCcw, text: 'Pending' };
            break;
        case 'CANCELLED':
            config = { color: 'bg-red-100 text-red-700', icon: XCircle, text: 'Cancelled' };
            break;
        case 'DISPUTED':
            config = { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle, text: 'Disputed' };
            break;
    }
    const Icon = config.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.text}
        </span>
    );
};

/**
 * 2. Pagination: Component phân trang
 */
const Pagination = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between mt-4">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
            </button>
            <span className="text-sm text-gray-700">
                Page <span className="font-medium">{page + 1}</span> of <span className="font-medium">{totalPages}</span>
            </span>
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page + 1 >= totalPages}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
            </button>
        </div>
    );
};


// --- MAIN COMPONENT ---

const TransactionManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({});

    // Helper định dạng ngày
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Hàm tải dữ liệu (chỉ có thể tải các giao dịch bị tranh chấp)
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Chỉ gọi API duy nhất mà Admin có thể dùng để lấy list
            const response = await transactionApi.getDisputedTransactions(page, 10);

            setTransactions(response.content || []);
            setTotalPages(response.totalPages || 0);
        } catch (err) {
            console.error("Failed to fetch disputed transactions:", err);
            setError(err.message || `Failed to fetch transactions.`);
            setTransactions([]);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    }, [page]); // Tải lại khi 'page' thay đổi

    // Effect để tải dữ liệu
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Hàm thay đổi trang
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    // --- Hàm xử lý Actions ---

    // "Phê duyệt" (Approve) một tranh chấp -> Hoàn thành giao dịch
    const handleApprove = (txId) => {
        setModalConfig({
            title: 'Approve Transaction',
            message: 'Are you sure you want to approve and force-complete this disputed transaction?',
            confirmText: 'Approve',
            isDangerous: false,
            onConfirm: async () => {
                try {
                    await transactionApi.completeTransaction(txId);
                    toast.success('Transaction approved and marked as COMPLETED.');
                    fetchData();
                } catch (err) {
                    toast.error(`Failed to approve transaction: ${err.message}`);
                }
            }
        });
        setShowModal(true);
    };

    // "Hủy" (Cancel) một tranh chấp -> Hủy giao dịch
    const handleCancel = (txId) => {
        setModalConfig({
            title: 'Cancel Transaction',
            message: 'Are you sure you want to cancel this disputed transaction?',
            confirmText: 'Cancel Transaction',
            isDangerous: true,
            onConfirm: async () => {
                try {
                    await transactionApi.cancelTransaction(txId);
                    toast.success('Transaction cancelled and marked as CANCELLED.');
                    fetchData();
                } catch (err) {
                    toast.error(`Failed to cancel transaction: ${err.message}`);
                }
            }
        });
        setShowModal(true);
    };


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                    Dispute Management
                </h1>
                <p className="text-gray-500 mt-1">
                    Review, approve, or cancel disputed transactions.
                </p>
            </header>

            {/* Bảng dữ liệu */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-6 text-center text-gray-500">Loading disputed transactions...</div>
                ) : error ? (
                    <div className="p-6 text-center text-red-500">Error: {error}</div>
                ) : transactions.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No disputed transactions found.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Disputed</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((tx) => (
                                <tr key={tx.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500" title={tx.id}>
                                        {tx.id.substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(tx.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{tx.listing?.credit?.user?.username || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{tx.buyer?.username || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(tx.totalPrice || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {/* Tất cả đều sẽ là DISPUTED */}
                                        <StatusBadge status={tx.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        {/* Hành động giải quyết tranh chấp */}
                                        <button
                                            onClick={() => handleApprove(tx.id)}
                                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                                            title="Approve (Force Complete)"
                                        >
                                            <CheckCircle className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleCancel(tx.id)}
                                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                                            title="Cancel Transaction"
                                        >
                                            <XCircle className="h-5 w-5" />
                                        </button>
                                        <button
                                            className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                                            title="View Details (Not Implemented)"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {!isLoading && transactions.length > 0 && (
                    <div className="p-4 border-t border-gray-200">
                        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>
            
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                isDangerous={modalConfig.isDangerous}
            />
            
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