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
  Earth
} from 'lucide-react';
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer';
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
        setTransactions([]);
      }

    } catch (err) {
      console.error('❌ Failed to fetch wallet:', err);

      if (err.response?.status === 401) {
        setError('AUTHENTICATION_FAILED');
      } else if (err.response?.status === 404) {
        setError('WALLET_NOT_FOUND');
      } else {
        setError('FETCH_ERROR');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  };

  const handleRetirementSuccess = async (response) => {
    console.log('✅ Retirement completed:', response);
    // Refresh wallet data to update balances
    await fetchWalletData();
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setDepositing(true);
    try {
      await walletApi.depositFunds({
        amount: parseFloat(depositAmount),
        paymentMethodId: depositMethod // walletApi expects paymentMethodId not method
      });

      alert(`Deposit initiated successfully! Amount: $${depositAmount}`);
      setShowDepositModal(false);
      setDepositAmount('');
      await fetchWalletData(); // Refresh wallet data
    } catch (error) {
      console.error('❌ Deposit failed:', error);
      alert('Deposit failed. Please try again.');
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
        return <ArrowDownRight className="w-5 h-5 text-green-600" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      case 'PURCHASE':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      default:
        return <Leaf className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return 'text-green-600';
      case 'WITHDRAWAL':
        return 'text-red-600';
      case 'PURCHASE':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <Navbar_Buyer />

      {/* Modern Hero Header */}
      <div className="bg-gradient-to-r from-green-800 via-emerald-700 to-teal-800 relative overflow-hidden">
        {/* Organic Background Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                    <Leaf className="w-12 h-12 text-green-200" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-white mb-2">
                    EcoWallet
                  </h1>
                  <p className="text-emerald-200 text-xl font-medium">
                    Sustainable Carbon Credit Portfolio
                  </p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-emerald-200 text-sm font-medium">Total Impact</p>
                    <p className="text-3xl font-bold text-white">
                      {((wallet?.creditBalance || 0) * 2.5).toFixed(1)}
                    </p>
                    <p className="text-emerald-300 text-sm">tons CO₂ offset</p>
                  </div>
                  <div>
                    <p className="text-emerald-200 text-sm font-medium">Active Credits</p>
                    <p className="text-3xl font-bold text-white">
                      {(wallet?.creditBalance || 0).toLocaleString()}
                    </p>
                    <p className="text-emerald-300 text-sm">carbon credits</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Earth className="w-32 h-32 text-white" />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl px-4 py-2 shadow-lg">
                  <p className="text-green-700 font-bold text-sm">Going Green!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Balance Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 -mt-16 relative z-10">
          {/* Cash Balance Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Cash Balance</h3>
                  <p className="text-gray-500">Available for investment</p>
                </div>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {showBalance ? <Eye className="w-5 h-5 text-gray-600" /> : <EyeOff className="w-5 h-5 text-gray-600" />}
              </button>
            </div>

            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {showBalance ? formatCurrency(wallet?.cashBalance) : '••••••••'}
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-green-600 text-sm font-medium">Ready to invest</p>
              </div>
            </div>

            <button
              onClick={() => setShowDepositModal(true)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add Funds
            </button>
          </div>

          {/* Carbon Credits Card */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <TreePine className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Carbon Credits</h3>
                  <p className="text-green-200">Environmental portfolio</p>
                </div>
              </div>

              <p className="text-4xl font-bold mb-2">
                {showBalance ? (wallet?.creditBalance || 0).toLocaleString() : '••••••'}
              </p>
              <p className="text-green-200 mb-4">Active credits</p>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center space-x-2">
                  <Recycle className="w-4 h-4" />
                  <span className="text-sm">≈ {((wallet?.creditBalance || 0) * 1000).toLocaleString()} trees protected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl">
                <Wallet className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
                <p className="text-gray-500">Manage your portfolio</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setShowRetirementModal(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
              >
                <Recycle className="w-5 h-5" />
                <span>Retire Credits</span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>

              <button
                onClick={() => navigate('/marketplace')}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-xl font-medium hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Browse Market</span>
              </button>
            </div>
          </div>
        </div>

        {/* Environmental Impact Stats */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-8 mb-12 text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black/10 to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 translate-x-32"></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Your Environmental Impact</h2>
              <p className="text-emerald-200 text-lg">Making a difference for our planet</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl inline-block mb-4">
                  <Earth className="w-8 h-8" />
                </div>
                <p className="text-3xl font-bold mb-1">{((wallet?.creditBalance || 0) * 2.5).toFixed(1)}</p>
                <p className="text-emerald-200">Tons CO₂ Offset</p>
              </div>

              <div className="text-center">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl inline-block mb-4">
                  <TreePine className="w-8 h-8" />
                </div>
                <p className="text-3xl font-bold mb-1">{((wallet?.creditBalance || 0) * 45).toLocaleString()}</p>
                <p className="text-emerald-200">Trees Equivalent</p>
              </div>

              <div className="text-center">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl inline-block mb-4">
                  <Recycle className="w-8 h-8" />
                </div>
                <p className="text-3xl font-bold mb-1">{transactions.length}</p>
                <p className="text-emerald-200">Green Transactions</p>
              </div>

              <div className="text-center">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl inline-block mb-4">
                  <Leaf className="w-8 h-8" />
                </div>
                <p className="text-3xl font-bold mb-1">92.5%</p>
                <p className="text-emerald-200">Sustainability Score</p>
              </div>
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

        {/* Modern Transaction History */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-green-50 p-8 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Transaction History</h2>
                  <p className="text-gray-600 text-lg">Your green investment journey</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-bold">{transactions.length} Transactions</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {transactions.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative inline-block mb-8">
                  <div className="p-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full">
                    <Wallet className="w-20 h-20 text-green-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Go Green?</h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                  Start your environmental impact journey with your first green investment.
                </p>
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Leaf className="w-5 h-5 inline mr-2" />
                  Start Green Investment
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <div key={transaction.id || index} className="bg-gradient-to-r from-gray-50 to-green-50/30 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className={`p-3 rounded-xl shadow-sm ${
                          transaction.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' :
                          transaction.type === 'WITHDRAWAL' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-4 mb-2">
                            <span className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                              {transaction.type}
                            </span>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(transaction.status)}
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-2">
                            {transaction.description || 'Green investment transaction'}
                          </p>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</span>
                            </div>
                            {transaction.type === 'DEPOSIT' && (
                              <div className="flex items-center space-x-2">
                                <Leaf className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600 font-medium">Eco-friendly</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'DEPOSIT' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          ≈ {((transaction.amount / 25) * 2.5).toFixed(1)} tons CO₂
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modern Environmental Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl transform transition-all overflow-hidden">
              {/* Modern Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Leaf className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Green Investment</h3>
                      <p className="text-green-200">Fund your eco portfolio</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-6">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      Investment Amount (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg font-semibold"
                      />
                    </div>
                    {depositAmount && (
                      <div className="mt-2 p-3 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center space-x-2 text-green-700">
                          <TreePine className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Environmental impact: ≈ {(parseFloat(depositAmount || 0) / 25 * 2.5).toFixed(1)} tons CO₂ offset
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      Payment Method
                    </label>
                    <select
                      value={depositMethod}
                      onChange={(e) => setDepositMethod(e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                    >
                      <option value="bank_transfer">🏦 Bank Transfer</option>
                      <option value="credit_card">💳 Credit Card</option>
                      <option value="vnpay">📱 VNPay Digital Wallet</option>
                    </select>
                  </div>

                  {/* Quick Amount Selection */}
                  <div>
                    <p className="text-sm font-bold text-gray-800 mb-3">Popular amounts:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { amount: 100, impact: '10 tons CO₂' },
                        { amount: 500, impact: '50 tons CO₂' },
                        { amount: 1000, impact: '100 tons CO₂' },
                        { amount: 2500, impact: '250 tons CO₂' }
                      ].map(({ amount, impact }) => (
                        <button
                          key={amount}
                          onClick={() => setDepositAmount(amount.toString())}
                          className="p-3 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all text-center group"
                        >
                          <div className="font-bold text-green-600 group-hover:text-green-700">
                            ${amount}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{impact}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <h4 className="font-medium text-gray-800">Secure Transaction</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Bank-level encryption • Instant processing • Environmental impact tracking
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => {
                      setShowDepositModal(false);
                      setDepositAmount('');
                    }}
                    className="flex-1 py-4 px-6 border-2 border-gray-300 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeposit}
                    disabled={depositing || !depositAmount}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    {depositing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Leaf className="w-5 h-5" />
                        <span>Invest Green</span>
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
    </div>
  );
};

export default WalletPage;
