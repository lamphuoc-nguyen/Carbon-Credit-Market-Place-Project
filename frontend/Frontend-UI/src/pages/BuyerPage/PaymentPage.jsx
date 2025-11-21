import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer';
import Footer from '../../Components/Footer';
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

  // Pending transaction management
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [selectedPendingTransaction, setSelectedPendingTransaction] = useState(null);

  useEffect(() => {
    // Redirect if no listing data
    if (!listing) {
      navigate('/marketplace');
      return;
    }
    
    // Fetch wallet info and check for pending transactions
    fetchWalletInfo();
    checkPendingTransactions();
  }, [listing, navigate]);

  const fetchWalletInfo = async () => {
    try {
      console.log('🔄 Fetching wallet information...');
      console.log('🔍 API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:8080');

      // Comprehensive authentication debugging
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const user = localStorage.getItem('user') || sessionStorage.getItem('user');

      console.log('🔍 Authentication Debug:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPrefix: token?.substring(0, 20) + '...' || 'none',
        hasUser: !!user,
        userInfo: user ? JSON.parse(user) : null,
        localStorage: {
          authToken: !!localStorage.getItem('authToken'),
          user: !!localStorage.getItem('user')
        },
        sessionStorage: {
          authToken: !!sessionStorage.getItem('authToken'),
          user: !!sessionStorage.getItem('user')
        }
      });

      // Check if token is expired
      if (token) {
        try {
          const { decodeJWTPayload, isTokenExpired } = await import('../../utils/tokenUtils');
          const payload = decodeJWTPayload(token);
          const expired = isTokenExpired(token);

          console.log('🔍 Token Analysis:', {
            payload: payload,
            isExpired: expired,
            expiresAt: payload?.exp ? new Date(payload.exp * 1000).toISOString() : 'unknown',
            currentTime: new Date().toISOString()
          });

          if (expired) {
            setError('Your session has expired. Please login again.');
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
            return;
          }
        } catch (tokenError) {
          console.error('❌ Token analysis failed:', tokenError);
        }
      } else {
        setError('You are not logged in. Redirecting to login page...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      const walletData = await buyerApi.getMyWallet();
      setWallet(walletData);
      console.log('✅ Wallet loaded successfully:', walletData);
    } catch (err) {
      console.error('❌ Detailed wallet error:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers,
        requestData: err.config?.data,
        code: err.code,
        name: err.name
      });

      let errorMessage = 'Unable to load wallet information';

      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
        // Clear invalid auth data
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (err.response?.status === 404) {
        errorMessage = 'Wallet not found. Please contact support.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (!err.response) {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
        console.error('Network Error Details:', {
          message: err.message,
          code: err.code,
          errno: err.errno,
          syscall: err.syscall,
          address: err.address,
          port: err.port
        });
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Backend server is not responding. Please ensure the Spring Boot application is running on port 8080.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection and backend server status.';
      }

      setError(errorMessage);
    }
  };

  const checkPendingTransactions = async () => {
    try {
      console.log('🔍 Checking for pending transactions...');
      const pendingTxs = await buyerApi.getPendingTransactions();

      // Filter pending transactions for the current listing
      const relatedPending = pendingTxs.filter(tx =>
        tx.listingId === listing.id ||
        tx.listing?.id === listing.id
      );

      setPendingTransactions(relatedPending);

      if (relatedPending.length > 0) {
        console.log(`🕐 Found ${relatedPending.length} pending transaction(s) for this listing`);
        setShowPendingModal(true);
      }

    } catch (err) {
      console.error('❌ Error checking pending transactions:', err);
      // Don't show error to user for this background check
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

      // WALLET PAYMENT - Thanh toán trực tiếp qua ví
      if (paymentMethod === 'wallet') {
        console.log('💳 ========== WALLET PAYMENT FLOW ==========');
        
        // ✅ SỬ DỤNG API MỚI: purchaseWithWallet()
        // API này sẽ:
        // 1. Tạo transaction với paymentMethod = WALLET
        // 2. Kiểm tra số dư wallet
        // 3. Complete transaction → Backend tự động:
        //    - Trừ tiền từ wallet buyer
        //    - Cộng tiền vào wallet seller
        //    - Cộng carbon credit vào wallet buyer
        //    - Đóng listing
        //    - Chuyển ownership
        
        console.log('🔄 Calling purchaseWithWalletAmount API...');
        const completedTransaction = quantity === listing.credit?.creditAmount
          ? await buyerApi.purchaseWithWallet(listing.id)  // Buy all credits
          : await buyerApi.purchaseWithWalletAmount(listing.id, quantity, totalPrice); // Buy partial amount
        console.log('✅ Purchase completed with wallet:', completedTransaction);
        
        // Validate transaction response
        if (!completedTransaction || !completedTransaction.id) {
          throw new Error('Invalid transaction response from server');
        }

        // 3. Navigate to success page - NO AUTO RETIREMENT
        console.log('✅ Purchase completed! Navigating to success page...');
        navigate('/transaction-success', {
          state: {
            transactionData: {
              transactionId: completedTransaction.id,
              co2ReducedKg: Math.round((listing.credit?.co2ReducedKg || 1000) * (quantity / listing.credit?.creditAmount || 1)),
              amount: quantity,
              completedAt: completedTransaction.completedAt || new Date().toISOString(),
              buyerId: completedTransaction.buyerId,
              buyerUsername: completedTransaction.buyerUsername || wallet?.username,
              totalPrice: totalPrice,
              status: 'COMPLETED',
              paymentMethod: 'WALLET',
              creditId: listing.credit?.id,
              listingId: listing.id
            }
          },
          replace: true
        });

        return;
      }

      // VNPAY PAYMENT - Thanh toán qua cổng VNPay
      if (paymentMethod === 'vnpay') {
        console.log('🏦 VNPAY PAYMENT FLOW');
        
        // 1. Khởi tạo giao dịch và lấy VNPay payment URL
        console.log('🔄 Creating VNPay transaction...');
        const result = await buyerApi.initiatePurchaseTransaction(listing.id);
        
        console.log('✅ VNPay transaction created:', result);
        console.log('Transaction ID:', result.transactionId);
        console.log('Payment URL:', result.paymentUrl);
        
        // Validate response
        if (!result.transactionId || !result.paymentUrl) {
          throw new Error('Invalid VNPay response - missing transaction ID or payment URL');
        }
        
        // 2. Lưu transaction ID vào localStorage để check sau
        localStorage.setItem('pendingTransactionId', result.transactionId);
        localStorage.setItem('pendingListing', JSON.stringify(listing));
        
        // 3. Redirect đến VNPay payment gateway
        console.log('🔄 Redirecting to VNPay gateway...');
        window.location.href = result.paymentUrl;
        
        // Note: Sau khi thanh toán trên VNPay, user sẽ được redirect về:
        // - Success: /payment/success?transactionId=xxx
        // - Failed: /payment/failed?transactionId=xxx&code=xxx
        // - Error: /payment/error?reason=xxx
        return;
      }

      // BANKING PAYMENT - Thanh toán chuyển khoản (Coming soon)
      if (paymentMethod === 'banking') {
        setError('Online Banking payment is coming soon. Please use Wallet or VNPay.');
        setLoading(false);
        return;
      }
      
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

  const handleResumePendingTransaction = async (transaction) => {
    try {
      setLoading(true);
      setSelectedPendingTransaction(transaction);
      setShowPendingModal(false);

      if (transaction.paymentMethod?.includes('VNPAY') || transaction.paymentMethod?.includes('BANK')) {
        // Resume VNPay transaction
        console.log('🔄 Resuming VNPay transaction...');
        const result = await buyerApi.resumeVNPayTransaction(transaction.id);

        // Save transaction info for callback
        localStorage.setItem('pendingTransactionId', result.transactionId);
        localStorage.setItem('pendingListing', JSON.stringify(listing));

        // Redirect to VNPay
        window.location.href = result.paymentUrl;

      } else if (transaction.paymentMethod?.includes('WALLET')) {
        // Complete wallet transaction
        console.log('💰 Completing wallet transaction...');
        const completedTransaction = await buyerApi.completePendingWalletTransaction(transaction.id);

        // Navigate to success page
        navigate('/transaction-success', {
          state: {
            transactionData: {
              transactionId: completedTransaction.id,
              co2ReducedKg: Math.round((listing.credit?.co2ReducedKg || 1000) * (quantity / listing.credit?.creditAmount || 1)),
              amount: quantity,
              completedAt: completedTransaction.completedAt || new Date().toISOString(),
              buyerId: completedTransaction.buyerId,
              buyerUsername: completedTransaction.buyerUsername || wallet?.username,
              totalPrice: totalPrice,
              status: 'COMPLETED',
              paymentMethod: 'WALLET',
              creditId: listing.credit?.id,
              listingId: listing.id
            }
          },
          replace: true
        });
      }

    } catch (err) {
      console.error('❌ Error resuming transaction:', err);
      setError(err.message || 'Failed to resume transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPendingTransaction = async (transaction) => {
    try {
      setLoading(true);

      await buyerApi.cancelPendingTransaction(transaction.id, 'Cancelled by user in payment page');

      // Remove from pending list
      setPendingTransactions(prev => prev.filter(tx => tx.id !== transaction.id));

      // If no more pending transactions, close modal
      if (pendingTransactions.length <= 1) {
        setShowPendingModal(false);
      }

      console.log('✅ Transaction cancelled successfully');

    } catch (err) {
      console.error('❌ Error cancelling transaction:', err);
      setError(err.message || 'Failed to cancel transaction. Please try again.');
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
                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-1">Seller</p>
                  <p className="font-semibold text-gray-900">
                    {listing.credit?.owner?.username || 'N/A'}
                  </p>
                </div>
                {listing.sellerLocation && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                      {listing.sellerLocation.split('-').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}, Vietnam
                    </span>
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits Selected:</span>
                  <span className="font-semibold text-green-600">{quantity} tonnes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-semibold text-gray-600">{listing.credit?.creditAmount || 0} tonnes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per tonne:</span>
                  <span className="font-semibold">${formatPrice((listing.price || 0) / (listing.credit?.creditAmount || 1))}</span>
                </div>
                {quantity === listing.credit?.creditAmount ? (
                  <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-center text-green-700 font-semibold">
                      ✓ Purchasing all available credits
                    </p>
                  </div>
                ) : (
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-center text-blue-700 font-semibold">
                      📋 Purchasing {quantity} out of {listing.credit?.creditAmount || 0} credits
                    </p>
                  </div>
                )}
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
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
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
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                {listing.sellerLocation && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-semibold text-gray-900">
                      {listing.sellerLocation.split('-').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}, Vietnam
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits Selected:</span>
                  <span className="font-semibold text-green-600">{quantity} tonnes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per tonne:</span>
                  <span className="font-semibold text-gray-900">${formatPrice((listing.price || 0) / (listing.credit?.creditAmount || 1))}</span>
                </div>
                {quantity === listing.credit?.creditAmount ? (
                  <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-center text-green-700 font-semibold">
                      ✓ Purchasing all available credits
                    </p>
                  </div>
                ) : (
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-center text-blue-700 font-semibold">
                      📋 Purchasing {quantity} out of {listing.credit?.creditAmount || 0} credits
                    </p>
                  </div>
                )}
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

      {/* Pending Transactions Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Transactions</h2>
              <p className="text-gray-600 text-sm">
                You have pending transactions for this listing. Please complete or cancel them before proceeding.
              </p>
            </div>

            {/* Transaction List */}
            <div className="max-h-60 overflow-y-auto mb-4">
              {pendingTransactions.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-4">
                  No pending transactions found.
                </p>
              ) : (
                pendingTransactions.map(tx => (
                  <div key={tx.id} className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">
                        Transaction ID: {tx.id}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <div className="flex-1 mb-3 sm:mb-0">
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold">Seller:</span> {tx.listing?.credit?.owner?.username || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold">Credits:</span> {tx.amount} tonnes
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold">Total Price:</span> ${formatPrice(tx.totalPrice)}
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold">Payment Method:</span> {tx.paymentMethod}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResumePendingTransaction(tx)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          Resume
                        </button>
                        <button
                          onClick={() => handleCancelPendingTransaction(tx)}
                          className="flex-1 px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Close Button */}
            <div className="text-center">
              <button
                onClick={() => setShowPendingModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default PaymentPage;
