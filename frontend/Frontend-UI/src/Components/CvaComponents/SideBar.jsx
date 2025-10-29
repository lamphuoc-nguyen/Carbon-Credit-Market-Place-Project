import React from 'react';
import {
    LayoutDashboard, Clock, CheckCircle, FileText, Hammer, Moon, LogOut, Shield, X, Leaf, Menu
} from 'lucide-react'; // Đảm bảo Menu và X đã được import

// Giả định organic.png nằm trong thư mục public
const PUBLIC_LOGO_PATH = "/organic.png";

// Ánh xạ tên icon trong dữ liệu sang component thực tế
const iconMap = {
    Dashboard: LayoutDashboard,
    PendingVerifications: Clock,
    VerifiedCredits: CheckCircle,
    Reports: FileText,
    AuditTools: Hammer,
};

// Dữ liệu cho các mục điều hướng
const navItems = [
    { name: 'Dashboard', key: 'dashboard', icon: 'Dashboard' },
    { name: 'Pending Verifications', key: 'pending_verifications', icon: 'PendingVerifications' },
    { name: 'Verified Credits', key: 'verified_credits', icon: 'VerifiedCredits' },
    { name: 'Reports', key: 'reports', icon: 'Reports' },
    { name: 'Audit Tools', key: 'audit_tools', icon: 'AuditTools' },
];

const Sidebar = ({ currentPage, setCurrentPage, isOpen, setIsOpen }) => {
    const activePage = currentPage || 'audit_tools';

    // Hàm render Icon dựa trên tên
    const RenderIcon = ({ name, className }) => {
        const IconComponent = iconMap[name] || Leaf;
        return <IconComponent className={className} />;
    };

    return (
        <div
            className={`relative h-screen bg-white border-r border-gray-200 
                      shadow-xl z-50 transition-all duration-300 ease-in-out
                      ${isOpen ? 'w-64' : 'w-20'}`}
        >
            <div className={`flex flex-col h-full overflow-hidden`}>

                {/* 1. Header (Đã sửa lỗi click) */}
                <div
                    className={`flex items-center h-16 border-b border-gray-100 
              ${isOpen ? 'justify-between p-4' : 'justify-center p-4'}`}
                >

                    {/* Logo và Tiêu đề: CHỈ hiển thị khi isOpen = true */}
                    {isOpen && (
                        <div className="flex items-center">
                            <img src={PUBLIC_LOGO_PATH} alt="Carbon Logo" className="h-6 w-6 mr-3 object-contain flex-shrink-0" />
                            <span className="text-xl font-semibold text-gray-800 whitespace-nowrap">
                                Carbon Platform
                            </span>
                        </div>
                    )}

                    {/* Nút Toggle: LUÔN hiển thị */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1 rounded-lg text-gray-600 hover:bg-gray-100"
                        aria-label="Toggle sidebar"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* 2. User Profile/Badge */}
                <div className={`p-4 border-b border-gray-100 flex items-center mb-4 ${!isOpen && 'justify-center'}`}>
                    <div className="bg-purple-100 p-2 rounded-xl flex-shrink-0">
                        <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <div
                        className={`ml-3 text-sm whitespace-nowrap transition-all
                                    ${!isOpen ? 'opacity-0 w-0' : 'opacity-100'}`}
                    >
                        <p className="font-semibold text-gray-800">Dr. Nguyen Dai</p>
                        <div className="flex items-center space-x-1 mt-0.5">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">verifier</span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">Verified</span>
                        </div>
                    </div>
                </div>

                {/* 3. Navigation Items (Menu chính) */}
                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => {
                                setCurrentPage(item.key);
                            }}
                            className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200 
                                      ${!isOpen && 'justify-center'} 
                                      ${activePage === item.key
                                    ? 'bg-gray-100 text-gray-900 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50'}`
                            }
                        >
                            <RenderIcon name={item.icon} className="h-5 w-5 flex-shrink-0" />
                            <span
                                className={`text-base ml-3 whitespace-nowrap transition-opacity 
                                          ${!isOpen ? 'opacity-0 w-0' : 'opacity-100'}`}
                            >
                                {item.name}
                            </span>
                        </button>
                    ))}
                </nav>

                {/* 4. Footer Items (Dark Mode & Logout) */}
                <div className="p-4 border-t border-gray-100 space-y-1">
                    <button className={`w-full flex items-center p-3 rounded-xl text-gray-600 hover:bg-gray-50 ${!isOpen && 'justify-center'}`}>
                        <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className={`text-base whitespace-nowrap transition-opacity ${!isOpen ? 'opacity-0 w-0' : 'opacity-100'}`}>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;