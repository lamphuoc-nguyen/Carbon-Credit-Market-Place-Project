import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer';
import Footer from '../../Components/Footer';

const PaymentFailedPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const transactionId = searchParams.get('transactionId');
    const responseCode = searchParams.get('code');
    const errorMessage = searchParams.get('message'); // New: get custom error message
    const [reason, setReason] = useState('Payment attempt failed or was cancelled.');

    useEffect(() => {
        // Determine the reason for failure based on VNPay code or backend error
        let failureReason = getFailureDescription(responseCode, errorMessage);
        setReason(failureReason);
    }, [responseCode, errorMessage]);

    const getFailureDescription = (code, customMessage) => {
        // Handle custom backend validation errors first
        if (code === 'PRICE_CHANGED') {
            return customMessage || 'The listing price changed while you were completing payment. Please try purchasing again with the updated price.';
        }

        if (code === 'VALIDATION_ERROR') {
            return customMessage || 'A validation error occurred during transaction processing. Please try again.';
        }

        // Original VNPay error codes
        return getVnpayResponseDescription(code);
    };

    const getVnpayResponseDescription = (code) => {
        switch (code) {
            case '00': return 'Giao dịch thành công (Lỗi định tuyến).';
            case '24': return 'Giao dịch không thành công: Bạn đã hủy giao dịch.';
            case '11': return 'Giao dịch không thành công: Đã hết hạn chờ thanh toán.';
            case '51': return 'Giao dịch không thành công: Tài khoản không đủ số dư.';
            case '07': return 'Giao dịch bị nghi ngờ gian lận.';
            case '12': return 'Thẻ/Tài khoản của quý khách bị khóa.';
            default: return `Giao dịch không thành công. Mã lỗi: ${code}. Vui lòng thử lại.`;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar_Buyer />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8 border-t-8 border-red-500">

                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-red-600 mb-2">❌ Payment Failed</h2>
                        <p className="text-gray-600 text-lg">{reason}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-5 mb-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Next Steps:</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            {responseCode === 'PRICE_CHANGED' ? (
                                <>
                                    <li><strong>Price Update:</strong> The listing price was updated by the seller while you were completing payment.</li>
                                    <li><strong>Credit Released:</strong> The carbon credit has been returned to the marketplace with the new price.</li>
                                    <li><strong>Next Action:</strong> Please return to the marketplace to see the updated price and purchase again if you're still interested.</li>
                                </>
                            ) : responseCode === 'VALIDATION_ERROR' ? (
                                <>
                                    <li><strong>Validation Issue:</strong> A technical validation error occurred during transaction processing.</li>
                                    <li><strong>Credit Status:</strong> The carbon credit has been returned to the marketplace.</li>
                                    <li><strong>Try Again:</strong> Please wait a moment and try purchasing again, or contact support if the issue persists.</li>
                                </>
                            ) : (
                                <>
                                    <li><strong>Credit Released:</strong> Since the transaction failed, the carbon credit has been returned to the marketplace (listed status).</li>
                                    <li><strong>Try Again:</strong> Please return to the listing page and create a new transaction to retry payment.</li>
                                </>
                            )}
                            <li><strong>Transaction ID:</strong> <span className="font-mono text-sm break-all">{transactionId || 'N/A'}</span></li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                        {responseCode === 'PRICE_CHANGED' ? (
                            <>
                                <button
                                    onClick={() => navigate('/marketplace')}
                                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
                                >
                                    <span className="flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        View Updated Price
                                    </span>
                                </button>
                                <button
                                    onClick={() => navigate('/wallet')}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition"
                                >
                                    Check Transaction History
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/marketplace')}
                                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
                                >
                                    <span className="flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        Back to Marketplace
                                    </span>
                                </button>
                                <button
                                    onClick={() => navigate('/wallet')}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition"
                                >
                                    Transaction History
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentFailedPage;