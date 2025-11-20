import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, DollarSign, Leaf, TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, RefreshCw, ArrowRightLeft, TreePine, Earth, Plus, CheckCircle, Eye, EyeOff } from 'lucide-react';
import EvOwnerAPI from '../../api/EvOwnerAPI';
import userDataFetcher from '../../api/userDataFetcher';
import Navbar from '../../Components/EVComponents/Navbar';
import Co2TransferComponent from '../../Components/EVComponents/Co2TransferComponent';

const WalletPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletData, setWalletData] = useState({
    cashBalance: 0,
    creditBalance: 0,
    co2ReducedKg: 0,
    userId: '',
    createdAt: '',
    updatedAt: ''
  });
  const [transactions, setTransactions] = useState([]);
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

      // Try multiple methods to get transactions
      let response;
      let txData;

      try {
        // First try the wallet transactions endpoint with proper parameters
        console.log('Trying wallet transactions endpoint...');
        response = await EvOwnerAPI.wallets.getTransactions(0, 20); // page, size
        txData = response.data?.content || response.data?.data || response.data || [];
      } catch {
        try {
          // Try alternative approach with userDataFetcher
          console.log('Trying user data fetcher...');
          response = await userDataFetcher.getWalletTransactions?.() || { data: [] };
          txData = response.data?.content || response.data?.data || response.data || [];
        } catch {
          // Try direct wallet API approach
          console.log('Trying direct wallet API...');
          try {
            const { walletApi } = await import('../../api');
            response = await walletApi.getWalletTransactions(0, 20);
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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
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
                      <TreePine className="w-12 h-12 text-green-200" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-5xl font-bold text-white mb-2">
                      EV EcoWallet
                    </h1>
                    <p className="text-emerald-200 text-xl font-medium">
                      Sustainable Carbon Credit Generation
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-emerald-200 text-sm font-medium">CO₂ Reduced</p>
                      <p className="text-3xl font-bold text-white">
                        {walletData.co2ReducedKg.toFixed(1)}
                      </p>
                      <p className="text-emerald-300 text-sm">kg CO₂</p>
                    </div>
                    <div>
                      <p className="text-emerald-200 text-sm font-medium">Carbon Credits</p>
                      <p className="text-3xl font-bold text-white">
                        {walletData.creditBalance.toFixed(2)}
                      </p>
                      <p className="text-emerald-300 text-sm">credits earned</p>
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
                    <p className="text-green-700 font-bold text-sm">EV Impact!</p>
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
                    <p className="text-gray-500">Available funds</p>
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
                  ${showBalance ? walletData.cashBalance.toFixed(2) : '••••••••'}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-green-600 text-sm font-medium">Available</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Deposit</span>
                </button>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>

            {/* CO2 Reduction Card */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <TreePine className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">CO₂ Reduced</h3>
                    <p className="text-orange-200">From EV journeys</p>
                  </div>
                </div>

                <p className="text-4xl font-bold mb-2">
                  {walletData.co2ReducedKg.toFixed(1)}
                </p>
                <p className="text-orange-200 mb-4">kg CO₂</p>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <ArrowRightLeft className="w-4 h-4" />
                    <span className="text-sm font-semibold">Transfer to Credits</span>
                  </div>
                  <p className="text-xs text-orange-300">
                    {walletData.co2ReducedKg >= 1000
                      ? '✓ Ready! See transfer section below'
                      : `Need ${(1000 - walletData.co2ReducedKg).toFixed(1)}kg more`
                    }
                  </p>
                  {walletData.co2ReducedKg >= 1000 && (
                    <div className="animate-pulse mt-2">
                      <div className="h-1 bg-orange-300 rounded-full w-3/4"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Carbon Credits Card */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Leaf className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Carbon Credits</h3>
                    <p className="text-green-200">Tradeable credits</p>
                  </div>
                </div>

                <p className="text-4xl font-bold mb-2">
                  {walletData.creditBalance.toFixed(2)}
                </p>
                <p className="text-green-200 mb-4">Credits</p>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">Ready to Trade</span>
                  </div>
                </div>
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
                <p className="text-emerald-200 text-lg">Making a difference through electric mobility</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl inline-block mb-4">
                    <Earth className="w-8 h-8" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{(walletData.co2ReducedKg / 1000).toFixed(1)}</p>
                  <p className="text-emerald-200">Tons CO₂ Reduced</p>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl inline-block mb-4">
                    <TreePine className="w-8 h-8" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{(walletData.co2ReducedKg * 0.045).toFixed(0)}</p>
                  <p className="text-emerald-200">Trees Equivalent</p>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl inline-block mb-4">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <p className="text-3xl font-bold mb-1">
                    {walletData.createdAt ? Math.floor((new Date() - new Date(walletData.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
                  </p>
                  <p className="text-emerald-200">Days Active</p>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl inline-block mb-4">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <p className="text-3xl font-bold mb-1">
                    ${(walletData.cashBalance + walletData.creditBalance * 10 + (walletData.co2ReducedKg / 1000) * 10).toFixed(0)}
                  </p>
                  <p className="text-emerald-200">Total Portfolio Value</p>
                </div>
              </div>
            </div>
          </div>

          {/* CO2 Transfer Section */}
          <div className="mb-8">
            <Co2TransferComponent onTransferComplete={handleRefresh} />
          </div>

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
                    <p className="text-gray-600 text-lg">Your EV impact and trading activity</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-700 font-bold">{transactions.length} Transactions</span>
                    </div>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Your EV Impact Journey</h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                    Begin generating carbon credits through your electric vehicle journeys and fund management.
                  </p>
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <TreePine className="w-5 h-5 inline mr-2" />
                    Start EV Journey
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction, index) => (
                    <div key={transaction.id || index} className="bg-gradient-to-r from-gray-50 to-green-50/30 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className={`p-3 rounded-xl shadow-sm ${
                            transaction.type === 'DEPOSIT' || transaction.type === 'deposit' ? 'bg-green-100 text-green-600' :
                            transaction.type === 'WITHDRAWAL' || transaction.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                            transaction.type === 'CREDIT_CONVERSION' || transaction.type === 'co2_transfer' ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {transaction.type === 'DEPOSIT' || transaction.type === 'deposit' ? (
                              <ArrowDownRight className="w-5 h-5" />
                            ) : transaction.type === 'WITHDRAWAL' || transaction.type === 'withdrawal' ? (
                              <ArrowUpRight className="w-5 h-5" />
                            ) : transaction.type === 'CREDIT_CONVERSION' || transaction.type === 'co2_transfer' ? (
                              <ArrowRightLeft className="w-5 h-5" />
                            ) : (
                              <CreditCard className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-4 mb-2">
                              <span className={`font-bold text-lg ${
                                transaction.type === 'DEPOSIT' || transaction.type === 'deposit' ? 'text-green-600' :
                                transaction.type === 'WITHDRAWAL' || transaction.type === 'withdrawal' ? 'text-red-600' :
                                transaction.type === 'CREDIT_CONVERSION' || transaction.type === 'co2_transfer' ? 'text-orange-600' :
                                'text-blue-600'
                              }`}>
                                {transaction.type?.toUpperCase() || 'TRANSACTION'}
                              </span>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  {transaction.status || 'COMPLETED'}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-2">
                              {transaction.description || 'EV carbon credit transaction'}
                            </p>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'Recent'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <TreePine className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600 font-medium">EV Impact</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-bold ${
                            transaction.type === 'DEPOSIT' || transaction.type === 'deposit' ? 'text-green-600' :
                            transaction.type === 'WITHDRAWAL' || transaction.type === 'withdrawal' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {transaction.type === 'DEPOSIT' || transaction.type === 'deposit' ? '+' :
                             transaction.type === 'WITHDRAWAL' || transaction.type === 'withdrawal' ? '-' : ''}
                            ${transaction.amount?.toFixed(2) || '0.00'}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {transaction.type === 'CREDIT_CONVERSION' || transaction.type === 'co2_transfer' ?
                              'CO₂ → Credits' : 'Cash transaction'
                            }
                          </p>
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
    </>
  );
};

export default WalletPage;