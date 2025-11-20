import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  DollarSign,
  TrendingUp,
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
  Zap,
  ShoppingCart
} from 'lucide-react';
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer';
import { walletApi } from '../../api/walletApi';

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
        return <Zap className="w-5 h-5 text-gray-600" />;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar_Buyer />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl">
                <Wallet className="w-8 h-8 text-green-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Digital Wallet</h1>
                <p className="text-gray-500 text-lg">Secure carbon credit transactions</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl px-6 py-3 flex items-center space-x-2 hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="font-semibold">Refresh</span>
            </button>
          </div>
        </div>

        {/* Enhanced Balance Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Main Balance Card - Larger */}
          <div className="lg:col-span-5 relative">
            <div className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-3xl p-8 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <DollarSign className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-green-100 text-sm font-medium">Available Cash</p>
                      <p className="text-white/90 text-xs">Ready for transactions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-200"
                  >
                    {showBalance ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                  </button>
                </div>
                <div className="mb-4">
                  <p className="text-4xl font-bold tracking-tight mb-2">
                    {showBalance ? formatCurrency(wallet?.cashBalance) : '••••••••'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                    <p className="text-green-100 text-sm">Live Balance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carbon Credits Card */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 text-white relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/5 rounded-full"></div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Carbon Credits</p>
                    <p className="text-white/80 text-xs">Portfolio Value</p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-3xl font-bold mb-1">
                    {showBalance ? (wallet?.creditBalance || 0).toLocaleString() : '••••••'}
                  </p>
                  <p className="text-blue-100 text-sm">CO2 Tonnes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-800 text-sm font-semibold">Quick Actions</p>
                  <p className="text-gray-500 text-xs">Manage your wallet</p>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Add Funds
                </button>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:border-green-300 hover:bg-green-50 transition-all duration-300"
                >
                  <ShoppingCart className="w-5 h-5 inline mr-2" />
                  Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Transaction History */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                  <p className="text-gray-500">Your latest transactions and activities</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 font-medium">Last {transactions.length} transactions</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {transactions.length === 0 ? (
              <div className="p-16 text-center">
                <div className="max-w-sm mx-auto">
                  <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-6 inline-block">
                    <Wallet className="w-16 h-16 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No transactions yet</h3>
                  <p className="text-gray-500 mb-6">Your transaction history will appear here when you start using your wallet</p>
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300"
                  >
                    Make Your First Deposit
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {transactions.map((transaction, index) => (
                    <div key={transaction.id || index} className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${
                            transaction.type === 'DEPOSIT' ? 'bg-green-100' :
                            transaction.type === 'WITHDRAWAL' ? 'bg-red-100' :
                            'bg-blue-100'
                          }`}>
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-3">
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
                            <p className="text-gray-500 text-sm mt-1">
                              {transaction.description || 'No description available'}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-bold ${getTransactionColor(transaction.type)}`}>
                            {transaction.type === 'DEPOSIT' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl transform transition-all">
              <div className="text-center mb-8">
                <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl inline-block mb-4">
                  <Plus className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Add Funds</h3>
                <p className="text-gray-500">Deposit money to your carbon credit wallet</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <select
                    value={depositMethod}
                    onChange={(e) => setDepositMethod(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-medium"
                  >
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                    <option value="credit_card">💳 Credit Card</option>
                    <option value="vnpay">📱 VNPay</option>
                  </select>
                </div>

                {/* Enhanced Quick Amount Buttons */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Quick amounts:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[10, 50, 100, 500].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDepositAmount(amount.toString())}
                        className="py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-semibold hover:border-green-400 hover:bg-green-50 transition-all hover:scale-105 transform"
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositAmount('');
                  }}
                  className="flex-1 py-4 px-6 border-2 border-gray-300 rounded-2xl font-semibold hover:bg-gray-50 transition-all text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={depositing || !depositAmount}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {depositing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Add Funds'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
