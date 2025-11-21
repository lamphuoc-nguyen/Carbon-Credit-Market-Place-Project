import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, DollarSign, Leaf, TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, ArrowRightLeft, RefreshCw, TreePine, Earth, CheckCircle, Eye, EyeOff } from 'lucide-react';
import EvOwnerAPI from '../../api/EvOwnerAPI';
import userDataFetcher from '../../api/userDataFetcher';
import Navbar from '../../Components/EVComponents/Navbar';
import Co2TransferComponent from '../../Components/EVComponents/Co2TransferComponent';
import Footer from '../../Components/Footer';

const WalletPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [walletData, setWalletData] = useState({
    cashBalance: 0,
    creditBalance: 0,
    co2ReducedKg: 0,
    userId: '',
    createdAt: '',
    updatedAt: ''
  });

  const [showBalance, setShowBalance] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        console.warn('⚠️ No token found, redirecting to login');
        navigate('/login');
        return;
      }
      
      console.log('💰 Fetching wallet data via centralized fetcher...');
      const response = await userDataFetcher.getWalletData();
      const wallet = response.data?.data || response.data || {};
      
      console.log('✅ Wallet data fetched:', wallet);
      
      setWalletData({
        cashBalance: wallet.cashBalance || wallet.cash_balance || 0,
        creditBalance: wallet.creditBalance || wallet.credit_balance || 0,
        co2ReducedKg: wallet.co2ReducedKg || wallet.co2_reduced_kg || 0,
        userId: wallet.userId || wallet.user_id || '',
        createdAt: wallet.createdAt || wallet.created_at || '',
        updatedAt: wallet.updatedAt || wallet.updated_at || ''
      });
    } catch (error) {
      console.error('❌ Failed to fetch wallet:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('🔐 Authentication failed, redirecting to login');
        navigate('/login');
      } else {
        alert('Failed to load wallet data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };



  const fetchTransactions = async () => {
    try {
      console.log('📊 Fetching wallet transactions...');

      let response;
      let txData;

      try {
        console.log('Trying wallet transactions endpoint...');
        response = await EvOwnerAPI.wallets.getTransactions(0, 50);
        txData = response.data?.content || response.data?.data || response.data || [];
      } catch {
        try {
          console.log('Trying user data fetcher...');
          response = await userDataFetcher.getWalletTransactions?.() || { data: [] };
          txData = response.data?.content || response.data?.data || response.data || [];
        } catch {
          console.log('Trying direct wallet API...');
          try {
            const { walletApi } = await import('../../api');
            response = await walletApi.getWalletTransactions(0, 50);
            txData = response.data?.content || response.data?.data || response.data || [];
          } catch {
            console.log('All transaction fetching methods failed, using empty array');
            txData = [];
          }
        }
      }

      console.log('✅ Transactions fetched:', txData);
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (error) {
      console.error('❌ Failed to fetch transactions:', error);
      setTransactions([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Force refresh by invalidating cache first
    userDataFetcher.invalidateWalletData();
    await fetchWalletData();
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      console.log('💵 Depositing funds...', depositAmount);
      await EvOwnerAPI.wallets.deposit({
        amount: parseFloat(depositAmount),
        paymentMethodId: 'default-payment-method'
      });
      
      alert(`Successfully deposited $${depositAmount}!`);
      setDepositAmount('');
      setShowDepositModal(false);
      await handleRefresh();
    } catch (error) {
      console.error('❌ Deposit failed:', error);
      alert(`Failed to deposit: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > walletData.cashBalance) {
      alert('Insufficient balance');
      return;
    }

    try {
      console.log('💸 Withdrawing funds...', withdrawAmount);
      await EvOwnerAPI.wallets.withdraw({
        amount: parseFloat(withdrawAmount),
        bankAccountInfo: 'User bank account'
      });
      
      alert(`Successfully withdrew $${withdrawAmount}!`);
      setWithdrawAmount('');
      setShowWithdrawModal(false);
      await handleRefresh();
    } catch (error) {
      console.error('❌ Withdrawal failed:', error);
      alert(`Failed to withdraw: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50" 
           style={{
             backgroundImage: "url('/src/image/bg4.png')",
             backgroundSize: '100% auto',
             backgroundPosition: 'top center',
             backgroundRepeat: 'no-repeat',
             backgroundAttachment: 'fixed'
           }}>
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
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {showBalance ? <Eye className="w-4 h-4 text-gray-600" /> : <EyeOff className="w-4 h-4 text-gray-600" />}
                </button>
              </div>

              <p className="text-3xl font-bold text-gray-900 mb-4 transition-all duration-300">
                ${showBalance ? walletData.cashBalance.toFixed(2) : '••••••'}
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
                  onClick={() => setShowWithdrawModal(true)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium hover:scale-105 active:scale-95"
                >
                  Withdraw
                </button>
              </div>
            </div>

            {/* CO2 Reduced Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-orange-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Leaf className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">CO₂ Reduced</h3>
                </div>
              </div>

              <p className="text-3xl font-bold text-gray-900 mb-1">
                {walletData.co2ReducedKg.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 mb-4">kg CO₂</p>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-orange-800 font-medium">
                    {walletData.co2ReducedKg >= 1000
                      ? '✓ Ready to transfer'
                      : `${((walletData.co2ReducedKg / 1000) * 100).toFixed(0)}% to 1 credit`
                    }
                  </p>
                  <p className="text-xs text-orange-600">{walletData.co2ReducedKg.toFixed(0)}/1000kg</p>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-1.5">
                  <div 
                    className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((walletData.co2ReducedKg / 1000) * 100, 100)}%` }}
                  ></div>
                </div>
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
                {walletData.creditBalance.toFixed(2)}
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
                  <p className="text-sm text-gray-600">CO₂ Saved</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{(walletData.co2ReducedKg / 1000).toFixed(2)}</p>
                <p className="text-xs text-gray-500">Tons</p>
              </div>

              <div className="group">
                <div className="flex items-center gap-2 mb-2">
                  <TreePine className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-sm text-gray-600">Tree Equivalent</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{(walletData.co2ReducedKg * 0.045).toFixed(0)}</p>
                <p className="text-xs text-gray-500">Trees</p>
              </div>

              <div className="group">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-sm text-gray-600">Days Active</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {walletData.createdAt ? Math.floor((new Date() - new Date(walletData.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
                </p>
                <p className="text-xs text-gray-500">Days</p>
              </div>

              <div className="group">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-sm text-gray-600">Total Value</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${(walletData.cashBalance + walletData.creditBalance * 10).toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">USD</p>
              </div>
            </div>
          </div>

          {/* CO2 Transfer Section */}
          <div className="mb-8">
            <Co2TransferComponent onTransferComplete={handleRefresh} />
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
                    Start by depositing funds or generating carbon credits
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
                            transaction.type === 'DEPOSIT' || transaction.type === 'deposit' ? 'bg-green-100 text-green-600' :
                            transaction.type === 'WITHDRAWAL' || transaction.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                            transaction.type === 'CREDIT_CONVERSION' || transaction.type === 'co2_transfer' ? 'bg-orange-100 text-orange-600' :
                            transaction.type === 'CREDIT_SALE' || transaction.type === 'credit_sale' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {transaction.type === 'DEPOSIT' || transaction.type === 'deposit' ? (
                              <ArrowDownRight className="w-5 h-5" />
                            ) : transaction.type === 'WITHDRAWAL' || transaction.type === 'withdrawal' ? (
                              <ArrowUpRight className="w-5 h-5" />
                            ) : transaction.type === 'CREDIT_CONVERSION' || transaction.type === 'co2_transfer' ? (
                              <ArrowRightLeft className="w-5 h-5" />
                            ) : transaction.type === 'CREDIT_SALE' || transaction.type === 'credit_sale' ? (
                              <TrendingUp className="w-5 h-5" />
                            ) : (
                              <CreditCard className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">
                                {transaction.type?.replace('_', ' ') || 'Transaction'}
                              </span>
                              <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800">
                                {transaction.status || 'Completed'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {transaction.description || 'Transaction'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'Recent'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${
                            transaction.type === 'DEPOSIT' || transaction.type === 'deposit' ? 'text-green-600' :
                            transaction.type === 'WITHDRAWAL' || transaction.type === 'withdrawal' ? 'text-red-600' :
                            transaction.type === 'CREDIT_SALE' || transaction.type === 'credit_sale' ? 'text-blue-600' :
                            'text-gray-900'
                          }`}>
                            {transaction.type === 'DEPOSIT' || transaction.type === 'deposit' ? '+' :
                             transaction.type === 'WITHDRAWAL' || transaction.type === 'withdrawal' ? '-' :
                             transaction.type === 'CREDIT_SALE' || transaction.type === 'credit_sale' ? '+' : ''}
                            ${transaction.amount?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Modern Environmental Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl transform transition-all overflow-hidden">
            {/* Modern Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <TreePine className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Fund EV Journey</h3>
                    <p className="text-green-200">Power your carbon credit generation</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Deposit Amount (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg font-semibold"
                    />
                  </div>
                  {depositAmount && (
                    <div className="mt-2 p-3 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center space-x-2 text-green-700">
                        <Earth className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Ready to fund your sustainable EV journeys
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Amount Selection */}
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-3">Quick amounts:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[50, 100, 250, 500].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDepositAmount(amount.toString())}
                        className="p-3 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all text-center group"
                      >
                        <div className="font-bold text-green-600 group-hover:text-green-700">
                          ${amount}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">EV Fund</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium text-gray-800">Secure EV Funding</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Bank-level security • Instant processing • EV journey tracking
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
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <TreePine className="w-5 h-5" />
                    <span>Fund EV</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Environmental Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl transform transition-all overflow-hidden">
            {/* Modern Modal Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <ArrowUpRight className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Withdraw Funds</h3>
                    <p className="text-orange-200">Transfer to your bank account</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Withdrawal Amount (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-600" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      max={walletData.cashBalance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-lg font-semibold"
                    />
                  </div>
                  <div className="mt-2 p-3 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-center justify-between text-orange-700">
                      <span className="text-sm font-medium">Available Balance:</span>
                      <span className="text-sm font-bold">${walletData.cashBalance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Amount Selection */}
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-3">Quick amounts:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      Math.min(25, walletData.cashBalance),
                      Math.min(100, walletData.cashBalance),
                      Math.min(250, walletData.cashBalance),
                      walletData.cashBalance
                    ].filter(amount => amount > 0).map((amount, idx) => (
                      <button
                        key={idx}
                        onClick={() => setWithdrawAmount(amount.toFixed(2))}
                        className="p-3 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all text-center group"
                      >
                        <div className="font-bold text-orange-600 group-hover:text-orange-700">
                          ${amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {idx === 3 ? 'All' : 'Withdraw'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-orange-600" />
                    <h4 className="font-medium text-gray-800">Secure Withdrawal</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Bank-level security • 1-3 business days • Instant confirmation
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawAmount('');
                  }}
                  className="flex-1 py-4 px-6 border-2 border-gray-300 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ArrowUpRight className="w-5 h-5" />
                    <span>Withdraw</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    <Footer />
    </>
  );
};

export default WalletPage;