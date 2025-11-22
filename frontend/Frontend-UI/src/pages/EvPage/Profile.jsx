import React, { useState, useRef, useEffect } from 'react';
import { Camera, User, Mail, Phone, Save, X, Edit2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EvOwnerAPI from '../../api/EvOwnerAPI';
import Navbar from '../../Components/EVComponents/Navbar';
import Footer from '../../Components/Footer';
import ConfirmationModal from '../../Components/ConfirmationModal';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
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
        toast.error(`Failed to load profile: ${error.response?.data?.message || error.message}`);
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
    setVehicleFormData({ vin: '', model: '', registrationDate: '' });
    setShowVehicleForm(false);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      // Validate full name
      if (!formData.fullName || formData.fullName.trim() === '') {
        toast.error('Name is required');
        return;
      }
      
      const trimmedName = formData.fullName.trim();
      
      // Check name length (2-100 characters)
      if (trimmedName.length < 2) {
        toast.error('Full name must be at least 2 characters');
        return;
      }
      
      if (trimmedName.length > 100) {
        toast.error('Full name must be less than 100 characters');
        return;
      }
      
      // Check if name contains only letters and spaces
      if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
        toast.error('Full name can only contain letters and spaces');
        return;
      }
      
      // Check for consecutive spaces
      if (/\s{2,}/.test(trimmedName)) {
        toast.error('Full name cannot contain consecutive spaces');
        return;
      }
      
      // Check for leading/trailing spaces (should be caught by trim, but double check)
      if (formData.fullName !== trimmedName) {
        toast.error('Full name cannot start or end with spaces');
        return;
      }
      
      // Validate email format
      if (formData.email && formData.email.trim() !== '') {
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
          toast.error('Invalid email address');
          return;
        }
        
        if (formData.email.length > 254) {
          toast.error('Email address is too long');
          return;
        }
        
        if (/\.{2,}/.test(formData.email)) {
          toast.error('Email cannot contain consecutive dots');
          return;
        }
        
        if (/^[.]|[.]@/.test(formData.email)) {
          toast.error('Email cannot start with a dot or have a dot before @');
          return;
        }
      }
      
      // Validate phone number format (Vietnamese format)
      if (formData.phone && formData.phone.trim() !== '') {
        const digitsOnly = formData.phone.replace(/\D/g, '');
        
        // Check if phone number contains only digits
        if (!/^[0-9]+$/.test(digitsOnly)) {
          toast.error('Phone number must contain digits only');
          return;
        }
        
        // Check if phone number starts with 0
        if (!digitsOnly.startsWith('0')) {
          toast.error('Phone number must start with 0');
          return;
        }
        
        // Check if exactly 10 digits
        if (digitsOnly.length !== 10) {
          toast.error('Phone number must be exactly 10 digits');
          return;
        }
        
        // Check valid Vietnamese prefixes (03, 05, 07, 08, 09)
        if (!/^(03|05|07|08|09)[0-9]{8}$/.test(digitsOnly)) {
          toast.error('Invalid phone number format. Must start with 03, 05, 07, 08, or 09 followed by 8 digits');
          return;
        }
      }
      
      // Validate vehicle data if form has any field filled
      if (vehicleFormData.vin || vehicleFormData.model || vehicleFormData.registrationDate) {
        // Check if all required fields are filled
        if (!vehicleFormData.vin || !vehicleFormData.model || !vehicleFormData.registrationDate) {
          toast.error('All vehicle fields are required (VIN, Model, Registration Date)');
          return;
        }
        
        // Validate VIN format (typically 17 characters, alphanumeric, no I, O, Q)
        const vinTrimmed = vehicleFormData.vin.trim().toUpperCase();
        if (vinTrimmed.length !== 17) {
          toast.error('VIN must be exactly 17 characters');
          return;
        }
        
        if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vinTrimmed)) {
          toast.error('Invalid VIN format. Must be 17 alphanumeric characters (excluding I, O, Q)');
          return;
        }
        
        // Validate model name
        const modelTrimmed = vehicleFormData.model.trim();
        if (modelTrimmed.length < 2) {
          toast.error('Vehicle model must be at least 2 characters');
          return;
        }
        
        if (modelTrimmed.length > 100) {
          toast.error('Vehicle model must be less than 100 characters');
          return;
        }
        
        if (!/^[a-zA-Z0-9\s-]+$/.test(modelTrimmed)) {
          toast.error('Vehicle model can only contain letters, numbers, spaces, and hyphens');
          return;
        }
        
        // Validate registration date
        const registrationDate = new Date(vehicleFormData.registrationDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (isNaN(registrationDate.getTime())) {
          toast.error('Invalid registration date');
          return;
        }
        
        if (registrationDate > today) {
          toast.error('Registration date cannot be in the future');
          return;
        }
        
        // Check if registration date is not too old (e.g., not before 1900)
        const minDate = new Date('1900-01-01');
        if (registrationDate < minDate) {
          toast.error('Registration date seems invalid (too old)');
          return;
        }
      }
      
      // Save profile data
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone
      };
      
      await EvOwnerAPI.user.updateProfile(formData.userId, updateData);
      
      // Save or update vehicle if form has data
      if (vehicleFormData.vin && vehicleFormData.model && vehicleFormData.registrationDate) {
        if (vehicles.length === 0) {
          // Create new vehicle
          await EvOwnerAPI.vehicles.createVehicle({
            userId: formData.userId,
            vin: vehicleFormData.vin,
            model: vehicleFormData.model,
            registrationDate: vehicleFormData.registrationDate,
            createdAt: new Date().toISOString()
          });
          
          // Refresh vehicles list
          await fetchMyVehicles();
          
          // Reset vehicle form
          setVehicleFormData({ vin: '', model: '', registrationDate: '' });
        }
      }
      
      setOriginalData({ ...formData });
      setIsEditing(false);
      setShowVehicleForm(false);
      
      // Trigger event to refresh Navbar
      window.dispatchEvent(new Event('userProfileUpdated'));
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(`Failed to update profile: ${error.response?.data?.message || error.message}`);
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

  const handleDeleteVehicle = (vehicleId) => {
    setVehicleToDelete(vehicleId);
    setShowDeleteModal(true);
  };

  const confirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    try {
      console.log('🚗 Deleting vehicle...');
      await EvOwnerAPI.vehicles.deleteVehicle(vehicleToDelete);
      console.log('✅ Vehicle deleted successfully');
      
      // Refresh vehicles list
      await fetchMyVehicles();
      
      toast.success('Vehicle deleted successfully!');
    } catch (error) {
      console.error('❌ Failed to delete vehicle:', error);
      toast.error(`Failed to delete vehicle: ${error.response?.data?.message || error.message}`);
    } finally {
      setVehicleToDelete(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
      {loading ? (
        <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Public profile</h1>
          </div>

          {/* Profile Container */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Form Fields */}
              <div className="lg:col-span-2 space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 text-sm transition-all ${
                  isEditing
                    ? 'border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                }`}
                placeholder="Enter your name"
              />
              
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Public email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`flex-1 px-3 py-2 bg-white border rounded-md text-gray-900 text-sm transition-all ${
                    isEditing
                      ? 'border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                  }`}
                  placeholder="Select a verified email"
                />
                {isEditing && (
                  <button
                    type="button"
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <X size={16} className="inline" /> Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                You can manage verified email addresses in your email settings.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 text-sm transition-all ${
                  isEditing
                    ? 'border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                }`}
                placeholder="Enter your phone number"
              />
            </div>

            {/* Username - Read only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm cursor-not-allowed opacity-60"
              />
              <p className="text-xs text-gray-500 mt-2">Username cannot be changed</p>
            </div>

            {/* Role Badge */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="inline-flex items-center px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm font-medium">
                {formData.role.replace('_', ' ')}
              </div>
            </div>

            {/* Vehicle Management Section */}
            <div className="pt-6 border-t border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">My Vehicles</h3>
                <p className="text-sm text-gray-600 mt-1">Manage your registered electric vehicles (Limit: 1)</p>
              </div>

              {/* Vehicle Form */}
              {(showVehicleForm || isEditing) && vehicles.length === 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Add New Vehicle
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        VIN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="vin"
                        value={vehicleFormData.vin}
                        onChange={handleVehicleInputChange}
                        required
                        disabled={!isEditing}
                        placeholder="e.g., 1HGBH41JXMN109186"
                        className={`w-full px-3 py-2 border rounded-md text-gray-900 text-sm ${
                          isEditing
                            ? 'bg-white border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500'
                            : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Model <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="model"
                        value={vehicleFormData.model}
                        onChange={handleVehicleInputChange}
                        required
                        disabled={!isEditing}
                        placeholder="e.g., Tesla Model 3"
                        className={`w-full px-3 py-2 border rounded-md text-gray-900 text-sm ${
                          isEditing
                            ? 'bg-white border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500'
                            : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Registration Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="registrationDate"
                        value={vehicleFormData.registrationDate}
                        onChange={handleVehicleInputChange}
                        max={new Date().toISOString().split('T')[0]}
                        required
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md text-gray-900 text-sm ${
                          isEditing
                            ? 'bg-white border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500'
                            : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Vehicle Display */}
              {vehicles.length > 0 && (
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{vehicles[0].model}</h4>
                      <p className="text-sm text-gray-600 mt-1">VIN: {vehicles[0].vin}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      Active
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm mt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registration Date:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(vehicles[0].registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                    {vehicles[0].createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Added:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(vehicles[0].createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleDeleteVehicle(vehicles[0].id)}
                        className="w-full px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}

              {vehicles.length === 0 && !showVehicleForm && !isEditing && (
                <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-4xl mb-2">🚗</div>
                  <p className="text-sm font-medium">No vehicles registered yet</p>
                  <p className="text-xs mt-1">Click Edit Profile to add your electric vehicle</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Profile Picture */}
          <div className="lg:col-span-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile picture
              </label>
              <div className="relative inline-block">
                <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                      <User className="w-32 h-32 text-white" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleImageClick}
                  className="absolute bottom-4 right-4 p-3 bg-white border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-lg flex items-center gap-2"
                  title="Edit profile picture"
                >
                  <Camera size={18} />
                  <span className="text-sm font-medium">Edit</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
            </div>
          </div>
          {/* End Profile Container */}
        </div>
      )}
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteVehicle}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
      />
      
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="light"
      />
      <Footer />
    </>
  );
};

export default ProfilePage;