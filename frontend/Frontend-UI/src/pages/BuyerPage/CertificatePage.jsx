import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer';
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
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retirementId]);

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
                  {transactionData.certificateCode || certificate?.certificateCode || `CERT-${transactionData.transactionId?.substring(0, 8)}`}
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
                  ${(transactionData.totalPrice || transactionData.price || (transactionData.amount * transactionData.pricePerUnit) || transactionData.amount).toLocaleString()}
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
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-900 mb-2">
                    🎉 Official Certificate Ready!
                  </h3>
                  <p className="text-sm text-green-700 mb-4">
                    Your carbon credit retirement certificate has been generated and uploaded to secure cloud storage. 
                    This official document can be used for sustainability reporting, ESG disclosure, and compliance.
                  </p>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Certificate ID</p>
                        <p className="font-mono font-bold text-gray-900">{certificate.certificateCode || certificate.id}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Generated Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(certificate.issueDate).toLocaleDateString('en-US')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Retired Amount</p>
                        <p className="font-bold text-green-600">{certificate.co2AmountKg} kg CO₂e</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Status</p>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                          ✅ COMPLETED
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={certificate.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download Official PDF Certificate</span>
                  </a>
                  <p className="text-xs text-green-600 mt-3">
                    💡 Save this certificate for your sustainability reports and compliance documentation
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Certificate Generating */}
          {certificate && certificate.status === 'PENDING_GENERATION' && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
              <div className="flex items-start space-x-4">
                <svg className="animate-spin h-12 w-12 text-yellow-600 flex-shrink-0" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-yellow-900 mb-2">
                    ⏳ Generating Your Certificate...
                  </h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Your official carbon credit certificate is being generated and uploaded to secure cloud storage. 
                    This process usually takes 5-10 seconds.
                  </p>
                  <button
                    onClick={fetchCertificate}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh Status</span>
                  </button>
                  <p className="text-xs text-yellow-600 mt-3">
                    Page will auto-refresh when certificate is ready
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error or No Certificate */}
          {error && !certificate && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg mb-6">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-900 mb-2">Certificate Still Processing</p>
                  <p className="text-sm text-orange-700 mb-3">{error}</p>
                  <button
                    onClick={fetchCertificate}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Secondary Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 px-6 py-4 border-2 border-gray-400 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition cursor-pointer"
              >
                🖨️ Print Receipt
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition cursor-pointer"
              >
                🏪 Back to Marketplace
              </button>
            </div>
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
    </div>
  );
};

export default CertificatePage;