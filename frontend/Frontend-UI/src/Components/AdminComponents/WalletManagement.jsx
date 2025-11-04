import React, { useState, useEffect, useMemo } from 'react';
import { userApi } from '../../api/userApi';         // Cần để lấy danh sách user
import { walletApi } from '../../api/walletApi';     // API bạn vừa cung cấp
import {
    Users,
    DollarSign,
    Database,
    SlidersHorizontal,
    X,
    TrendingUp,
    TrendingDown,
    Loader2,
    UserCheck,
    Briefcase,
    Shield
} from 'lucide-react';

// --- Helper Components ---

/**
 * 1. RoleBadge: Hiển thị badge màu cho từng vai trò
 */
const RoleBadge = ({ role }) => {
    const roles = {
        EV_OWNER: { label: 'EV Owner', color: 'text-green-700 bg-green-100', icon: UserCheck },
        BUYER: { label: 'Buyer', color: 'text-blue-700 bg-blue-100', icon: DollarSign },
        CVA: { label: 'Verifier', color: 'text-purple-700 bg-purple-100', icon: Briefcase },
        ADMIN: { label: 'Admin', color: 'text-red-700 bg-red-100', icon: Shield },
    };

    const config = roles[role] || {
        label: role,
        color: 'text-gray-700 bg-gray-100',
        icon: Users
    };
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </span>
    );
};

/**
 * 2. WalletBalanceCell: Component con tự fetch số dư cho mỗi hàng
 */
