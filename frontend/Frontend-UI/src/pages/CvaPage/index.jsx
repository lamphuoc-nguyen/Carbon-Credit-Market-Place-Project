import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; // ✅ BƯỚC 1: Import Outlet
import Sidebar from '../../Components/CvaComponents/SideBar'; // Đường dẫn của bạn
// ❌ Bỏ import các trang con (Dashboard, PendingVerifications)

const CvaPage = () => {
    // ❌ BƯỚC 2: Bỏ state này
    // const [currentPage, setCurrentPage] = useState('dashboard');

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // ❌ BƯỚC 3: Bỏ hoàn toàn hàm 'renderContent()'
    // const renderContent = () => { ... };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* 1. Sidebar (Đã cập nhật props) - Full height without navbar */}
            <Sidebar
                // ❌ Bỏ 2 props này
                // currentPage={currentPage}
                // setCurrentPage={setCurrentPage}

                // ✅ Giữ 2 props này
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            {/* 2. Main Content Area - Full height to take up entire screen */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Main Content (Vùng cuộn) - Takes full available height */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 bg-white">
                    <div className="max-w-7xl mx-auto h-full">

                        {/* ✅ BƯỚC 4: Thay thế {renderContent()} bằng <Outlet /> */}
                        {/* React Router sẽ tự động render component con vào đây */}
                        <Outlet />

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
