import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer';
import { buyerApi } from '../../api';

const WalletPage = () => {
  const navigate = useNavigate();
  
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Deposit Modal State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('bank_transfer');
  const [depositing, setDepositing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch wallet info
      const walletData = await buyerApi.getMyWallet();
      console.log('✅ Raw Wallet Response:', JSON.stringify(walletData, null, 2));
      console.log('✅ Full Name:', walletData.fullName);
      console.log('✅ Username:', walletData.username);
      console.log('✅ User ID:', walletData.userId);
      console.log('✅ Cash Balance:', walletData.cashBalance);
      console.log('✅ Credit Balance:', walletData.creditBalance);
      
      setWallet(walletData);
      
      // Fetch wallet transactions
      try {
        const transactionsData = await buyerApi.getWalletTransactions(0, 10);
        setTransactions(transactionsData.content || []);
        console.log('✅ Transactions:', transactionsData);
      } catch (txError) {
        console.warn('⚠️ Could not fetch transactions:', txError);
        // Don't fail the whole page if transactions fail
      }
      
    } catch (err) {
      console.error('❌ Error fetching wallet data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(depositAmount);
    
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (amount < 10) {
      alert('Minimum deposit amount is $10');
      return;
    }
    
    setDepositing(true);
    
    try {
      await buyerApi.depositFunds(amount, depositMethod);
      alert(`Successfully deposited $${amount.toFixed(2)} to your wallet!`);
      
      // Reset form and close modal
      setDepositAmount('');
      setShowDepositModal(false);
      
      // Refresh wallet data
      fetchWalletData();
      
    } catch (err) {
      console.error('❌ Deposit Error:', err);
      alert(err.response?.data?.message || err.message || 'Deposit failed. Please try again.');
    } finally {
      setDepositing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar_Buyer />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-green-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (error || !wallet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar_Buyer />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-700">{error || 'Wallet not found'}</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar_Buyer />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 mt-2">Manage your carbon credit wallet and transactions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Wallet Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Info Card */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-3xl font-bold">
                  {wallet.fullName?.charAt(0).toUpperCase() || wallet.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{wallet.fullName || wallet.username || 'User'}</h2>
                  <p className="text-green-100">@{wallet.username || 'username'}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-semibold">
                    BUYER
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Cash Balance */}
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <p className="text-gray-500 text-sm mb-1">Cash Balance</p>
                  <p className="text-3xl font-bold text-green-600">${wallet.cashBalance?.toLocaleString() || '0.00'}</p>
                </div>

                {/* Credit Balance */}
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <p className="text-gray-500 text-sm mb-1">Credit Balance</p>
                  <p className="text-3xl font-bold text-blue-600">{wallet.creditBalance?.toLocaleString() || '0'}</p>
                  <p className="text-gray-500 text-xs mt-1">tonnes CO₂e</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition border-2 border-green-200 hover:border-green-400 cursor-pointer"
                >
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-semibold text-gray-900">Deposit Funds</span>
                </button>

                <button
                  onClick={() => navigate('/marketplace')}
                  className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition border-2 border-blue-200 hover:border-blue-400 cursor-pointer"
                >
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-semibold text-gray-900">Buy Credits</span>
                </button>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No transactions yet</p>
                  <p className="text-sm text-gray-400 mt-1">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx, index) => (
                    <div key={tx.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'DEPOSIT' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {tx.type === 'DEPOSIT' ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{tx.type || 'Transaction'}</p>
                          <p className="text-sm text-gray-500">
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {tx.type === 'DEPOSIT' ? '+' : ''}${tx.amount?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-gray-500">{tx.status || 'COMPLETED'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Stats & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Wallet Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Statistics</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Wallet ID</p>
                  <p className="font-mono text-xs text-gray-900 break-all">
                    {wallet.walletId?.toString() || wallet.id?.toString() || 'N/A'}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(wallet.cashBalance + (wallet.creditBalance * 10) || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Cash + Credits (est. $10/tonne)
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Account Status</p>
                  <span className="inline-block px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700">2FA Enabled</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700">Verified Account</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700">Secure Encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Deposit Funds</h2>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleDeposit}>
              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Deposit Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="10"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-600 focus:outline-none text-lg font-semibold"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Minimum deposit: $10.00</p>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Payment Method
                </label>
                
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                    depositMethod === 'bank_transfer' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="depositMethod"
                      value="bank_transfer"
                      checked={depositMethod === 'bank_transfer'}
                      onChange={(e) => setDepositMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Bank Transfer</p>
                      <p className="text-xs text-gray-500">Direct bank transfer</p>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                    depositMethod === 'credit_card' 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="depositMethod"
                      value="credit_card"
                      checked={depositMethod === 'credit_card'}
                      onChange={(e) => setDepositMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Credit/Debit Card</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                  disabled={depositing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depositing || !depositAmount || parseFloat(depositAmount) < 10}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {depositing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Deposit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;