import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowUpRight, ArrowDownRight, CreditCard, ArrowRightLeft, RefreshCw, TrendingUp, DollarSign, Leaf } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import EvOwnerAPI from '../../api/EvOwnerAPI';
import userDataFetcher from '../../api/userDataFetcher';
import Navbar from '../../Components/EVComponents/Navbar';
import Footer from '../../Components/Footer';

const Report = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [journeys, setJourneys] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [walletData, setWalletData] = useState({
    cashBalance: 0,
    creditBalance: 0,
    co2ReducedKg: 0,
    userId: '',
    createdAt: '',
    updatedAt: ''
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        console.warn('⚠️ No token found, redirecting to login');
        navigate('/login');
        return;
      }

      // Fetch wallet data for stats
      const walletResponse = await userDataFetcher.getWalletData();
      const wallet = walletResponse.data?.data || walletResponse.data || {};
      
      setWalletData({
        cashBalance: wallet.cashBalance || wallet.cash_balance || 0,
        creditBalance: wallet.creditBalance || wallet.credit_balance || 0,
        co2ReducedKg: wallet.co2ReducedKg || wallet.co2_reduced_kg || 0,
        userId: wallet.userId || wallet.user_id || '',
        createdAt: wallet.createdAt || wallet.created_at || '',
        updatedAt: wallet.updatedAt || wallet.updated_at || ''
      });
      
      console.log('📊 Wallet CO2 total:', wallet.co2ReducedKg || wallet.co2_reduced_kg);

      // Fetch journeys for CO2 data
      await fetchJourneys();
      // Fetch transactions for revenue data
      await fetchTransactions();
    } catch (error) {
      console.error('❌ Failed to fetch data:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('🔐 Authentication failed, redirecting to login');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchJourneys = async () => {
    try {
      const response = await EvOwnerAPI.journeys.getMyJourneys();
      const journeyData = response.data?.data || response.data || [];
      console.log('✅ Journeys fetched:', journeyData);
      setJourneys(Array.isArray(journeyData) ? journeyData : []);
    } catch (error) {
      console.error('❌ Failed to fetch journeys:', error);
      setJourneys([]);
    }
  };

  const fetchTransactions = async () => {
    try {
      let response;
      let txData;

      try {
        response = await EvOwnerAPI.wallets.getTransactions(0, 100);
        txData = response.data?.content || response.data?.data || response.data || [];
      } catch {
        try {
          response = await userDataFetcher.getWalletTransactions?.() || { data: [] };
          txData = response.data?.content || response.data?.data || response.data || [];
        } catch {
          txData = [];
        }
      }

      console.log('✅ Transactions fetched:', txData);
      console.log('💰 Credit sales:', txData.filter(tx => tx.type === 'CREDIT_SALE' || tx.type === 'credit_sale'));
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (error) {
      console.error('❌ Failed to fetch transactions:', error);
      setTransactions([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    userDataFetcher.invalidateWalletData();
    await fetchData();
    setRefreshing(false);
  };

  // Process data for CO2 chart using useMemo
  const co2ChartData = useMemo(() => {
    console.log('📊 Processing CO2 chart data, journeys count:', journeys.length, journeys);
    
    if (!journeys || journeys.length === 0) {
      console.log('⚠️ No journeys available for chart');
      return [];
    }
    
    const dataByDate = {};
    let totalCO2 = 0;
    let journeysWithDate = 0;
    let journeysWithoutDate = 0;

    journeys.forEach(journey => {
      const co2Value = journey.co2ReducedKg || journey.co2Reduced || journey.co2_reduced;
      const dateValue = journey.verificationDate || journey.startTime || journey.createdAt;
      
      console.log('Processing journey:', { id: journey.id, co2Value, dateValue });
      
      if (co2Value) {
        totalCO2 += parseFloat(co2Value);
      }
      
      if (dateValue && co2Value) {
        journeysWithDate++;
        const date = new Date(dateValue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dataByDate[date] = (dataByDate[date] || 0) + parseFloat(co2Value);
      } else if (co2Value) {
        journeysWithoutDate++;
        console.log('⚠️ Journey without date:', journey);
      }
    });

    const chartData = Object.entries(dataByDate)
      .map(([date, co2]) => ({ date, co2: parseFloat(co2.toFixed(2)) }))
      .slice(-10); // Show last 10 dates
    
    console.log('📊 Total CO2 from all journeys:', totalCO2);
    console.log('📊 Journeys with date:', journeysWithDate);
    console.log('📊 Journeys without date:', journeysWithoutDate);
    console.log('📊 CO2 Chart Data:', chartData);
    return chartData;
  }, [journeys]);

  // Process data for Revenue chart using useMemo
  const revenueChartData = useMemo(() => {
    console.log('💰 Processing Revenue chart data, transactions:', transactions);
    const dataByDate = {};

    // Filter transactions where current user is the seller AND status is COMPLETED
    const currentUserId = walletData.userId;
    
    transactions
      .filter(tx => {
        // Check if current user is the seller and transaction is completed
        const sellerId = tx.seller?.id || tx.seller?.userId || tx.sellerId;
        const isSeller = sellerId === currentUserId;
        const isCompleted = tx.status === 'COMPLETED';
        console.log('Transaction check:', { sellerId, currentUserId, isSeller, isCompleted, amount: tx.amount });
        return isSeller && tx.amount && isCompleted;
      })
      .forEach(tx => {
        const dateValue = tx.completedAt || tx.createdAt || tx.created_at;
        const amountValue = tx.amount;
        
        console.log('Revenue Transaction:', { dateValue, amountValue });
        
        if (dateValue && amountValue) {
          const date = new Date(dateValue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dataByDate[date] = (dataByDate[date] || 0) + parseFloat(amountValue);
        }
      });

    const chartData = Object.entries(dataByDate)
      .map(([date, revenue]) => ({ date, revenue: parseFloat(revenue.toFixed(2)) }))
      .slice(-10); // Show last 10 dates
    
    console.log('💰 Revenue Chart Data:', chartData);
    return chartData;
  }, [transactions, walletData.userId]);

  // Calculate total revenue
  const calculateTotalRevenue = () => {
    const currentUserId = walletData.userId;
    const salesTransactions = transactions.filter(tx => {
      const sellerId = tx.seller?.id || tx.seller?.userId || tx.sellerId;
      const isCompleted = tx.status === 'COMPLETED';
      return sellerId === currentUserId && tx.amount && isCompleted;
    });
    
    console.log('💵 Completed sales transactions for revenue:', salesTransactions);
    console.log('💵 Total revenue:', salesTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0));
    
    return salesTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading report...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Activity Report</h1>
                <p className="text-gray-600 mt-1">View your carbon credit journey and transactions</p>
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
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total CO2 Reduced */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-green-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total CO₂ Reduced</h3>
                </div>
              </div>

              <p className="text-3xl font-bold text-gray-900 mb-1">
                {walletData.co2ReducedKg.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 mb-2">kg CO₂</p>

              <div className="flex items-center gap-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>From all journeys</span>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-blue-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                </div>
              </div>

              <p className="text-3xl font-bold text-gray-900 mb-1">
                ${calculateTotalRevenue().toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mb-2">from credit sales</p>

              <div className="flex items-center gap-2 text-sm text-blue-600">
                <TrendingUp className="w-4 h-4" />
                <span>Carbon credit earnings</span>
              </div>
            </div>

            {/* Authentication Status */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-green-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Account Status</h3>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-2xl font-bold text-gray-900">Active</p>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Member since {walletData.createdAt ? new Date(walletData.createdAt).toLocaleDateString() : 'N/A'}
              </p>

              <div className="flex items-center gap-2 text-sm text-green-600">
                <span>Authenticated & Verified</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CO2 Reduced Chart */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">CO₂ Reduced by Date</h2>
                <p className="text-sm text-gray-600 mt-1">Daily carbon reduction from EV journeys</p>
              </div>
              
              {co2ChartData.length === 0 ? (
                <div className="text-center py-12">
                  <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No journey data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={co2ChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickLine={{ stroke: '#e5e7eb' }}
                      label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [`${value} kg`, 'CO₂ Reduced']}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar 
                      dataKey="co2" 
                      fill="#10b981" 
                      radius={[8, 8, 0, 0]}
                      name="CO₂ Reduced (kg)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Revenue by Date</h2>
                <p className="text-sm text-gray-600 mt-1">Daily earnings from carbon credit sales</p>
              </div>
              
              {revenueChartData.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No revenue data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickLine={{ stroke: '#e5e7eb' }}
                      label={{ value: 'USD ($)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar 
                      dataKey="revenue" 
                      fill="#3b82f6" 
                      radius={[8, 8, 0, 0]}
                      name="Revenue ($)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Report;