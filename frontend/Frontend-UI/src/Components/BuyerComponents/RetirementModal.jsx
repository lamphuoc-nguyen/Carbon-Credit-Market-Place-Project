import React, { useState } from 'react';
import { X, Leaf, AlertCircle, CheckCircle, Loader, TreePine, Recycle } from 'lucide-react';
import { toast } from 'react-toastify';
import { buyerApi } from '../../api';


const RetirementModal = ({ isOpen, onClose, wallet, onSuccess }) => {
  const [formData, setFormData] = useState({
    amountToRetire: '',
    projectInfo: '',
    retirementPurpose: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Biến chứa tổng số credit từ wallet để retire
  const amountToRetireKg = wallet?.creditBalance || 0;

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      // Auto-fill amount with all available credits from wallet
      setFormData({
        amountToRetire: amountToRetireKg,
        projectInfo: '',
        retirementPurpose: ''
      });
      setErrors({});
      setSubmitError(null);
    } else {
      setFormData({
        amountToRetire: '',
        projectInfo: '',
        retirementPurpose: ''
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [isOpen, amountToRetireKg]);

  const validateForm = () => {
    const newErrors = {};

    // Validate amount - must equal wallet balance (retire all)
    const amount = parseFloat(formData.amountToRetire);
    const availableBalance = amountToRetireKg;
    
    if (!formData.amountToRetire) {
      newErrors.amountToRetire = 'Please enter the number of credits to retire';
    } else if (isNaN(amount) || amount <= 0) {
      newErrors.amountToRetire = 'Amount must be greater than 0';
    } else if (!Number.isInteger(amount)) {
      newErrors.amountToRetire = 'Amount must be a whole number (no decimals)';
    } else if (amount > availableBalance) {
      newErrors.amountToRetire = `Insufficient credits. Available: ${availableBalance} credits`;
    }

    // Validate project name (required)
    if (!formData.projectInfo || formData.projectInfo.trim() === '') {
      newErrors.projectInfo = 'Project name is required';
    } else if (formData.projectInfo.length > 200) {
      newErrors.projectInfo = 'Project name must not exceed 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user ID from wallet
      const userId = wallet?.userId;
      if (!userId) {
        toast.error('User ID not found. Please refresh the page.');
        throw new Error('User ID not found. Please refresh the page.');
      }

      // Prepare retirement data
      const retirementData = {
        userId: userId,
        amountToRetireKg: parseInt(amountToRetireKg), // Use variable from wallet.creditBalance
        projectInfo: formData.projectInfo.trim() || null,
        retirementPurpose: formData.retirementPurpose?.trim() || null
      };

      console.log('🌿 Submitting retirement:', retirementData);

      // Call API
      const response = await buyerApi.initiateRetirement(retirementData);

      console.log('✅ Retirement successful:', response);

      // Show success message with toast
      toast.success(
        `🌿 Retirement Successful! ${formData.amountToRetire} credits have been retired for "${formData.projectInfo}". Certificate is being generated and will be available shortly in your retirement history.`,
        {
          autoClose: 5000,
          position: "top-center"
        }
      );

      // Close modal and refresh wallet
      onClose();
      if (onSuccess) {
        onSuccess(response);
      }

    } catch (error) {
      console.error('❌ Retirement failed:', error);
      const errorMessage = error.message || 'Failed to retire credits. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const calculateImpact = () => {
    const amount = parseFloat(formData.amountToRetire);
    if (isNaN(amount) || amount <= 0) return null;

    return {
      co2: (amount * 1000).toFixed(0), // Each credit = 1000kg CO2
      trees: (amount * 45).toFixed(0),
      cars: (amount * 0.5).toFixed(1)
    };
  };

  const impact = calculateImpact();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all overflow-hidden">
        {/* Header - Compact */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Recycle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Retire Credits</h3>
                  <p className="text-green-200 text-sm">Offset carbon footprint</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Available Balance - Compact */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <p className="text-green-200 text-xs mb-0.5">Available Credits</p>
              <p className="text-2xl font-bold">{(wallet?.creditBalance || 0).toLocaleString()}</p>
              <p className="text-green-200 text-xs mt-0.5">
                ≈ {((wallet?.creditBalance || 0) * 1000).toLocaleString()} kg CO₂
              </p>
            </div>
          </div>
        </div>

        {/* Form - Compact */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            {/* Error Alert */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-red-900">Retirement Failed</h4>
                    <p className="text-xs text-red-700 mt-1">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Amount Display (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Credits to Retire (All Available)
              </label>
              <div className="relative">
                <Leaf className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                <input
                  type="text"
                  value={`${formData.amountToRetire} credits`}
                  readOnly
                  className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl font-semibold bg-gray-50 text-gray-800 cursor-not-allowed"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-600">
                💡 All available credits will be retired in this transaction
              </p>
            </div>

            {/* Project Name Input (Required) */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.projectInfo}
                onChange={(e) => handleChange('projectInfo', e.target.value)}
                placeholder="e.g., Solar Panel Installation 2024"
                maxLength="200"
                className={`w-full px-3 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-green-500 transition-all ${
                  errors.projectInfo 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-green-500'
                }`}
                disabled={isSubmitting}
              />
              {errors.projectInfo && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.projectInfo}</span>
                </p>
              )}
              <p className="mt-1.5 text-xs text-gray-600">
                📝 Enter the name of the sustainability project
              </p>
            </div>

            {/* Environmental Impact Preview - Compact */}
            {impact && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
                <div className="flex items-center space-x-1.5 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-sm text-green-900">Environmental Impact</h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="p-2 bg-white rounded-lg inline-block mb-1">
                      <Recycle className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-lg font-bold text-green-900">{impact.co2}</p>
                    <p className="text-xs text-green-700">kg CO₂</p>
                  </div>
                  <div className="text-center">
                    <div className="p-2 bg-white rounded-lg inline-block mb-1">
                      <TreePine className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-lg font-bold text-green-900">{impact.trees}</p>
                    <p className="text-xs text-green-700">Trees</p>
                  </div>
                  <div className="text-center">
                    <div className="p-2 bg-white rounded-lg inline-block mb-1">
                      <Leaf className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-lg font-bold text-green-900">{impact.cars}</p>
                    <p className="text-xs text-green-700">Cars</p>
                  </div>
                </div>
              </div>
            )}       

            {/* Info Notice - Compact */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900">
                  <p className="font-semibold mb-1">Important</p>
                  <ul className="space-y-0.5 text-blue-800">
                    <li>• Credits deducted immediately</li>
                    <li>• Action is permanent</li>
                    <li>• Certificate ready in minutes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex space-x-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 border-2 border-gray-300 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.amountToRetire || !formData.projectInfo}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-sm hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 cursor-pointer transition-all shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Retiring...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Recycle className="w-4 h-4" />
                  <span>Retire Now</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RetirementModal;
