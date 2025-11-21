import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer';
import Footer from '../../Components/Footer';
import { buyerApi } from '../../api';

const CertificatePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get data from navigation state
  const { retirementId, transactionData } = location.state || {};

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);

  // Fetch certificate from retirement
  const fetchCertificate = async () => {
    try {
      console.log('🔄 Fetching certificate for retirement:', retirementId);
      const cert = await buyerApi.getRetirementCertificate(retirementId);

      console.log('✅ Certificate fetched:', cert);
      setCertificate(cert);
      setError(null);

      // If still generating, poll again
      if (cert.status === 'PENDING_GENERATION' && pollingCount < 20) {
        console.log(`⏳ Certificate still generating, polling again in 3s... (${pollingCount + 1}/20)`);
        setTimeout(() => {
          setPollingCount(pollingCount + 1);
          fetchCertificate();
        }, 3000);
      }

    } catch (err) {
      console.error('❌ Error fetching certificate:', err);
      if (err.response?.status === 404 && pollingCount < 20) {
        // Certificate not created yet, retry
        console.log(`⏳ Certificate not found yet, retrying in 3s... (${pollingCount + 1}/20)`);
        setTimeout(() => {
          setPollingCount(pollingCount + 1);
          fetchCertificate();
        }, 3000);
      } else {
        setError('Certificate is being generated. Please refresh in a moment.');
      }
    } finally {
      setLoading(false);
    }
  };

  // useEffect to fetch certificate on mount
  useEffect(() => {
    if (retirementId) {
      fetchCertificate();
    } else if (transactionData) {
      // No retirement ID but have transaction data - show transaction summary
      console.log('📄 No retirement ID found, showing transaction summary');
      setLoading(false);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retirementId, transactionData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar_Buyer />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-16 w-16 text-green-600 mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">🎓 Generating Your Certificate</h3>
            <p className="text-gray-600 text-center max-w-md">
              Your carbon credit certificate is being generated and uploaded to secure cloud storage.
              This usually takes 5-10 seconds...
            </p>
            <p className="text-sm text-gray-500 mt-4">
              {pollingCount > 0 && `Checking... (${pollingCount}/20)`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error or redirect if no data
  if (!transactionData && !retirementId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar_Buyer />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Certificate Found</h3>
            <p className="text-yellow-700">Certificate data is not available.</p>
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Certificate Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎉 Purchase Successful!</h1>
          <p className="text-xl text-green-600 font-semibold">Official Carbon Credit Certificate</p>
          {certificate && (
            <div className="mt-4">
              <span className={`inline-block px-6 py-2 rounded-full text-sm font-bold ${
                certificate.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                certificate.status === 'PENDING_GENERATION' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {certificate.status === 'COMPLETED' ? '✅ CERTIFICATE READY' :
                 certificate.status === 'PENDING_GENERATION' ? '⏳ GENERATING...' :
                 '❌ ' + certificate.status}
              </span>
            </div>
          )}
        </div>

        {/* Certificate Body */}
        <div className="bg-white rounded-2xl shadow-lg border-4 border-green-200 p-8 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Certificate Code */}
              <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Certificate Code</p>
                <p className="text-xl font-bold text-green-600 font-mono break-all">
                  {transactionData?.certificateCode || certificate?.certificateCode || `CERT-${transactionData?.transactionId?.substring(0, 8)}`}
                </p>
              </div>

              {/* Transaction ID */}
              <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Transaction ID</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {transactionData?.transactionId}
                </p>
              </div>

              {/* CO2 Reduced */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">CO₂ Reduced</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(transactionData?.co2ReducedKg || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">kilograms</p>
              </div>

              {/* Credit Amount */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Credit Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  {transactionData?.amount || 0}
                </p>
                <p className="text-xs text-gray-500">tonnes CO₂e</p>
              </div>

              {/* Total Paid */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Paid</p>
                <p className="text-3xl font-bold text-green-600">
                  ${((transactionData?.totalPrice || transactionData?.price || transactionData?.amount) || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">USD</p>
              </div>

              {/* Issue Date */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Issue Date</p>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(transactionData?.issueDate || transactionData?.completedAt || new Date()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(transactionData?.issueDate || transactionData?.completedAt || new Date()).toLocaleTimeString('en-US')}
                </p>
              </div>

              {/* Buyer Info */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Buyer</p>
                <p className="text-base font-bold text-gray-900">
                  @{transactionData?.buyerUsername || 'Unknown Buyer'}
                </p>
                <p className="text-xs text-gray-500 font-mono break-all">
                  ID: {((transactionData?.buyerId || 'N/A').toString()).slice(0, 8)}...
                </p>
              </div>

              {/* Seller Info */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Seller</p>
                <p className="text-base font-bold text-gray-900">
                  @{transactionData?.sellerUsername || 'Unknown Seller'}
                </p>
                <p className="text-xs text-gray-500 font-mono break-all">
                  ID: {((transactionData?.sellerId || 'N/A').toString()).slice(0, 8)}...
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
                  <li>• Carbon credits automatically retired for certificate generation</li>
                  <li>• Official certificate being generated on cloud storage</li>
                  <li>• Transaction recorded on blockchain (pending verification)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Certificate Download Section */}
          {certificate && certificate.status === 'COMPLETED' && certificate.pdfUrl && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Certificate Ready for Download
              </h3>
              <p className="text-green-700 mb-4">Your official carbon credit certificate is ready!</p>

              <div className="flex gap-3">
                <a
                  href={certificate.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Certificate
                </a>
                <button
                  onClick={() => window.open(certificate.pdfUrl, '_blank')}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Certificate
                </button>
              </div>
            </div>
          )}

          {/* Certificate Generation in Progress */}
          {!certificate && transactionData && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Certificate Generation in Progress
              </h3>
              <p className="text-blue-700 mb-4">
                Your carbon credits have been successfully retired! The official certificate is being generated and will be available shortly.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Page
                </button>
                <button
                  onClick={() => navigate('/wallet')}
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Check Wallet
                </button>
              </div>
            </div>
          )}

          {/* Error Message for Certificate Generation */}
          {transactionData?.error && (
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Certificate Generation Issue
              </h3>
              <p className="text-orange-700 mb-4">
                {transactionData.error}
              </p>
              <p className="text-orange-600 text-sm mb-4">
                Don't worry! Your transaction was successful and the credits are in your wallet. You can request a new certificate later.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/wallet')}
                  className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors cursor-pointer"
                >
                  View My Wallet
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              onClick={() => navigate('/wallet')}
              className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition cursor-pointer"
            >
              💳 View My Wallet
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition cursor-pointer"
            >
              🏪 Back to Marketplace
            </button>
          </div>

          {/* Information & Help */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500 leading-relaxed">
              This purchase receipt confirms your transaction. Credits are now in your balance.
              <br />
              <span className="font-semibold text-gray-700">Use this certificate for compliance and reporting purposes.</span>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CertificatePage;
