import React, { useState, useEffect, useMemo } from 'react';
import { userApi } from '../../api/userApi'; // Import API của bạn
import { authApi } from '../../api/authApi'; // Import authApi for registration
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    DollarSign,
    UserPlus,
    Eye,
    EyeOff
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 transition-opacity">
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
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:bg-gray-400"
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

    // Reset deleting state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setIsDeleting(false);
        }
    }, [isOpen]);

    if (!isOpen || !user) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onConfirm(user.id);
            // Only close on success
            onClose();
        } catch {
            // Error is already handled by parent, just reset button state
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
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

/**
 * 5. AddVerifierModal: Modal to add a new verifier
 */
const AddVerifierModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'CVA'
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal closes
            setFormData({
                fullName: '',
                email: '',
                username: '',
                phone: '',
                password: '',
                confirmPassword: '',
                role: 'CVA'
            });
            setErrors({});
            setShowPassword(false);
            setShowConfirmPassword(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10,15}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10-15 digits';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            setIsAdding(true);
            try {
                await onAdd({
                    fullName: formData.fullName,
                    email: formData.email,
                    username: formData.username,
                    phone: formData.phone,
                    password: formData.password,
                    role: formData.role
                });
                // If successful, onAdd will close the modal
                // No need to reset isAdding here as modal will unmount
            } catch (err) {
                // Display error in modal and reset button state
                const errorMessage = err.response?.data?.message || err.message || "Failed to add user. Please try again.";
                setErrors(prev => ({ ...prev, submit: errorMessage }));
                setIsAdding(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 my-8">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Add New User
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.fullName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter full name"
                        />
                        {errors.fullName && (
                            <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="CVA">Verifier (CVA)</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="verifier@example.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.username ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="username"
                        />
                        {errors.username && (
                            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0123456789"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Confirm password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm">{errors.submit}</p>
                        </div>
                    )}
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
                        onClick={handleSubmit}
                        disabled={isAdding}
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:bg-gray-400"
                    >
                        {isAdding ? 'Adding...' : 'Add User'}
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
    const [isAddVerifierModalOpen, setIsAddVerifierModalOpen] = useState(false);
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
        // Exclude ADMIN users from the list
        let filtered = users.filter(user => user.role !== 'ADMIN');
        
        if (filterRole === 'ALL') {
            return filtered;
        }
        return filtered.filter(user => user.role === filterRole);
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
            // Show success toast
            toast.success('User role updated successfully!');
            setError(null);
        } catch (err) {
            console.error("Failed to update user:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to update user. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
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
            // Backend now handles cascade deletion automatically
            await userApi.deleteUser(userId);
            
            // Refresh the user list from server to ensure consistency
            const updatedUsers = await userApi.getAllUsers();
            setUsers(updatedUsers);
            
            // Show success toast
            toast.success('User and all associated data deleted successfully!');
            setError(null);
        } catch (err) {
            console.error("Failed to delete user:", err);
            
            // Provide specific error messages
            let errorMessage = "Failed to delete user. Please try again.";
            
            if (err.response?.status === 403) {
                errorMessage = "You don't have permission to delete this user.";
            } else if (err.response?.status === 404) {
                errorMessage = "User not found.";
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            toast.error(errorMessage);
            
            // Re-throw to prevent modal from closing
            throw err;
        }
    };

    // Handlers cho Add Verifier
    const handleOpenAddVerifier = () => {
        setIsAddVerifierModalOpen(true);
    };

    const handleCloseAddVerifier = () => {
        setIsAddVerifierModalOpen(false);
    };

    const handleAddVerifier = async (verifierData) => {
        try {
            // Remove confirmPassword before sending to API
            // eslint-disable-next-line no-unused-vars
            const { confirmPassword, ...dataToSend } = verifierData;
            
            // Use authApi.register for new user registration
            await authApi.register(dataToSend);
            
            // Refresh the user list from the server
            const updatedUsers = await userApi.getAllUsers();
            setUsers(updatedUsers);
            
            // Show success toast
            toast.success('User added successfully!');
            
            // Close modal and clear error
            setIsAddVerifierModalOpen(false);
            setError(null);
        } catch (err) {
            console.error("Failed to add user:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to add user. Please try again.";
            setError(errorMessage);
            // Re-throw error to be handled by modal
            throw err;
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

            {/* Toolbar: Filter & Add Button */}
            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
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
                            
                        </select>
                    </div>
                    <button
                        onClick={handleOpenAddVerifier}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add User
                    </button>
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

            <AddVerifierModal 
                isOpen={isAddVerifierModalOpen}
                onClose={handleCloseAddVerifier}
                onAdd={handleAddVerifier}
            />

            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default UserManagement;