import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buyerApi } from '../../api';
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Đang tải thông tin giao dịch...');

  useEffect(() => {
    handlePaymentSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePaymentSuccess = async () => {
    try {
      const transactionId = searchParams.get('transactionId');
      
      if (!transactionId) {
        setStatus('error');
        setMessage('Không tìm thấy mã giao dịch');
        return;
      }

      console.log('✅ Payment successful! Transaction ID:', transactionId);
      setMessage('Thanh toán thành công! Đang chuyển đến trang certificate...');

      // Lấy thông tin transaction từ backend
      try {
        const transaction = await buyerApi.getTransactionDetails(transactionId);
        console.log('Transaction data:', transaction);

        setStatus('success');

        // Redirect đến certificate page với transaction data
        setTimeout(() => {
          navigate('/certificate', {
            state: {
              transactionData: {
                transactionId: transaction.id,
                status: transaction.status,
                amount: transaction.amount,
                completedAt: transaction.completedAt,
                paymentMethod: transaction.paymentMethod || 'VNPAY',
                co2ReducedKg: transaction.credit?.co2ReducedKg || 0,
                buyerUsername: transaction.buyer?.username,
                sellerUsername: transaction.seller?.username,
                creditId: transaction.credit?.id,
                listingId: transaction.listing?.id
              }
            },
            replace: true
          });
        }, 1500);

      } catch (error) {
        console.error('Error fetching transaction:', error);
        
        // Nếu không lấy được transaction detail, vẫn redirect với basic info
        setStatus('success');
        setTimeout(() => {
          navigate('/certificate', {
            state: {
              transactionData: {
                transactionId: transactionId,
                status: 'COMPLETED',
                paymentMethod: 'VNPAY'
              }
            },
            replace: true
          });
        }, 1500);
      }

    } catch (error) {
      console.error('Error handling payment success:', error);
      setStatus('error');
      setMessage('Có lỗi xảy ra. Vui lòng kiểm tra lại giao dịch trong lịch sử.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar_Buyer />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Status Icon */}
          <div className="text-center mb-6">
            {status === 'loading' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              </div>
            )}
            
            {status === 'success' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {status === 'error' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="text-center">
            <h2 className={`text-3xl font-bold mb-4 ${
              status === 'success' ? 'text-green-600' :
              status === 'error' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {status === 'loading' && 'Đang xử lý...'}
              {status === 'success' && '🎉 Thanh toán thành công!'}
              {status === 'error' && 'Có lỗi xảy ra'}
            </h2>
            
            <p className="text-gray-600 text-lg mb-6">{message}</p>

            {status === 'success' && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Đang chuyển đến trang certificate...</span>
                </div>
              </div>
            )}

            {/* Loading Animation */}
            {status === 'loading' && (
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}

            {/* Error Actions */}
            {status === 'error' && (
              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={() => navigate('/buyer')}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition"
                >
                  Về trang chủ
                </button>
                <button
                  onClick={() => navigate('/buyer/transactions')}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
                >
                  Xem lịch sử giao dịch
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
