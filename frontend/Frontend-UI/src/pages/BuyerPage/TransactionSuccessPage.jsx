import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer';

const TransactionSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get transaction data from navigation state
  const { transactionData } = location.state || {};

  // Redirect if no transaction data
  if (!transactionData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar_Buyer />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Transaction Data</h3>
            <p className="text-yellow-700">Transaction information is not available.</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 cursor-pointer"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar_Buyer />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎉 Purchase Successful!</h1>
          <p className="text-xl text-green-600 font-semibold mb-2">Thank you for your purchase</p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your carbon credits have been successfully purchased and added to your wallet.
            You can view them anytime in your wallet dashboard.
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Transaction Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction ID */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Transaction ID</p>
              <p className="text-lg font-mono text-gray-900 break-all">
                {transactionData?.transactionId || 'N/A'}
              </p>
            </div>

            {/* Purchase Date */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Purchase Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(transactionData?.completedAt || new Date()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Credit Amount */}
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Credits Purchased</p>
              <p className="text-3xl font-bold text-green-600">
                {transactionData?.amount || 0}
              </p>
              <p className="text-sm text-gray-500">tonnes CO₂e</p>
            </div>

            {/* Total Paid */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Total Paid</p>
              <p className="text-3xl font-bold text-blue-600">
                ${((transactionData?.totalPrice || transactionData?.price || transactionData?.amount) || 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">USD</p>
            </div>

            {/* Buyer Information */}
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Purchased By</p>
              <p className="text-lg font-bold text-gray-900">
                @{transactionData?.buyerUsername || 'You'}
              </p>
            </div>

            {/* Payment Method */}
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Payment Method</p>
              <p className="text-lg font-semibold text-gray-900">
                {transactionData?.paymentMethod === 'WALLET' ? '💳 Wallet' :
                 transactionData?.paymentMethod === 'VNPAY' ? '🏦 VNPay' :
                 transactionData?.paymentMethod || 'Wallet'}
              </p>
            </div>

            {/* CO2 Impact */}
            {transactionData?.co2ReducedKg && (
              <div className="col-span-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Environmental Impact</p>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  {(transactionData.co2ReducedKg || 0).toLocaleString()} kg
                </p>
                <p className="text-sm text-gray-600">
                  🌱 You've contributed to reducing {(transactionData.co2ReducedKg || 0).toLocaleString()} kg of CO₂ emissions!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Success Status */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-200">
          <div className="flex items-start space-x-3">
            <svg className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <div className="flex-1">
              <p className="text-lg font-bold text-green-900 mb-2">
                ✅ Transaction Completed Successfully
              </p>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Payment processed and confirmed</li>
                <li>• Carbon credits added to your wallet</li>
                <li>• Transaction recorded on blockchain</li>
                <li>• Receipt saved to your transaction history</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => navigate('/marketplace')}
            className="flex-1 bg-green-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors cursor-pointer flex items-center justify-center"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            🏪 Continue Shopping
          </button>

          <button
            onClick={() => navigate('/wallet')}
            className="flex-1 bg-blue-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center justify-center"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            💳 View My Wallet
          </button>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">View Your Credits</h4>
                <p className="text-sm text-gray-600">Check your wallet to see all your carbon credits and transaction history.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Retire for Certificate</h4>
                <p className="text-sm text-gray-600">When ready, you can retire credits to generate an official certificate for compliance.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Continue Shopping</h4>
                <p className="text-sm text-gray-600">Explore more carbon credits to further reduce your environmental footprint.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Track Impact</h4>
                <p className="text-sm text-gray-600">Monitor your environmental impact and sustainability goals in your dashboard.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Thank you for contributing to a sustainable future! 🌱
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransactionSuccessPage;
