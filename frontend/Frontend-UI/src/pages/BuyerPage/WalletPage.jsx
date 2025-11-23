import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wallet,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Eye,
    EyeOff,
    Plus,
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    Leaf,
    ShoppingCart,
    Recycle,
    TreePine,
    Earth,
    TrendingUp
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer';
import Footer from '../../Components/Footer';
import RetirementModal from '../../Components/BuyerComponents/RetirementModal';
import RetirementHistory from '../../Components/BuyerComponents/RetirementHistory';
import { walletApi } from '../../api';

const WalletPage = () => {
    const navigate = useNavigate();

    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [showBalance, setShowBalance] = useState(true);

    // Deposit Modal State
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [depositMethod, setDepositMethod] = useState('bank_transfer');
    const [depositing, setDepositing] = useState(false);

    // Retirement Modal State
    const [showRetirementModal, setShowRetirementModal] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

        if (!token) {
            console.warn('⚠️ No token found - user not logged in');
            toast.error('Please log in to access your wallet');
            setLoading(false);
            setError('NOT_LOGGED_IN');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch wallet info
            const walletData = await walletApi.getMyWallet();
            console.log('✅ Wallet data:', walletData);
            console.log('🔑 Wallet userId:', walletData?.userId);
            console.log('🔑 Wallet user.id:', walletData?.user?.id);
            setWallet(walletData);

            // Fetch wallet transactions
            try {
                const transactionsData = await walletApi.getWalletTransactions(0, 10);
                setTransactions(transactionsData.content || []);
                console.log('✅ Transactions loaded:', transactionsData.content?.length || 0);
            } catch (txError) {
                console.error('⚠️ Failed to load transactions:', txError);
                toast.warn('Some transaction data could not be loaded');
                setTransactions([]);
            }

        } catch (err) {
            console.error('❌ Failed to fetch wallet:', err);

            if (err.response?.status === 401) {
                setError('AUTHENTICATION_FAILED');
                toast.error('Your session has expired. Please log in again.');
            } else if (err.response?.status === 404) {
                setError('WALLET_NOT_FOUND');
                toast.error('Wallet not found. Please contact support.');
            } else {
                setError('FETCH_ERROR');
                toast.error('Failed to load wallet data. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchWalletData();
            toast.success('Wallet data refreshed successfully!');
        } catch (error) {
            toast.error('Failed to refresh wallet data');
        }
        setRefreshing(false);
    };

    const handleRetirementSuccess = async (response) => {
        console.log('✅ Retirement completed:', response);
        toast.success('Credits retired successfully! Thank you for your environmental contribution.');
        // Refresh wallet data to update balances
        await fetchWalletData();
    };

    const handleDeposit = async () => {
        if (!depositAmount || parseFloat(depositAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setDepositing(true);
        try {
            await walletApi.depositFunds({
                amount: parseFloat(depositAmount),
                paymentMethodId: depositMethod // walletApi expects paymentMethodId not method
            });

            // Close modal and clear form first
            setShowDepositModal(false);
            setDepositAmount('');
            
            // Show success toast after modal closes
            toast.success(`Deposit initiated successfully! Amount: $${depositAmount}`);
            
            // Refresh wallet data
            await fetchWalletData();
        } catch (error) {
            console.error('❌ Deposit failed:', error);
            toast.error(error.response?.data?.message || 'Deposit failed. Please try again.');
        } finally {
            setDepositing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'DEPOSIT':
                return <ArrowDownRight className="w-5 h-5" />;
            case 'WITHDRAWAL':
                return <ArrowUpRight className="w-5 h-5" />;
            case 'PURCHASE':
                return <CreditCard className="w-5 h-5" />;
            default:
                return <Leaf className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'FAILED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Error states
    if (error === 'NOT_LOGGED_IN') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
                    <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600 mb-6">Please login to access your wallet</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (error === 'AUTHENTICATION_FAILED') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
                    <p className="text-gray-600 mb-6">Your session has expired. Please login again.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                        Login Again
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar_Buyer />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
                            <div className="w-16 h-16 border-4 border-green-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                        </div>
                        <p className="mt-4 text-gray-600 font-medium">Loading your wallet...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50"
             style={{
                 backgroundImage: "url('/src/image/bg4.png')",
                 backgroundSize: '100% auto',
                 backgroundPosition: 'top center',
                 backgroundRepeat: 'no-repeat',
                 backgroundAttachment: 'fixed'
             }}>
            <Navbar_Buyer />
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                toastClassName="!bg-white !text-gray-800 !rounded-lg !shadow-lg !border !border-gray-200"
                bodyClassName="!text-sm !font-medium"
                progressClassName="!bg-green-500"
                style={{ zIndex: 9999 }}
            />

            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
                            <p className="text-gray-600 mt-1">Manage your funds and carbon credits</p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Cash Balance Card */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-green-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600">Cash Balance</h3>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowBalance(!showBalance);
                                    toast.info(showBalance ? 'Balance hidden for privacy' : 'Balance now visible', {
                                        autoClose: 1500,
                                        hideProgressBar: true
                                    });
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                {showBalance ? <Eye className="w-4 h-4 text-gray-600" /> : <EyeOff className="w-4 h-4 text-gray-600" />}
                            </button>
                        </div>

                        <p className="text-3xl font-bold text-gray-900 mb-4 transition-all duration-300">
                            {showBalance ? formatCurrency(wallet?.cashBalance) : '••••••'}
                        </p>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">Active</span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDepositModal(true)}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium hover:scale-105 active:scale-95"
                            >
                                Deposit
                            </button>
                            <button
                                onClick={() => navigate('/marketplace')}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium hover:scale-105 active:scale-95"
                            >
                                Marketplace
                            </button>
                        </div>
                    </div>

                    {/* Carbon Credits Card */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-green-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-600">Carbon Credits</h3>
                            </div>
                        </div>

                        <p className="text-3xl font-bold text-gray-900 mb-1">
                            {showBalance ? (wallet?.creditBalance || 0).toLocaleString() : '••••••'}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">Credits</p>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-xs text-green-800">Available for retirement & trading</p>
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-green-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Wallet className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-600">Quick Actions</h3>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={() => setShowRetirementModal(true)}
                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Recycle className="w-4 h-4" />
                                <span>Retire Credits</span>
                            </button>
                            <button
                                onClick={() => navigate('/marketplace')}
                                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span>Browse Market</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Environmental Impact Stats */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Environmental Impact</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="group">
                            <div className="flex items-center gap-2 mb-2">
                                <Earth className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                                <p className="text-sm text-gray-600">CO₂ Offset</p>
                            </div>
                            {/* 🔧 FIX: Bỏ nhân 2.5. 1 Credit = 1 Tấn */}
                            <p className="text-2xl font-bold text-gray-900">
                                {(wallet?.creditBalance || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">Tons</p>
                        </div>

                        <div className="group">
                            <div className="flex items-center gap-2 mb-2">
                                <TreePine className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                                <p className="text-sm text-gray-600">Tree Equivalent</p>
                            </div>
                            {/* 🔧 Tùy chỉnh: 1 Tấn CO2 ≈ 50 cây xanh (ước tính) */}
                            <p className="text-2xl font-bold text-gray-900">
                                {((wallet?.creditBalance || 0) * 50).toFixed(0)}
                            </p>
                            <p className="text-xs text-gray-500">Trees</p>
                        </div>

                        <div className="group">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                                <p className="text-sm text-gray-600">Transactions</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
                            <p className="text-xs text-gray-500">Total</p>
                        </div>

                        <div className="group">
                            <div className="flex items-center gap-2 mb-2">
                                <Wallet className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                                <p className="text-sm text-gray-600">Total Value</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                ${((wallet?.cashBalance || 0) + (wallet?.creditBalance || 0) * 25).toFixed(0)}
                            </p>
                            <p className="text-xs text-gray-500">USD</p>
                        </div>
                    </div>
                </div>

                {/* Retirement History Section */}
                {wallet && (
                    <div className="mb-12">
                        <RetirementHistory
                            userId={wallet.userId || wallet.user?.id}
                            onRefresh={fetchWalletData}
                        />
                    </div>
                )}

                {/* Transaction History */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                                <p className="text-sm text-gray-600 mt-1">{transactions.length} transactions</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {transactions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <Wallet className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                                <p className="text-gray-600 mb-6">
                                    Start by depositing funds or purchasing carbon credits
                                </p>
                                <button
                                    onClick={() => setShowDepositModal(true)}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Make First Deposit
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((transaction, index) => (
                                    <div key={transaction.id || index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all duration-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${
                                                    transaction.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' :
                                                        transaction.type === 'WITHDRAWAL' ? 'bg-red-100 text-red-600' :
                                                            transaction.type === 'PURCHASE' ? 'bg-blue-100 text-blue-600' :
                                                                'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {getTransactionIcon(transaction.type)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {transaction.type?.replace('_', ' ') || 'Transaction'}
                            </span>
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(transaction.status)}`}>
                              {transaction.status || 'Completed'}
                            </span>

                                                        {/* 🆕 NEW: Payment Method Badge */}
                                                        {transaction.paymentMethod && (
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded border ${
                                                                transaction.paymentMethod === 'VNPAY' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                    transaction.paymentMethod === 'WALLET' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                                        'bg-gray-100 text-gray-700 border-gray-200'
                                                            }`}>
                                {transaction.paymentMethod === 'BANK_TRANSFER' ? 'BANKING' : transaction.paymentMethod}
                              </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {transaction.description || 'Transaction'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatDate(transaction.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                        <span className={`text-lg font-bold ${
                            transaction.type === 'DEPOSIT' ? 'text-green-600' :
                                transaction.type === 'WITHDRAWAL' ? 'text-red-600' :
                                    transaction.type === 'PURCHASE' ? 'text-blue-600' :
                                        'text-gray-900'
                        }`}>
                          {transaction.type === 'DEPOSIT' ? '+' :
                              transaction.type === 'WITHDRAWAL' ? '-' : ''}
                            {formatCurrency(transaction.amount)}
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Deposit Modal */}
                {showDepositModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all overflow-hidden">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                            <TreePine className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Deposit Funds</h3>
                                            <p className="text-green-100 text-sm">Add funds to your wallet</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="space-y-4">
                                    {/* Amount Input */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                                            Amount (USD)
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                                            <input
                                                type="number"
                                                value={depositAmount}
                                                onChange={(e) => setDepositAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-base font-semibold"
                                            />
                                        </div>
                                        {depositAmount && (
                                            <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                                                <div className="flex items-center space-x-2 text-green-700">
                                                    <Earth className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-medium">
                          Ready to fund your carbon credit purchases
                        </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                                            Payment Method
                                        </label>
                                        <select
                                            value={depositMethod}
                                            onChange={(e) => setDepositMethod(e.target.value)}
                                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium text-sm"
                                        >
                                            <option value="bank_transfer">🏦 Bank Transfer</option>
                                            <option value="credit_card">💳 Credit Card</option>
                                            <option value="vnpay">📱 VNPay Digital Wallet</option>
                                        </select>
                                    </div>

                                    {/* Quick Amount Selection */}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 mb-2">Quick amounts:</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[100, 500, 1000, 2500].map((amount) => (
                                                <button
                                                    key={amount}
                                                    onClick={() => setDepositAmount(amount.toString())}
                                                    className="p-2 border-2 border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-center group"
                                                >
                                                    <div className="font-bold text-green-600 group-hover:text-green-700 text-sm">
                                                        ${amount}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Security Notice */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                            <h4 className="font-medium text-gray-800 text-sm">Secure Deposit</h4>
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            Bank-level security • Instant processing
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-3 mt-5">
                                    <button
                                        onClick={() => {
                                            setShowDepositModal(false);
                                            setDepositAmount('');
                                        }}
                                        className="flex-1 py-2.5 px-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeposit}
                                        disabled={depositing || !depositAmount}
                                        className="flex-1 py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-sm"
                                    >
                                        {depositing ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Processing...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center space-x-2">
                                                <TreePine className="w-5 h-5" />
                                                <span>Deposit</span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Retirement Modal */}
                <RetirementModal
                    isOpen={showRetirementModal}
                    onClose={() => setShowRetirementModal(false)}
                    wallet={wallet}
                    onSuccess={handleRetirementSuccess}
                />
            </div>
            <Footer />
        </div>
    );
};

export default WalletPage;
