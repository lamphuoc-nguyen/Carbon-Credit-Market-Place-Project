import React from 'react';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';
import './App.css';
import LoginForm from './pages/LoginForm';
import Navbar from './Components/Navbar';
import RegisterForm from './pages/RegisterForm';
import SelectRolePage from './pages/SelectRolePage';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import CompleteRegistrationPage from './pages/CompleteRegistrationPage';
import Footer from './Components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CvaPage from './pages/CvaPage';
import BuyerPage from './pages/BuyerPage';
import MakerPlacePage from './pages/BuyerPage/MakerPlacePage';
import Marketplace from './pages/Marketplace';
import Detailpage from './pages/BuyerPage/DetailPage';
import PaymentPage from './pages/BuyerPage/PaymentPage';
import PaymentSuccessPage from './pages/BuyerPage/PaymentSuccessPage';
import TransactionSuccessPage from './pages/BuyerPage/TransactionSuccessPage';
import WalletPage from './pages/BuyerPage/WalletPage';
import CertificatePage from './pages/BuyerPage/CertificatePage';
import ProfilePage from './pages/EvPage/Profile';
import EvOwner from './pages/EvPage';
import JourneyList from './pages/EvPage/JourneyList';
import CreateListingPage from './pages/EvPage/Listing';
import Dashboard from './Components/CvaComponents/Dashboard';
import VerifiedCredits from './Components/CvaComponents/VerifiedCredits';
import Report from './Components/CvaComponents/Report';
import ReportEV from './pages/EvPage/ReportEV';
import TransferRequestManagement from './Components/CvaComponents/TransferRequestManagement';
import ProtectedRoute from './Components/ProtectedRoute';
import Wallet from './pages/EvPage/Wallet';
import AdminPage from './pages/AdminPage';
import AdminDashboard from './Components/AdminComponents/AdminDashboard';
import UserManagement from './Components/AdminComponents/UserManagement';
import Transactions from './Components/AdminComponents/Transactions';
import WalletManagement from './Components/AdminComponents/WalletManagement';
import PlatformReport from './Components/AdminComponents/PlatformReport';
import CreditListings from './Components/AdminComponents/CreditListing';
import Detail from './pages/EvPage/Detail';
import DashboardPage from './pages/BuyerPage/DashboardPage';
import TransferRequestDetailPage from './pages/CvaPage/TransferRequestDetailPage';
import PaymentFailedPage from './Pages/BuyerPage/PaymentFailedPage';
import MyListingsPage from './Pages/EvPage/MyListing'; // ✅ Đã sửa đường dẫn import đúng tên file (MyListing.jsx)

import ChatbotWidget from './AIcomponents/ChatbotWidget'
import TransferHistory from './Components/CvaComponents/TransferHistory';

