import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, DollarSign, Leaf, TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, RefreshCw, Zap, ArrowRightLeft } from 'lucide-react';
import EvOwnerAPI from '../../api/EvOwnerAPI';
import { carbonCreditApi } from '../../api/carbonCreditApi';
import Navbar from '../../Components/EVComponents/Navbar';

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
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [conversionAmount, setConversionAmount] = useState('');

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        console.warn('⚠️ No token found, redirecting to login');
        navigate('/login');
        return;
      }
      
      console.log('💰 Fetching wallet data...');
      const response = await EvOwnerAPI.wallet.getMyWallet();
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
      const response = await EvOwnerAPI.wallet.getTransactions({ page: 0, size: 10 });
      const txData = response.data?.data || response.data || [];
      
      console.log('✅ Transactions fetched:', txData);
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (error) {
      console.error('❌ Failed to fetch transactions:', error);
      setTransactions([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
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
      await EvOwnerAPI.wallet.deposit({
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
      await EvOwnerAPI.wallet.withdraw({
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

  const handleConvertCo2 = async () => {
    if (!conversionAmount || parseFloat(conversionAmount) < 1000) {
      alert('Minimum 1000kg CO2 required for conversion');
      return;
    }

    if (parseFloat(conversionAmount) > walletData.co2ReducedKg) {
      alert('Insufficient CO2 reduction balance');
      return;
    }

    try {
      console.log('🔄 Converting CO2 to credits...', conversionAmount);
      const response = await carbonCreditApi.convertCo2ToCredits(parseFloat(conversionAmount));

      const result = response.data || response;
      const creditsReceived = result.creditsReceived || (parseFloat(conversionAmount) / 1000);

      alert(`Successfully converted ${conversionAmount}kg CO2 to ${creditsReceived} credits!`);
      setConversionAmount('');
      setShowConversionModal(false);
      await handleRefresh();
    } catch (error) {
      console.error('❌ CO2 conversion failed:', error);
      alert(`Failed to convert CO2: ${error.response?.data?.message || error.message}`);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Wallet className="text-green-600" size={36} />
              My Wallet
            </h1>
            <p className="text-gray-600 mt-2">Manage your funds and carbon credits</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Cash Balance Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Cash Balance</p>
                <h2 className="text-3xl font-bold">${walletData.cashBalance.toFixed(2)}</h2>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <DollarSign size={24} />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowDepositModal(true)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                <ArrowDownRight size={16} />
                Deposit
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white bg-opacity-20 text-white rounded-lg text-sm font-semibold hover:bg-opacity-30 transition-colors text-blue-500"
              >
                <ArrowUpRight size={16} />
                Withdraw
              </button>
            </div>
          </div>

          {/* CO2 Reduction Balance Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-2">CO2 Reduced</p>
                <h2 className="text-3xl font-bold">{walletData.co2ReducedKg.toFixed(1)}</h2>
                <p className="text-orange-100 text-sm mt-1">kg CO2</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Zap size={24} />
              </div>
            </div>

            <div className="mt-4">
              {walletData.co2ReducedKg >= 1000 ? (
                <button
                  onClick={() => setShowConversionModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white text-orange-700 rounded-lg text-sm font-semibold hover:bg-orange-50 transition-colors"
                >
                  <ArrowRightLeft size={16} />
                  Convert to Credits
                </button>
              ) : (
                <div className="w-full p-2 bg-white bg-opacity-20 rounded-lg text-center font-bold text-orange-400">
                  <p className="text-xs text-orange-500">
                    Need {(1000 - walletData.co2ReducedKg).toFixed(1)}kg more to convert
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Carbon Credit Balance Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-green-100 text-sm font-medium mb-2">Carbon Credits</p>
                <h2 className="text-3xl font-bold">{walletData.creditBalance.toFixed(2)}</h2>
                <p className="text-green-100 text-sm mt-1">Credits</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Leaf size={24} />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4 p-2 bg-white bg-opacity-20 rounded-lg">
              <TrendingUp size={16} />
              <span className="text-s font-medium text-green-500 font-bold">Tradeable Credits</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="text-purple-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-700">Account Age</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {walletData.createdAt ? Math.floor((new Date() - new Date(walletData.createdAt)) / (1000 * 60 * 60 * 24)) : 0} days
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CreditCard className="text-orange-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-700">Total Value</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${(walletData.cashBalance + walletData.creditBalance * 10 + (walletData.co2ReducedKg / 1000) * 10).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Cash + Credits + CO2 potential</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-700">Transactions</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            <p className="text-xs text-gray-500 mt-1">Recent activity</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Wallet className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-lg font-medium">No transactions yet</p>
              <p className="text-sm mt-2">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${tx.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {tx.type === 'deposit' ? (
                        <ArrowDownRight className="text-green-600" size={20} />
                      ) : (
                        <ArrowUpRight className="text-red-600" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{tx.description || tx.type}</p>
                      <p className="text-sm text-gray-500">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-gray-500">{tx.status || 'Completed'}</p>
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
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Deposit Funds</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDepositModal(false);
                  setDepositAmount('');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Withdraw Funds</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={walletData.cashBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available: ${walletData.cashBalance.toFixed(2)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount('');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CO2 Conversion Modal */}
      {showConversionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Convert CO2 to Credits</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CO2 Amount (kg)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">kg</span>
                <input
                  type="number"
                  min="1000"
                  step="100"
                  max={walletData.co2ReducedKg}
                  value={conversionAmount}
                  onChange={(e) => setConversionAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available: {walletData.co2ReducedKg.toFixed(1)}kg CO2 | Minimum: 1000kg
              </p>
              {conversionAmount && conversionAmount >= 1000 && (
                <p className="text-sm text-green-600 mt-2">
                  Will receive: {Math.floor(conversionAmount / 1000)} credit(s)
                </p>
              )}
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-orange-700 mb-1">
                <ArrowRightLeft size={16} />
                <span className="text-sm font-medium">Conversion Rate</span>
              </div>
              <p className="text-xs text-orange-600">1000kg CO2 = 1 Carbon Credit</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConversionModal(false);
                  setConversionAmount('');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertCo2}
                disabled={!conversionAmount || conversionAmount < 1000 || conversionAmount > walletData.co2ReducedKg}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Convert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default WalletPage;