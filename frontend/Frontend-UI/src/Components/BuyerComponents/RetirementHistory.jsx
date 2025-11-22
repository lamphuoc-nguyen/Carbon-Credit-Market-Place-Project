import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Download, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText,
  Loader,
  RefreshCw,
  TreePine,
  Recycle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';
import { buyerApi } from '../../api';

/**
 * 📚 Retirement History Component
 * Hiển thị lịch sử retirement với khả năng download certificate
 * 
 * Features:
 * - Danh sách retirement transactions
 * - Certificate status tracking (PENDING_GENERATION, COMPLETED, FAILED)
 * - Download certificate PDF với signed URL (valid 1 hour)
 * - Auto-refresh để check certificate status
 */
const RetirementHistory = ({ userId, onRefresh }) => {
  const [retirements, setRetirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingCerts, setDownloadingCerts] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchRetirementHistory = React.useCallback(async () => {
    if (!userId) {
      console.warn('⚠️ No user ID provided to RetirementHistory');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📋 Fetching retirement history for user:', userId);
      const response = await buyerApi.getUserRetirementHistory(userId, 0, 20);
      
      console.log('📦 Full API Response:', response);
      console.log('📦 Response type:', typeof response);
      console.log('📦 Response keys:', Object.keys(response));
      
      // Check if response has content array
      const retirementList = response.content || response || [];
      console.log('📋 Retirement list:', retirementList);
      console.log('📋 Retirement count:', retirementList.length);
      
      if (!Array.isArray(retirementList)) {
        console.error('❌ Response is not an array:', retirementList);
        setRetirements([]);
        setLoading(false);
        return;
      }
      
      // Fetch certificate details for each retirement
      const retirementsWithCerts = await Promise.all(
        retirementList.map(async (item) => {
          try {
            // Backend returns: { retirementId, userId, amountRetiredKg, ... }
            // NOT { id, ... }
            const retirementId = item.retirementId || item.id;
            
            if (!retirementId) {
              console.error('❌ No valid retirement ID found in:', item);
              return {
                retirement: item,
                certificate: null
              };
            }
            
            console.log('🔍 Fetching certificate for retirement ID:', retirementId);
            const certificate = await buyerApi.getRetirementCertificate(retirementId);
            console.log('✅ Certificate found:', certificate);
            
            return {
              retirement: item,
              certificate: certificate
            };
          } catch (certError) {
            const retirementId = item.retirementId || item.id;
            console.warn(`⚠️ Certificate not found for retirement ${retirementId}:`, certError.message);
            return {
              retirement: item,
              certificate: null
            };
          }
        })
      );

      setRetirements(retirementsWithCerts);
      console.log(`✅ Loaded ${retirementsWithCerts.length} retirement records with certificates`);
    } catch (err) {
      console.error('❌ Failed to fetch retirement history:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.message || 'Failed to load retirement history');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchRetirementHistory();
    }
  }, [userId, fetchRetirementHistory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRetirementHistory();
    setRefreshing(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleDownloadCertificate = async (retirementId) => {
    setDownloadingCerts(prev => ({ ...prev, [retirementId]: true }));

    try {
      console.log('📥 Downloading certificate for retirement:', retirementId);
      
      // Get download URL from backend
      const response = await buyerApi.getCertificateDownloadUrl(retirementId);
      
      console.log('✅ Download URL received:', response.url);

      // Open download URL in new tab (triggers auto-download via Content-Disposition header)
      window.open(response.url, '_blank');

      // Show success message with toast
      toast.success(
        `Downloaded Successfully!!!!`,
        {
          autoClose: 5000,
          position: "bottom-right"
        }
      );

    } catch (error) {
      console.error('❌ Certificate download failed:', error);
      
      if (error.message.includes('not ready')) {
        toast.warning(
          '⏳ Certificate Not Ready - Your certificate is still being generated. Please wait a few minutes and try again. Click the refresh button to check status.',
          {
            autoClose: 6000,
            position: "bottom-right"
          }
        );
      } else {
        toast.error(
          `❌ Download Failed - ${error.message}. Please try again or contact support if the issue persists.`,
          {
            autoClose: 7000,
            position: "bottom-right"
          }
        );
      }
    } finally {
      setDownloadingCerts(prev => ({ ...prev, [retirementId]: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING':
      case 'PENDING_GENERATION':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'FAILED':
      case 'FAILED_GENERATION':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
      case 'PENDING_GENERATION':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
      case 'FAILED_GENERATION':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading retirement history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load History</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchRetirementHistory}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-green-50 p-8 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Retirement History</h2>
              <p className="text-gray-600 text-lg">Your carbon offset certificates</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-bold">{retirements.length} Retirements</span>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-green-300 transition-all"
              title="Refresh to check certificate status"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {retirements.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative inline-block mb-8">
              <div className="p-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full">
                <Recycle className="w-20 h-20 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Retirements Yet</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Start making a difference by retiring your carbon credits.
              You'll receive a certificate for each retirement.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {retirements.map((item) => {
              const retirement = item.retirement;
              const certificate = item.certificate;
              const retirementId = retirement.retirementId || retirement.id;
              const isDownloading = downloadingCerts[retirementId];

              return (
                <div 
                  key={retirementId} 
                  className="bg-gradient-to-r from-gray-50 to-green-50/30 rounded-2xl border-2 border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                          <Recycle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {retirement.amountRetiredKg.toLocaleString()} kg CO₂ Retired
                            </h3>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(retirement.status)}
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(retirement.status)}`}>
                                {retirement.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">
                                Retired on {formatDate(retirement.retirementDate)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <TreePine className="w-4 h-4" />
                              <span className="text-sm">
                                ≈ {(retirement.amountRetiredKg / 1000 * 45).toFixed(0)} trees equivalent
                              </span>
                            </div>
                          </div>

                          {/* Certificate Status */}
                          {certificate && (
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <FileText className="w-5 h-5 text-gray-600" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">
                                      Certificate: {certificate.certificateCode}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-1">
                                      {getStatusIcon(certificate.status)}
                                      <span className={`text-xs font-medium ${
                                        certificate.status === 'COMPLETED' ? 'text-green-600' :
                                        certificate.status === 'PENDING_GENERATION' ? 'text-yellow-600' :
                                        'text-red-600'
                                      }`}>
                                        {certificate.status === 'COMPLETED' ? 'Ready to download' :
                                         certificate.status === 'PENDING_GENERATION' ? 'Generating PDF...' :
                                         'Generation failed'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Download Button - Using API to get signed URL */}
                                {certificate.status === 'COMPLETED' && (
                                  <button
                                    onClick={() => handleDownloadCertificate(retirementId)}
                                    disabled={isDownloading}
                                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                                    title="Download certificate PDF (Signed URL valid for 1 hour)"
                                  >
                                    {isDownloading ? (
                                      <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        <span>Downloading...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Download className="w-5 h-5" />
                                        <span>Download PDF</span>
                                      </>
                                    )}
                                  </button>
                                )}

                                {certificate.status === 'PENDING_GENERATION' && (
                                  <div className="flex items-center space-x-2 text-yellow-600">
                                    <Loader className="w-4 h-4 animate-spin" />
                                    <span className="text-sm font-medium">Processing...</span>
                                  </div>
                                )}

                                {certificate.status === 'FAILED_GENERATION' && (
                                  <div className="flex items-center space-x-2 text-red-600">
                                    <XCircle className="w-4 h-4" />
                                    <span className="text-sm font-medium">Failed</span>
                                  </div>
                                )}
                              </div>

                              {/* Certificate Details */}
                              {certificate.projectSourceInfo && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Project:</span> {certificate.projectSourceInfo}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {!certificate && (
                            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-yellow-600" />
                                <p className="text-sm text-yellow-800 font-medium">
                                  Certificate is being generated. Please check back in a few minutes.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Impact Footer */}
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-6 py-4 border-t border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-900">
                            {(retirement.amountRetiredKg / 1000).toFixed(1)}
                          </p>
                          <p className="text-xs text-green-700">Credits Retired</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-900">
                            {retirement.amountRetiredKg.toLocaleString()}
                          </p>
                          <p className="text-xs text-green-700">kg CO₂ Offset</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">Permanently Offset</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Footer */}
      {retirements.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-green-50 px-8 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-gray-600">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">
              Certificates are generated automatically. Download links are valid for 1 hour.
              Click refresh to check the status of pending certificates.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetirementHistory;
