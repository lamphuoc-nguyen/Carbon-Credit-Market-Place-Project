import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, CheckCircle, FileText, Hammer, X, Leaf, Menu,
    Shield, ArrowRightLeft
} from 'lucide-react';
import LogoutButton from '../LogoutButton';
import NotificationButton from '../NotificationButton';

const PUBLIC_LOGO_PATH = "/organic.png";

const iconMap = {
    Dashboard: LayoutDashboard,
    VerifiedCredits: CheckCircle,
    TransferRequests: ArrowRightLeft,
    Reports: FileText,
    AuditTools: Hammer,
};

const navItems = [
    { name: 'Dashboard', key: 'dashboard', icon: 'Dashboard' },
    { name: 'CO2 Transfer Requests', key: 'transfer-requests', icon: 'TransferRequests' },
    { name: 'Verified Credits', key: 'verified-credits', icon: 'VerifiedCredits' },
    { name: 'Reports', key: 'reports', icon: 'Reports' },
];

const Sidebar = ({ isOpen, setIsOpen }) => {

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

                {/* 1. Header */}
                <div
                    className={`flex items-center h-16 border-b border-gray-100
                              ${isOpen ? 'justify-between p-4' : 'justify-center p-2'}`}
                >
                    {isOpen && (
                        <div className="flex items-center">
                            <img src={PUBLIC_LOGO_PATH} alt="Carbon Logo" className="h-6 w-6 mr-3 object-contain flex-shrink-0" />
                            <span className="block text-lg font-semibold text-gray-800 whitespace-nowrap leading-tight">
                                Carbon Verification
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        {/* Đã xóa NotificationButton ở đây */}

                        {/* Toggle Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-1 rounded-lg text-gray-600 hover:bg-gray-100"
                            aria-label="Toggle sidebar"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* 2. User Profile/Badge - Đã cập nhật NotificationButton vào đây */}
                <div className={`p-4 border-b border-gray-100 flex items-center mb-4 ${!isOpen ? 'justify-center' : 'justify-between'}`}>
                    {/* User Info Group */}
                    <div className="flex items-center">
                        <div className={`p-2 rounded-full bg-blue-100`}>
                            <Shield className={`h-6 w-6 text-blue-600`} />
                        </div>
                        {isOpen && (
                            <div className="ml-3">
                                <p className="font-semibold text-sm text-gray-800">CVA User</p>
                                <div className="flex items-center mt-1 space-x-1">
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">cva</span>
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Verified</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notification Button - Chỉ hiện khi sidebar mở để tránh vỡ layout khi đóng */}
                    {isOpen && (
                        <div className="ml-2">
                            <NotificationButton />
                        </div>
                    )}
                </div>

                {/* 3. Navigation Items */}
                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.key}
                            to={`/cva/${item.key}`}
                            className={({ isActive }) =>
                                `w-full flex items-center p-3 rounded-xl transition-colors duration-200
                                 ${!isOpen && 'justify-center'}
                                 ${isActive
                                    ? 'bg-gray-100 text-gray-900 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`
                            }
                        >
                            <RenderIcon name={item.icon} className="h-5 w-5 flex-shrink-0" />
                            <span
                                className={`text-sm ml-3 whitespace-nowrap transition-opacity duration-200 ${!isOpen ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100'
                                    }`}
                            >
                                {item.name}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                {/* 4. Footer Items */}
                <div className="p-4 border-t border-gray-100 mt-auto">
                    <LogoutButton
                        className={`w-full flex items-center p-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 ${!isOpen && 'justify-center'}`}
                        variant="sidebar"
                        showText={isOpen}
                    />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;