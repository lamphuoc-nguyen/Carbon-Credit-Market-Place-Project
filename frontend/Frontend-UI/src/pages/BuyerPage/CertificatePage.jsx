import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer';

const CertificatePage = () => {
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
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Certificate Found</h3>
            <p className="text-yellow-700">Certificate data is not available.</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Certificate Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎉 Purchase Successful!</h1>
          <p className="text-xl text-green-600 font-semibold">Carbon Credit Certificate</p>
        </div>

        {/* Certificate Body */}
        <div className="bg-white rounded-2xl shadow-lg border-4 border-green-200 p-8 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Certificate Code */}
              <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Certificate Code</p>
                <p className="text-xl font-bold text-green-600 font-mono break-all">
                  {transactionData.certificateCode}
                </p>
              </div>

              {/* Transaction ID */}
              <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Transaction ID</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {transactionData.transactionId}
                </p>
              </div>

              {/* CO2 Reduced */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">CO₂ Reduced</p>
                <p className="text-3xl font-bold text-gray-900">
                  {transactionData.co2ReducedKg?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500">kilograms</p>
              </div>

              {/* Credit Amount */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Credit Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  {transactionData.amount}
                </p>
                <p className="text-xs text-gray-500">tonnes CO₂e</p>
              </div>

              {/* Total Paid */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Paid</p>
                <p className="text-3xl font-bold text-green-600">
                  ${transactionData.totalPrice}
                </p>
                <p className="text-xs text-gray-500">USD</p>
              </div>

              {/* Issue Date */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Issue Date</p>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(transactionData.issueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(transactionData.issueDate).toLocaleTimeString('en-US')}
                </p>
              </div>

              {/* Buyer Info */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Buyer</p>
                <p className="text-base font-bold text-gray-900">
                  @{transactionData.buyerUsername}
                </p>
                <p className="text-xs text-gray-500 font-mono break-all">
                  ID: {transactionData.buyerId?.toString().slice(0, 8)}...
                </p>
              </div>

              {/* Seller Info */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Seller</p>
                <p className="text-base font-bold text-gray-900">
                  @{transactionData.sellerUsername}
                </p>
                <p className="text-xs text-gray-500 font-mono break-all">
                  ID: {transactionData.sellerId?.toString().slice(0, 8)}...
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Status */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  ✅ Transaction Completed Successfully
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Funds transferred from buyer to seller wallet</li>
                  <li>• Carbon credit ownership updated</li>
                  <li>• Certificate generated and recorded</li>
                  <li>• Transaction recorded on blockchain (pending verification)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                // TODO: Implement download certificate as PDF
                alert('Download certificate feature coming soon!');
              }}
              className="flex-1 px-6 py-4 border-2 border-green-600 text-green-600 rounded-xl font-bold hover:bg-green-50 transition cursor-pointer"
            >
              📄 Download Certificate
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition cursor-pointer"
            >
              Back to Marketplace
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-center text-gray-500 mt-6">
            This certificate is digitally verified and can be viewed in your transaction history.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;