const WalletBalanceCell = ({ userId, onAdjust }) => {
    const [wallet, setWallet] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWallet = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                // Admin gọi API để lấy ví của user cụ thể
                const data = await walletApi.getUserWallet(userId);
                setWallet(data);
            } catch (err) {
                console.error(`Failed to fetch wallet for user ${userId}:`, err);
                setWallet(null); // Đặt là null khi lỗi
            } finally {
                setIsLoading(false);
            }
        };
        fetchWallet();
    }, [userId]); // Fetch lại nếu userId thay đổi

    if (isLoading) {
        return (
            <td colSpan="3" className="px-6 py-4 text-center">
                <div className="flex justify-center items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
            </td>
        );
    }

    if (!wallet) {
        return (
            <td colSpan="3" className="px-6 py-4 text-sm text-red-500 text-center">
                Error loading wallet
            </td>
        );
    }

    // Hiển thị số dư và nút Adjust
    return (
        <>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900">
                    ${(wallet.cashBalance || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Cash Balance</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-green-700">
                    {(wallet.creditBalance || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Credit Balance</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
                <button
                    onClick={() => onAdjust(wallet)} // Gửi toàn bộ thông tin ví
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Adjust
                </button>
            </td>
        </>
    );
};


/**
 * 3. AdjustBalanceModal: Modal để điều chỉnh số dư
 */
const AdjustBalanceModal = ({ wallet, isOpen, onClose, onSave }) => {
    const [cashAmount, setCashAmount] = useState(0);
    const [creditAmount, setCreditAmount] = useState(0);
    const [reason, setReason] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen || !wallet) return null;

    const handleSave = async () => {
        if (!reason) {
            alert('A reason is required for balance adjustments.');
            return;
        }
        if (cashAmount === 0 && creditAmount === 0) {
            alert('Please enter an amount to adjust.');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(wallet.userId, {
                cashAmount: Number(cashAmount),
                creditAmount: Number(creditAmount),
                reason: reason
            });
            // Reset form và đóng modal
            onClose();
            setCashAmount(0);
            setCreditAmount(0);
            setReason('');
        } catch (err) {
            console.error("Failed to save adjustment:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Adjust Wallet Balance</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-sm text-gray-500">User</p>
                        <p className="font-medium text-gray-900">{wallet.username}</p>
                    </div>

                    {/* Cash Adjustment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Cash Adjustment (Current: ${wallet.cashBalance.toLocaleString()})
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                value={cashAmount}
                                onChange={(e) => setCashAmount(e.target.value)}
                                className="block w-full pl-7 pr-12 py-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., -50 or 100"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                {cashAmount > 0 ? <TrendingUp className="h-5 w-5 text-green-500" /> : cashAmount < 0 ? <TrendingDown className="h-5 w-5 text-red-500" /> : null}
                            </div>
                        </div>
                    </div>

                    {/* Credit Adjustment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Credit Adjustment (Current: {wallet.creditBalance.toLocaleString()})
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Database className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(e.target.value)}
                                className="block w-full pl-10 pr-12 py-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., -10 or 25"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                {creditAmount > 0 ? <TrendingUp className="h-5 w-5 text-green-500" /> : creditAmount < 0 ? <TrendingDown className="h-5 w-5 text-red-500" /> : null}
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                            Reason (Required)
                        </label>
                        <input
                            id="reason"
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Refund for TX-123 or Bonus credit"
                        />
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                    <button onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !reason || (cashAmount == 0 && creditAmount == 0)}
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isSaving ? 'Saving...' : 'Apply Adjustment'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---

const WalletManagement = () => {
    // State lưu danh sách user đã được lọc ban đầu
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterRole, setFilterRole] = useState('ALL');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState(null);

    // Key để force-refresh toàn bộ data
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // 1. Tải TẤT CẢ user từ API
                const allUsers = await userApi.getAllUsers();

                // 2. Lọc ngay lập tức để chỉ giữ lại EV_OWNER và BUYER
                const relevantUsers = allUsers.filter(user =>
                    user.role === 'EV_OWNER' || user.role === 'BUYER'
                );

                // 3. Set state chỉ với những user liên quan
                setUsers(relevantUsers);

            } catch (err) {
                console.error("Failed to fetch users:", err);
                setError(err.message || 'Failed to fetch users.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, [refreshKey]); // Chạy lại khi 'refreshKey' thay đổi

    // Lọc user phía client dựa trên dropdown
    const filteredUsers = useMemo(() => {
        if (filterRole === 'ALL') {
            return users; // 'users' đã được lọc ban đầu (EV_OWNER, BUYER)
        }
        return users.filter(user => user.role === filterRole);
    }, [filterRole, users]);

    // Mở modal
    const handleOpenModal = (walletData) => {
        setSelectedWallet(walletData);
        setIsModalOpen(true);
    };

    // Đóng modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedWallet(null);
    };

    // Xử lý lưu điều chỉnh
    const handleSaveAdjustment = async (userId, data) => {
        // Gọi API cập nhật
        await walletApi.updateUserBalance(userId, data);

        // Thay đổi 'refreshKey' để buộc toàn bộ component tải lại data mới
        // Điều này đảm bảo ô WalletBalanceCell hiển thị số dư mới nhất
        setRefreshKey(key => key + 1);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <DollarSign className="h-8 w-8" />
                    Wallet Management
                </h1>
                <p className="text-gray-500 mt-1">
                    Monitor and adjust EV Owner and Buyer wallet balances.
                </p>
            </header>

            {/* Toolbar: Filter (Đã cập nhật) */}
            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <label className="text-sm font-medium text-gray-700 mr-2">
                    Filter by Role:
                </label>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none sm:text-sm"
                >
                    <option value="ALL">All (Owners & Buyers)</option>
                    <option value="EV_OWNER">EV Owners</option>
                    <option value="BUYER">Buyers</option>
                </select>
            </div>

            {/* Bảng dữ liệu */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-6 text-center text-gray-500">Loading users...</div>
                ) : error ? (
                    <div className="p-6 text-center text-red-500">Error: {error}</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No users found.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cash Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit Balance</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RoleBadge role={user.role} />
                                    </td>

                                    {/* Component con tự fetch data ví */}
                                    <WalletBalanceCell
                                        key={refreshKey} // Dùng key để force refresh
                                        userId={user.id}
                                        onAdjust={handleOpenModal}
                                    />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            <AdjustBalanceModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveAdjustment}
                wallet={selectedWallet}
            />
        </div>
    );
};

export default WalletManagement;