function App() {
    const location = useLocation();

    // Kiểm tra user role để hiển thị ChatbotWidget
    const getUserRole = () => {
        try {
            const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return user.role || null;
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
        return null;
    };

    const userRole = getUserRole();
    const showChatbot = userRole === 'EV_OWNER' || userRole === 'BUYER';

    // Debug logging
    console.log('🔍 Chatbot Debug:', { userRole, showChatbot });

    // Hide Navbar & Footer for specific pages
    const hideLayout = location.pathname === '/cva' ||
        location.pathname.startsWith('/cva/') || // Ẩn cho tất cả trang con của CVA
        location.pathname.startsWith('/admin') ||
        location.pathname === '/buyer' ||
        location.pathname === '/marketplace' ||
        location.pathname === '/payment' ||
        location.pathname === '/payment/callback' ||
        location.pathname === '/payment/success' ||
        location.pathname === '/payment/failed' ||
        location.pathname === '/transaction-success' ||
        location.pathname === '/wallet' ||
        location.pathname === '/certificate' ||
        location.pathname === '/buyer/dashboard' ||
        // ✅ FIX: Sử dụng startsWith cho EV Dashboard để ẩn Navbar chung cho TẤT CẢ các trang con
        location.pathname.startsWith('/ev-dashboard') ||
        location.pathname.startsWith('/marketplace/');

    return (
        <>
            {!hideLayout && <Navbar />}

            <Routes>
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/select-role" element={<SelectRolePage />} />
                <Route path="/auth/callback" element={<OAuth2CallbackPage />} />
                <Route path="/complete-registration" element={<CompleteRegistrationPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/dashboard" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* --- Buyer Routes (Accessible to both BUYER and EV_OWNER) --- */}
                <Route path="/buyer" element={
                    <ProtectedRoute allowedRoles={["BUYER"]}>
                        <BuyerPage />
                    </ProtectedRoute>
                } />

                <Route path="/buyer/dashboard" element={
                    <ProtectedRoute allowedRoles={["BUYER"]}>
                        <DashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/marketplace/:listingId" element={
                    <ProtectedRoute allowedRoles={["BUYER"]}>
                        <Detailpage />
                    </ProtectedRoute>
                } />
                {/* Note: ReportEV dường như thuộc về EV_OWNER, kiểm tra lại logic role nếu cần */}
                <Route path="/ev-dashboard/report" element={
                    <ProtectedRoute requiredRole="EV_OWNER">
                        <ReportEV />
                    </ProtectedRoute>
                } />
                <Route path="/marketplace" element={
                    <ProtectedRoute allowedRoles={["BUYER"]}>
                        <MakerPlacePage />
                    </ProtectedRoute>
                } />
                <Route path="/marketplace-public" element={<Marketplace />} />
                <Route path="/payment" element={
                    <ProtectedRoute allowedRoles={["BUYER"]}>
                        <PaymentPage />
                    </ProtectedRoute>
                } />
                <Route path="/payment/success" element={
                    <ProtectedRoute allowedRoles={["BUYER"]}>
                        <PaymentSuccessPage />
                    </ProtectedRoute>
                } />
                <Route path="/payment/failed" element={
                    <ProtectedRoute allowedRoles={["BUYER"]}>
                        <PaymentFailedPage/>
                    </ProtectedRoute>
                } />
                <Route path="/transaction-success" element={
                    <ProtectedRoute allowedRoles={["BUYER"]}>
                        <TransactionSuccessPage />
                    </ProtectedRoute>
                } />
                <Route path="/wallet" element={
                    <ProtectedRoute allowedRoles={["BUYER"]}>
                        <WalletPage />
                    </ProtectedRoute>
                } />
                <Route path="/certificate" element={
                    <ProtectedRoute allowedRoles={["BUYER"]}>
                        <CertificatePage />
                    </ProtectedRoute>
                } />

                {/* --- EV Owner Routes --- */}
                <Route path="/ev-dashboard" element={
                    <ProtectedRoute requiredRole="EV_OWNER">
                        <EvOwner />
                    </ProtectedRoute>
                } />
                <Route path="/ev-dashboard/my-listings" element={
                    <ProtectedRoute requiredRole="EV_OWNER">
                        <MyListingsPage />
                    </ProtectedRoute>
                } />
                <Route path="/ev-dashboard/detail/:listingId" element={
                    <ProtectedRoute requiredRole="EV_OWNER">
                        <Detail />
                    </ProtectedRoute>
                } />
                <Route path="/ev-dashboard/profile" element={
                    <ProtectedRoute requiredRole="EV_OWNER">
                        <ProfilePage />
                    </ProtectedRoute>
                } />
                <Route path="/ev-dashboard/journeys" element={
                    <ProtectedRoute requiredRole="EV_OWNER">
                        <JourneyList />
                    </ProtectedRoute>
                } />
                <Route path="/ev-dashboard/marketplace" element={
                    <ProtectedRoute requiredRole="EV_OWNER">
                        <EvOwner />
                    </ProtectedRoute>
                } />
                <Route path="/ev-dashboard/wallet" element={
                    <ProtectedRoute requiredRole="EV_OWNER">
                        <Wallet />
                    </ProtectedRoute>
                } />
                <Route path="/ev-dashboard/listing" element={
                    <ProtectedRoute requiredRole="EV_OWNER">
                        <CreateListingPage />
                    </ProtectedRoute>
                } />

                {/* --- CVA Routes --- */}
                <Route path="/cva" element={
                    <ProtectedRoute requiredRole="CVA">
                        <CvaPage />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="transfer-requests" element={<TransferRequestManagement />} />
                    <Route path="verified-credits" element={<VerifiedCredits />} />
                    <Route path="reports" element={<Report />} />
                    <Route path="transfer-request/:id" element={<TransferRequestDetailPage />} />
                    <Route path="transfer-history" element={<TransferHistory />} />
                </Route>

                {/* --- Admin Routes --- */}
                <Route path="/admin" element={
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminPage />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="user-management" element={<UserManagement />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="wallets-cash-flow" element={<WalletManagement />} />
                    <Route path="platform-reports" element={<PlatformReport />} />
                    <Route path="credit-listings" element={<CreditListings />} />
                </Route>
            </Routes>

            {!hideLayout && <Footer />}

            {/* Hiển thị ChatbotWidget chỉ cho EV_OWNER và BUYER */}
            {showChatbot && <ChatbotWidget />}
        </>
    );
}

export default App;