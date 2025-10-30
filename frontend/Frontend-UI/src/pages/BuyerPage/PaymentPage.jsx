import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer';
import { buyerApi } from '../../api';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Helper function to format price (hide .00 for whole numbers)
  const formatPrice = (price) => {
    return price % 1 === 0 ? price.toFixed(0) : price.toFixed(2);
  };
  
  // Get data from navigation state
  const { listing, quantity, totalPrice } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState('wallet'); // 'wallet', 'vnpay', or 'banking'
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    // Redirect if no listing data
    if (!listing) {
      navigate('/marketplace');
      return;
    }
    
    // Fetch wallet info
    fetchWalletInfo();
  }, [listing, navigate]);

  const fetchWalletInfo = async () => {
    try {
      const walletData = await buyerApi.getMyWallet();
      setWallet(walletData);
      console.log('✅ Wallet:', walletData);
    } catch (err) {
      console.error('❌ Error fetching wallet:', err);
      setError('Unable to load wallet information');
    }
  };

  const handlePaymentClick = () => {
    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setError(null);

    try {
      // Validate listing ID exists
      if (!listing || !listing.id) {
        throw new Error('Listing information is missing. Please go back and try again.');
      }

      console.log('=== PAYMENT CONFIRMATION ===');
      console.log('Listing ID:', listing.id);
      console.log('Listing ID Type:', typeof listing.id);
      console.log('Full Listing:', listing);
      console.log('Payment Method:', paymentMethod);
      console.log('Total Price:', totalPrice);
      console.log('Quantity:', quantity);

      if (paymentMethod === 'wallet') {
        // Check wallet balance
        console.log('Checking wallet balance...');
        const hasSufficientBalance = await buyerApi.checkSufficientBalance(totalPrice, 'CASH');
        console.log('Has sufficient balance:', hasSufficientBalance);
        
        if (!hasSufficientBalance) {
          setError('Insufficient balance in your wallet. Please top up or use online banking.');
          setLoading(false);
          return;
        }
      }

      // Step 1: Create transaction and process payment
      // Note: Backend automatically handles all payment methods including VNPAY
      // - WALLET: Deducts from buyer's wallet, adds to seller's wallet
      // - VNPAY: Does NOT deduct wallet (external payment already done), just completes transaction
      // - BANKING: Similar to VNPAY
      console.log('🔄 Calling API to create transaction...');
      console.log('API endpoint: POST /transactions/purchase');
      console.log('Request body:', { 
        listingId: listing.id, 
        paymentMethodId: paymentMethod.toUpperCase() 
      });
      
      // Call API to create transaction (backend will handle payment processing)
      const completedTransaction = await buyerApi.initiatePurchaseTransaction(
        listing.id, 
        paymentMethod.toUpperCase()
      );
      
      console.log('✅ Transaction API Response:', completedTransaction);
      console.log('Transaction ID:', completedTransaction.id);
      console.log('Transaction Status:', completedTransaction.status);
      console.log('Transaction Amount:', completedTransaction.amount);
      
      // Validate response
      if (!completedTransaction || !completedTransaction.id) {
        throw new Error('Invalid transaction response from server');
      }
      
      console.log('✅ Transaction created successfully!');
      
      // Prepare transaction data for certificate
      const transactionData = {
        transactionId: completedTransaction.id,
        certificateCode: completedTransaction.certificateCode || `CERT-${completedTransaction.id}`,
        co2ReducedKg: listing.credit?.co2ReducedKg || 0,
        amount: quantity,
        issueDate: completedTransaction.completedAt || new Date().toISOString(),
        buyerId: completedTransaction.buyer?.id || wallet?.userId,
        sellerId: completedTransaction.seller?.id || listing.credit?.owner?.id,
        buyerUsername: completedTransaction.buyer?.username || wallet?.username,
        sellerUsername: completedTransaction.seller?.username || listing.credit?.owner?.username,
        totalPrice: completedTransaction.amount || totalPrice,
        status: completedTransaction.status,
        creditId: listing.credit?.id,
        listingId: listing.id
      };
      
      console.log('📄 Transaction data for certificate:', transactionData);
      
      // Navigate to certificate page with transaction data
      console.log('🔄 Navigating to certificate page...');
      navigate('/certificate', { 
        state: { transactionData },
        replace: true // Prevent going back to payment page
      });
      
      console.log('✅ Navigation successful!');
      
    } catch (err) {
      console.error('=== PAYMENT ERROR ===');
      console.error('Error Type:', err.name);
      console.error('Error Message:', err.message);
      console.error('Full Error:', err);
      
      if (err.response) {
        console.error('HTTP Status:', err.response.status);
        console.error('Response Data:', err.response.data);
        console.error('Response Headers:', err.response.headers);
      } else if (err.request) {
        console.error('No Response Received');
        console.error('Request:', err.request);
      }
      
      // Display user-friendly error message
      let errorMessage = 'Payment failed. Please try again or contact support.';
      
      if (!err.response) {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      } else if (err.response.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (err.response.status === 404) {
        errorMessage = 'Listing not found or no longer available.';
      } else if (err.response.status === 400) {
        errorMessage = err.response.data?.message || err.response.data?.error || 'Invalid request. Please check your input.';
      } else if (err.response.status === 500) {
        errorMessage = err.response.data?.message || 'Server error. Please try again later.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setShowConfirmModal(false);
      
      console.error('Displayed Error:', errorMessage);
      console.error('===================');
    } finally {
      setLoading(false);
    }
  };

  if (!listing) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar_Buyer />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition cursor-pointer"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <p className="text-gray-600 mt-2">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select Payment Method</h2>
              
              {/* Wallet Payment */}
              <div
                onClick={() => setPaymentMethod('wallet')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition mb-4 ${
                  paymentMethod === 'wallet'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full border-2 mt-1 mr-3 flex items-center justify-center ${
                    paymentMethod === 'wallet' ? 'border-green-600' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'wallet' && (
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Carbon Wallet</h3>
                      <span className="text-sm text-green-600 font-semibold">Recommended</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Pay instantly using your Carbon Credit wallet balance
                    </p>
                    {wallet && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Available Balance:</span>
                          <span className="font-bold text-gray-900">
                            ${wallet.cashBalance?.toLocaleString() || '0.00'}
                          </span>
                        </div>
                        {wallet.cashBalance < totalPrice && (
                          <p className="text-xs text-red-600 mt-2">
                            ⚠️ Insufficient balance. Please top up or use online banking.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* VNPay Payment */}
              <div
                onClick={() => setPaymentMethod('vnpay')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition mb-4 ${
                  paymentMethod === 'vnpay'
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full border-2 mt-1 mr-3 flex items-center justify-center ${
                    paymentMethod === 'vnpay' ? 'border-orange-600' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'vnpay' && (
                      <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-2xl">🏦</span> VNPay
                      </h3>
                      <span className="text-sm text-orange-600 font-semibold">Fast & Secure</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Thanh toán nhanh chóng qua cổng thanh toán VNPay
                    </p>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <div className="px-3 py-1 bg-white rounded border border-orange-200 text-xs font-semibold text-orange-700">
                        VNPAY-QR
                      </div>
                      <div className="px-3 py-1 bg-white rounded border border-orange-200 text-xs font-semibold text-orange-700">
                        ATM Card
                      </div>
                      <div className="px-3 py-1 bg-white rounded border border-orange-200 text-xs font-semibold text-orange-700">
                        Visa/Master
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Online Banking */}
              <div
                onClick={() => setPaymentMethod('banking')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  paymentMethod === 'banking'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full border-2 mt-1 mr-3 flex items-center justify-center ${
                    paymentMethod === 'banking' ? 'border-blue-600' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'banking' && (
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Online Banking</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Pay securely via bank transfer or credit card
                    </p>
                    <div className="mt-3 flex gap-2">
                      <div className="px-3 py-1 bg-white rounded border border-gray-200 text-xs font-semibold">
                        VISA
                      </div>
                      <div className="px-3 py-1 bg-white rounded border border-gray-200 text-xs font-semibold">
                        Mastercard
                      </div>
                      <div className="px-3 py-1 bg-white rounded border border-gray-200 text-xs font-semibold">
                        Bank Transfer
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-fade-in">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-700 font-medium">{error}</p>
                    <button 
                      onClick={() => setError(null)}
                      className="text-sm text-red-600 hover:text-red-800 mt-2 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Listing Info */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Seller</p>
                <p className="font-semibold text-gray-900">
                  {listing.credit?.owner?.username || 'N/A'}
                </p>
              </div>

              {/* Order Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Credits:</span>
                  <span className="font-semibold text-green-600">{quantity} tonnes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price/tonne:</span>
                  <span className="font-semibold">${formatPrice(listing.price)}</span>
                </div>
                <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-center text-green-700 font-semibold">
                    ✓ Purchasing all available credits
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-green-600">${formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePaymentClick}
                disabled={loading || (paymentMethod === 'wallet' && wallet?.cashBalance < totalPrice)}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay $${totalPrice}`
                )}
              </button>

              {/* Security Note */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                  Secure payment - Your information is protected
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-16 w-16 text-green-600 mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600 text-center">
                Please wait while we create your transaction and process the payment...
              </p>
              <div className="mt-4 text-sm text-gray-500">
                This may take a few moments
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 ">Confirm Purchase</h2>
              <p className="text-gray-600">Please review your order before proceeding</p>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Seller:</span>
                  <span className="font-semibold text-gray-900">
                    {listing.credit?.owner?.username || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Credits:</span>
                  <span className="font-semibold text-green-600">{quantity} tonnes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per tonne:</span>
                  <span className="font-semibold text-gray-900">${formatPrice(listing.price)}</span>
                </div>
                <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-center text-green-700 font-semibold">
                    ✓ Purchasing all available credits
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold text-gray-900">
                    {paymentMethod === 'wallet' ? '💳 Carbon Wallet' : 
                     paymentMethod === 'vnpay' ? '🏦 VNPay' : 
                     '🏦 Online Banking'}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-600">${formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Balance Warning */}
            {paymentMethod === 'wallet' && wallet && wallet.cashBalance < totalPrice && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-4">
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ Insufficient wallet balance. Please use another payment method.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={loading || (paymentMethod === 'wallet' && wallet?.cashBalance < totalPrice)}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300 cursor-pointer transition"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Confirm & Pay'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
