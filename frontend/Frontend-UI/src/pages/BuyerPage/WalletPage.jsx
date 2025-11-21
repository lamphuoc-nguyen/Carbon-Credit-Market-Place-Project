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
import Footer from '../../Components/Footer';
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
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
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
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
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
            <p className="mt-4 text-gray-600">Loading wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar_Buyer />

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                onClick={() => setShowBalance(!showBalance)}
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

            <button
              onClick={() => setShowDepositModal(true)}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium"
            >
              Deposit
            </button>
          </div>

          {/* Carbon Credits Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-green-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TreePine className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Carbon Credits</h3>
              </div>
            </div>

            <p className="text-3xl font-bold text-gray-900 mb-1">
              {(wallet?.creditBalance || 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mb-4">Credits</p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-800">Available for trading</p>
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
              <p className="text-2xl font-bold text-gray-900">{((wallet?.creditBalance || 0) * 2.5).toFixed(1)}</p>
              <p className="text-xs text-gray-500">Tons</p>
            </div>

            <div className="group">
              <div className="flex items-center gap-2 mb-2">
                <TreePine className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-sm text-gray-600">Tree Equivalent</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{((wallet?.creditBalance || 0) * 45).toFixed(0)}</p>
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
                ${((wallet?.cashBalance || 0) + ((wallet?.creditBalance || 0) * 10)).toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">USD</p>
            </div>
          </div>
        </div>

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
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {transaction.type}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
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
                        <span className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'DEPOSIT' ? '+' : '-'}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Deposit Funds</h3>
                <p className="text-sm text-gray-600">Add funds to your wallet</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Enter amount to deposit
                </p>
              </div>

              {/* Quick Select */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Quick Select:</p>
                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 250, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setDepositAmount(amount.toString())}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="vnpay">VNPay</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositAmount('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={depositing || !depositAmount}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {depositing ? 'Processing...' : 'Deposit'}
                </button>
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
