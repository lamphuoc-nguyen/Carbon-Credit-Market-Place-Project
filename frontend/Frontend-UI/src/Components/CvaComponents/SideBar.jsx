import React from 'react';
// ✅ BƯỚC 1: Import NavLink
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Clock, CheckCircle, FileText, Hammer, Moon, LogOut, Shield, X, Leaf, Menu
} from 'lucide-react';

const PUBLIC_LOGO_PATH = "/organic.png";

const iconMap = {
    Dashboard: LayoutDashboard,
    PendingVerifications: Clock,
    VerifiedCredits: CheckCircle,
    Reports: FileText,
    AuditTools: Hammer,
};

// ✅ BƯỚC 2: Cập nhật 'key' để khớp với đường dẫn (path) trong App.jsx
const navItems = [
    { name: 'Dashboard', key: 'dashboard', icon: 'Dashboard' },
    // Sửa 'pending_verifications' thành 'pending' để khớp với route
    { name: 'Pending Verifications', key: 'pending', icon: 'PendingVerifications' },
    { name: 'Verified Credits', key: 'verified-credits', icon: 'VerifiedCredits' },
    { name: 'Reports', key: 'reports', icon: 'Reports' },
    { name: 'Audit Tools', key: 'audit-tools', icon: 'AuditTools' },
];

// ✅ BƯỚC 3: Bỏ props 'currentPage' và 'setCurrentPage'
const Sidebar = ({ isOpen, setIsOpen }) => {

    // Hàm render Icon (Không đổi)
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

                {/* 1. Header (Không đổi) */}
                <div
                    className={`flex items-center h-16 border-b border-gray-100 
                  ${isOpen ? 'justify-between p-4' : 'justify-center p-4'}`}
                >
                    {isOpen && (
                        <div className="flex items-center">
                            <img src={PUBLIC_LOGO_PATH} alt="Carbon Logo" className="h-6 w-6 mr-3 object-contain flex-shrink-0" />
                            <span className="block text-lg font-semibold text-gray-800 whitespace-nowrap leading-tight">
                                Carbon Verification
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1 rounded-lg text-gray-600 hover:bg-gray-100"
                        aria-label="Toggle sidebar"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* 2. User Profile/Badge (Không đổi) */}
                <div className={`p-4 border-b border-gray-100 flex items-center mb-4 ${!isOpen && 'justify-center'}`}>
                    {/* ... (code profile Dr. Nguyen Dai) ... */}
                </div>

                {/* 3. Navigation Items (Menu chính - ĐÃ SỬA) */}
                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (

                        // ✅ BƯỚC 4: Thay thế <button> bằng <NavLink>
                        <NavLink
                            key={item.key}
                            // Đường dẫn đầy đủ, ví dụ: /cva/dashboard
                            to={`/cva/${item.key}`}

                            // NavLink sẽ tự động quản lý class 'active'
                            className={({ isActive }) =>
                                `w-full flex items-center p-3 rounded-xl transition-colors duration-200 
                                ${!isOpen && 'justify-center'} 
                                ${isActive
                                    ? 'bg-gray-100 text-gray-900 font-semibold' // Style khi active
                                    : 'text-gray-600 hover:bg-gray-50' // Style mặc định
                                }`
                            }
                        >
                            <RenderIcon name={item.icon} className="h-5 w-5 flex-shrink-0" />
                            <span
                                className={`text-base ml-3 whitespace-nowrap transition-opacity 
                                          ${!isOpen ? 'opacity-0 w-0' : 'opacity-100'}`}
                            >
                                {item.name}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                {/* 4. Footer Items (Không đổi) */}
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