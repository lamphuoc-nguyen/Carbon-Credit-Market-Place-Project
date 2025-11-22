import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home, Users, TrendingUp, FileText, Wallet, BarChart,
    Leaf, X, Menu, Settings, CheckCircle // Keep CheckCircle if used elsewhere
} from 'lucide-react';
import LogoutButton from '../LogoutButton'; // Adjust path if needed
import NotificationButton from '../NotificationButton'; // Add notification button

const PUBLIC_LOGO_PATH = "/organic.png"; // Make sure this path is correct relative to public folder

const iconMap = {
    Dashboard: Home,
    UserManagement: Users,
    CreditListings: TrendingUp,
    Transactions: FileText,
    WalletAndCashFlow: Wallet,
    PlatformReports: BarChart,
    Settings: Settings, // Keep if used for user badge
};

const navItems = [
    { name: 'Dashboard', key: 'dashboard', icon: 'Dashboard' }, // key matches the route path
    { name: 'User Management', key: 'user-management', icon: 'UserManagement' },
    { name: 'Credit Listings', key: 'credit-listings', icon: 'CreditListings' },
    { name: 'Transactions', key: 'transactions', icon: 'Transactions' },
    { name: 'Wallets & Cash Flow', key: 'wallets-cash-flow', icon: 'WalletAndCashFlow' },
    { name: 'Platform Reports', key: 'platform-reports', icon: 'PlatformReports' },
];

const AdminSidebar = ({ isOpen, setIsOpen }) => {

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
                                Admin Management
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
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

                {/* 2. User Profile/Badge */}
                <div className={`p-4 border-b border-gray-100 flex items-center justify-between mb-4`}>
                    <div className="flex items-center">
                        <div className={`p-2 rounded-full bg-orange-100`}>
                            <Settings className={`h-6 w-6 text-orange-600`} />
                        </div>
                        {isOpen && (
                            <div className="ml-3">
                                <p className="font-semibold text-sm text-gray-800">Admin User</p>
                                <div className="flex items-center mt-1 space-x-1">
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">admin</span>
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Verified</span>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Notification Button next to user name */}
                    {isOpen && <NotificationButton dropdownPosition="left" />}
                </div>


                {/* 3. Navigation Items */}
                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.key}
                            // ✅ SỬA PREFIX THÀNH '/admin/'
                            to={`/admin/${item.key}`}
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
                                className={`text-sm ml-3 whitespace-nowrap transition-opacity duration-200 ${ /* Adjusted text size */
                                    !isOpen ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100' /* Hide completely when closed */
                                    }`}
                            >
                                {item.name}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                {/* 4. Footer Items */}
                <div className="p-4 border-t border-gray-100 mt-auto"> {/* Added mt-auto */}
                    <LogoutButton
                        className={`w-full flex items-center p-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 ${!isOpen && 'justify-center'}`}
                        variant="sidebar" // Assuming LogoutButton handles variants
                        showText={isOpen}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;