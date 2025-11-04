import React, { useState, useRef, useEffect } from 'react';
import { Camera, User, Mail, Phone, Save, X, Edit2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EvOwnerAPI from '../../api/EvOwnerApi';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profileImage, setProfileImage] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [showVehicleForm, setShowVehicleForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [vehicleFormData, setVehicleFormData] = useState({
        vin: '',
        model: '',
        registrationDate: ''
    });
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        role: '',
        userId: ''
    });
    const [originalData, setOriginalData] = useState({ ...formData });
    const fileInputRef = useRef(null);

    // Fetch user profile on mount
    useEffect(() => {
        fetchUserProfile();
        fetchMyVehicles();
    }, [navigate]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);

            // Check if token exists before making API call
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

            if (!token) {
                console.warn('⚠️ No token found in storage, redirecting to login');
                navigate('/login');
                return;
            }

            console.log('🔍 Token found, fetching user profile...');
            const response = await EvOwnerAPI.user.getProfile();

            // Handle different response structures
            const userData = response.data?.data || response.data || response;
            console.log('✅ User profile fetched:', userData);

            const profileData = {
                fullName: userData.fullName || '',
                username: userData.username || '',
                email: userData.email || '',
                phone: userData.phone || '',
                role: userData.role || '',
                userId: userData.id || userData.userId || ''
            };

            setFormData(profileData);
            setOriginalData(profileData);
        } catch (error) {
            console.error('❌ Failed to fetch profile:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            // Only redirect to login for authentication errors
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.warn('🔐 Authentication failed, redirecting to login');
                navigate('/login');
            } else {
                // For other errors, show error but don't redirect
                console.error('⚠️ API error, but not redirecting:', error);
                alert(`Failed to load profile: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEdit = () => {
        setOriginalData({ ...formData });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData({ ...originalData });
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            // Only send fullName for update
            const updateData = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone
            };

            await EvOwnerAPI.user.updateProfile(formData.userId, updateData);

            setOriginalData({ ...formData });
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    const fetchMyVehicles = async () => {
        try {
            console.log('🚗 Fetching user vehicles...');
            const response = await EvOwnerAPI.vehicles.getMyVehicles();
            const vehicleData = response.data?.data || response.data || [];
            console.log('✅ Vehicles fetched:', vehicleData);
            setVehicles(Array.isArray(vehicleData) ? vehicleData : []);
        } catch (error) {
            console.error('❌ Failed to fetch vehicles:', error);
            setVehicles([]);
        }
    };

    const handleVehicleInputChange = (e) => {
        setVehicleFormData({
            ...vehicleFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateVehicle = async (e) => {
        e.preventDefault();

        // Check if user already has a vehicle
        if (vehicles.length >= 1) {
            alert('You can only have one vehicle. Please delete your existing vehicle first.');
            return;
        }

        try {
            console.log('🚗 Creating vehicle...');
            const vehicleData = {
                userId: formData.userId,
                vin: vehicleFormData.vin,
                model: vehicleFormData.model,
                registrationDate: vehicleFormData.registrationDate,
                createdAt: new Date().toISOString() // Add current date/time
            };

            await EvOwnerAPI.vehicles.createVehicle(vehicleData);
            console.log('✅ Vehicle created successfully');

            // Reset form and close modal
            setVehicleFormData({ vin: '', model: '', registrationDate: '' });
            setShowVehicleForm(false);

            // Refresh vehicles list
            await fetchMyVehicles();

            alert('Vehicle created successfully!');
        } catch (error) {
            console.error('❌ Failed to create vehicle:', error);
            alert(`Failed to create vehicle: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEditVehicle = (vehicle) => {
        setEditingVehicle(vehicle);
        setVehicleFormData({
            vin: vehicle.vin,
            model: vehicle.model,
            registrationDate: vehicle.registrationDate
        });
        setShowVehicleForm(true);
    };

    const handleUpdateVehicle = async (e) => {
        e.preventDefault();

        try {
            console.log('🚗 Updating vehicle...');
            const vehicleData = {
                vin: vehicleFormData.vin,
                model: vehicleFormData.model,
                registrationDate: vehicleFormData.registrationDate
            };

            await EvOwnerAPI.vehicles.updateVehicle(editingVehicle.id, vehicleData);
            console.log('✅ Vehicle updated successfully');

            // Reset form and close modal
            setVehicleFormData({ vin: '', model: '', registrationDate: '' });
            setEditingVehicle(null);
            setShowVehicleForm(false);

            // Refresh vehicles list
            await fetchMyVehicles();

            alert('Vehicle updated successfully!');
        } catch (error) {
            console.error('❌ Failed to update vehicle:', error);
            alert(`Failed to update vehicle: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteVehicle = async (vehicleId) => {
        if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
            try {
                console.log('🚗 Deleting vehicle...');
                await EvOwnerAPI.vehicles.deleteVehicle(vehicleId);
                console.log('✅ Vehicle deleted successfully');

                // Refresh vehicles list
                await fetchMyVehicles();

                alert('Vehicle deleted successfully!');
            } catch (error) {
                console.error('❌ Failed to delete vehicle:', error);
                alert(`Failed to delete vehicle: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            {loading ? (
                <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading profile...</p>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {/* Cover Image */}
                        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

                        {/* Profile Section */}
                        <div className="px-8 pb-8">
                            {/* Profile Picture */}
                            <div className="flex justify-between items-start -mt-16 mb-8">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                                                <User className="w-16 h-16 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleImageClick}
                                        className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
                                    >
                                        <Camera size={18} />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 mt-20">
                                    {!isEditing ? (
                                        <button
                                            onClick={handleEdit}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                        >
                                            <Edit2 size={18} />
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleCancel}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                            >
                                                <X size={18} />
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                                            >
                                                <Save size={18} />
                                                Save Changes
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Role Badge */}
                            <div className="mb-8">
                                <span className="inline-flex items-center px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                    {formData.role.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <User size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full pl-12 pr-4 py-3 border rounded-lg text-gray-900 transition-all ${isEditing
                                                    ? 'border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            @
                                        </div>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            disabled
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                                </div>

                                {/* Email & Phone Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Mail size={20} />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className={`w-full pl-12 pr-4 py-3 border rounded-lg text-gray-900 transition-all ${isEditing
                                                        ? 'border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Phone size={20} />
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className={`w-full pl-12 pr-4 py-3 border rounded-lg text-gray-900 transition-all ${isEditing
                                                        ? 'border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Management Section */}
                    <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">My Vehicles</h2>
                                <p className="text-sm text-gray-600 mt-1">Manage your registered electric vehicles</p>
                            </div>
                            {vehicles.length === 0 ? (
                                <button
                                    onClick={() => setShowVehicleForm(!showVehicleForm)}
                                    className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                >
                                    {showVehicleForm ? 'Cancel' : '+ Add Vehicle'}
                                </button>
                            ) : (
                                <div className="px-6 py-2.5 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed">
                                    + Add Vehicle (Limit: 1)
                                </div>
                            )}
                        </div>

                        {/* Vehicle Form */}
                        {showVehicleForm && (
                            <form onSubmit={editingVehicle ? handleUpdateVehicle : handleCreateVehicle} className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-blue-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    {/* VIN */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            VIN <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="vin"
                                            value={vehicleFormData.vin}
                                            onChange={handleVehicleInputChange}
                                            required
                                            placeholder="e.g., 1HGBH41JXMN109186"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Model */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Model <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="model"
                                            value={vehicleFormData.model}
                                            onChange={handleVehicleInputChange}
                                            required
                                            placeholder="e.g., Tesla Model 3"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Registration Date */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Registration Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="registrationDate"
                                            value={vehicleFormData.registrationDate}
                                            onChange={handleVehicleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowVehicleForm(false);
                                            setEditingVehicle(null);
                                            setVehicleFormData({ vin: '', model: '', registrationDate: '' });
                                        }}
                                        className="flex-1 px-4 py-3 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                                    >
                                        {editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Vehicles List */}
                        {vehicles.length > 0 ? (
                            <div>
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-blue-700">
                                        <span className="font-medium">Vehicle Limit:</span>
                                        <span>{vehicles.length}/1</span>
                                        <span className="text-blue-600">• Maximum 1 vehicle allowed per user</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {vehicles.map((vehicle) => (
                                        <div
                                            key={vehicle.id}
                                            className="p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{vehicle.model}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">VIN: {vehicle.vin}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                    Active
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Registration Date:</span>
                                                    <span className="font-medium text-gray-900">
                                                        {new Date(vehicle.registrationDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {vehicle.createdAt && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Added:</span>
                                                        <span className="font-medium text-gray-900">
                                                            {new Date(vehicle.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => handleEditVehicle(vehicle)}
                                                    className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                                    className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-6xl mb-4">🚗</div>
                                <p className="text-lg font-medium">No vehicles registered yet</p>
                                <p className="text-sm mt-2">Add your first electric vehicle to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;