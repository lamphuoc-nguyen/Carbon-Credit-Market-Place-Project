import React, { useState } from 'react';
import Sidebar from '../../Components/CvaComponents/SideBar'; // Đường dẫn của bạn
import Dashboard from '../../Components/CvaComponents/Dashboard'; // Đường dẫn của bạn
import { Bell, Settings } from 'lucide-react'; // Bỏ 'Menu' vì nó đã ở trong Sidebar
 import PendingVerifications from '../../Components/CvaComponents/PendingVerifications';
// Import các component cho từng trang (bạn có thể "mở comment" khi đã tạo file)

// import VerifiedCredits from '../../Components/CvaComponents/VerifiedCredits';
// import Reports from '../../Components/CvaComponents/Reports';
// import AuditTools from '../../Components/CvaComponents/AuditTools';

const CvaPage = () => {
    // State quản lý trang nào đang được chọn
    const [currentPage, setCurrentPage] = useState('dashboard');

    // State quản lý Sidebar đóng/mở (true = mở, false = thu gọn)
    // Bắt đầu với trạng thái mở
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Hàm render nội dung trang dựa trên state 'currentPage'
    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard':
                // CẬP NHẬT: Truyền 'setCurrentPage' xuống cho Dashboard
                return <Dashboard setCurrentPage={setCurrentPage} />;

            case 'pending_verifications':
                // Đây là trang "See more" sẽ dẫn tới
                return (
                    <div className="p-4 bg-white rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-800">Pending Verifications</h2>
                        <p className="text-gray-500 mt-2">Nơi đây sẽ hiển thị toàn bộ danh sách pending...</p>
                        <PendingVerifications /> 
                    </div>
                );
            case 'verified_credits':
                return (
                    <div className="p-4 bg-white rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-800">Verified Credits</h2>
                        <p className="text-gray-500 mt-2">Browse all verified carbon credits</p>
                        {/* <VerifiedCredits /> */}
                    </div>
                );
            case 'reports':
                return (
                    <div className="p-4 bg-white rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
                        <p className="text-gray-500 mt-2">Generate and view verification reports</p>
                        {/* <Reports /> */}
                    </div>
                );
            case 'audit_tools':
                return (
                    <div className="p-4 bg-white rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-800">Audit Tools</h2>
                        <p className="text-gray-500 mt-2">Advanced tools for carbon credit auditing</p>
                        {/* <AuditTools /> */}
                    </div>
                );
            default:
                return <Dashboard setCurrentPage={setCurrentPage} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">

            {/* 1. Sidebar */}
            {/* Truyền cả 4 props để Sidebar hoạt động chính xác */}
            <Sidebar
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            {/* 2. Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header (Đã BỎ tiêu đề và nút Menu) */}
                

                {/* Main Content (Vùng cuộn) */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </main>

                {/* Footer (Không đổi) */}
                <footer className="bg-white border-t border-gray-200 px-6 py-3 hidden md:block">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <p>© 2025 Carbon Platform - Verification & Audit System</p>
                        <div className="flex items-center space-x-4">
                            <a href="#" className="hover:text-purple-600 transition">Privacy</a>
                            <a href="#" className="hover:text-purple-600 transition">Terms</a>
                            <a href="#" className="hover:text-purple-600 transition">Support</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default CvaPage;