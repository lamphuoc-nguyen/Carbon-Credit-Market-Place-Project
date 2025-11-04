import React, { useState, useEffect, useMemo } from 'react';
import { userApi } from '../../api/userApi'; // Import API của bạn
import {
    Users,
    Filter,
    Edit,
    Trash2,
    X,
    AlertTriangle,
    CheckCircle,
    UserCheck,
    Briefcase,
    Shield,
    DollarSign
} from 'lucide-react';

// --- Helper Components ---

/**
 * 1. RoleBadge: Hiển thị badge màu cho từng vai trò
 */
const RoleBadge = ({ role }) => {
    const roleConfig = {
        EV_OWNER: {
            icon: UserCheck,
            color: 'text-green-700 bg-green-100',
            label: 'EV Owner',
        },
        BUYER: {
            icon: DollarSign,
            color: 'text-blue-700 bg-blue-100',
            label: 'Buyer',
        },
        CVA: {
            icon: Briefcase,
            color: 'text-purple-700 bg-purple-100',
            label: 'Verifier',
        },
        ADMIN: {
            icon: Shield,
            color: 'text-red-700 bg-red-100',
            label: 'Admin',
        },
    };

    const config = roleConfig[role] || {
        icon: Users,
        color: 'text-gray-700 bg-gray-100',
        label: role,
    };
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </span>
    );
};

/**
 * 2. formatDate: Helper định dạng ngày
 */
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

/**
 * 3. UserEditModal: Modal để chỉnh sửa vai trò
 */
const UserEditModal = ({ user, isOpen, onClose, onSave }) => {
    const [newRole, setNewRole] = useState(user?.role || 'BUYER');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setNewRole(user.role);
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleSave = async () => {
        setIsSaving(true);
        // Chỉ gửi dữ liệu cần cập nhật (role)
        await onSave(user.id, { ...user, role: newRole });
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 transition-transform transform scale-100">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Edit User Role</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">User</label>
                        <p className="text-gray-900 font-medium">{user.fullName} ({user.email})</p>
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Change Role to:
                        </label>
                        <select
                            id="role"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="EV_OWNER">EV Owner</option>
                            <option value="BUYER">Buyer</option>
                            <option value="CVA">Verifier (CVA)</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || newRole === user.role}
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-400"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * 4. DeleteConfirmModal: Modal xác nhận xóa
 */
const DeleteConfirmModal = ({ user, isOpen, onClose, onConfirm }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen || !user) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        await onConfirm(user.id);
        setIsDeleting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="p-6 text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-800">Delete User?</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Are you sure you want to delete <span className="font-medium">{user.fullName}</span>?
                        This action cannot be undone.
                    </p>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-center space-x-4 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:bg-gray-400"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---

/**
 * 5. UserManagement: Trang quản lý User
 */
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterRole, setFilterRole] = useState('ALL');

    // State cho Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Tải dữ liệu
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // API này trả về một mảng UserDTO
                const data = await userApi.getAllUsers();
                setUsers(data);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                setError(err.message || 'Failed to fetch users.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Logic lọc (client-side)
    const filteredUsers = useMemo(() => {
        if (filterRole === 'ALL') {
            return users;
        }
        return users.filter(user => user.role === filterRole);
    }, [filterRole, users]);

    // Handlers cho Edit
    const handleOpenEdit = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
    };

    const handleSaveUser = async (userId, updatedData) => {
        try {
            // API trả về UserDTO đã cập nhật
            const savedUser = await userApi.updateUser(userId, updatedData);
            // Cập nhật lại list
            setUsers(prevUsers =>
                prevUsers.map(u => (u.id === userId ? savedUser : u))
            );
        } catch (err) {
            console.error("Failed to update user:", err);
            setError("Failed to update user. Please try again.");
        }
    };

    // Handlers cho Delete
    const handleOpenDelete = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDelete = () => {
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
    };

    const handleConfirmDelete = async (userId) => {
        try {
            await userApi.deleteUser(userId);
            // Xóa user khỏi list
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        } catch (err) {
            console.error("Failed to delete user:", err);
            setError("Failed to delete user. Please try again.");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Users className="h-8 w-8" />
                    User Management
                </h1>
                <p className="text-gray-500 mt-1">
                    Manage all EV Owners, Buyers, and Verifiers on the platform.
                </p>
            </header>

            {/* Toolbar: Filter */}
            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <label htmlFor="roleFilter" className="text-sm font-medium text-gray-700">
                        Filter by Role:
                    </label>
                    <select
                        id="roleFilter"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="EV_OWNER">EV Owners</option>
                        <option value="BUYER">Buyers</option>
                        <option value="CVA">Verifiers (CVA)</option>
                        <option value="ADMIN">Admins</option>
                    </select>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-6 text-center text-gray-500">Loading users...</div>
                ) : error ? (
                    <div className="p-6 text-center text-red-500">Error: {error}</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No users found for this filter.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email / Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined On</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-700">{user.email}</div>
                                        <div className="text-xs text-gray-500">@{user.username}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleOpenEdit(user)}
                                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                                            title="Edit Role"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenDelete(user)}
                                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                                            title="Delete User"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modals (Render ở đây) */}
            <UserEditModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEdit}
                onSave={handleSaveUser}
                user={selectedUser}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
                user={selectedUser}
            />
        </div>
    );
};

export default UserManagement;