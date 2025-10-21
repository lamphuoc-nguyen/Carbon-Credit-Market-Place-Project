import React from 'react'
import logoImage from "../../image/logo.png";
import { useState } from 'react';

const SideBar = () => {

    const [currentPage, setCurrentPage] = useState('dashboard');
    

    const navItems = [
        { name: 'Dashboard', icon: 'ChartBarIcon', key: 'dashboard' },
        { name: 'Kiểm tra & Duyệt', icon: 'ClockIcon', key: 'approve_deny' },
        { name: 'Cấp Tín chỉ', icon: 'CreditCardIcon', key: 'issue_credit' },
        { name: 'Xuất Báo cáo', icon: 'DocumentTextIcon', key: 'reports' },
    ];


    const Icon = ({ name, className }) => {
        let text = '⚙️';
        switch (name) {
            case 'ChartBarIcon': text = '📈'; break;
            case 'ClockIcon': text = '⏳'; break;
            case 'CreditCardIcon': text = '💳'; break;
            case 'DocumentTextIcon': text = '📄'; break;
            default: text = '⚙️';
        }
        return <div className={`flex items-center justify-center ${className}`}>{text}</div>;
    };

    return (
        <div className="w-64 flex flex-col bg-gray-800 text-white shadow-2xl">
            {/* Logo/Header */}
            <div className="flex items-center justify-center h-20 border-b border-gray-700 p-2">
                <img src={logoImage} alt="CVA Logo" className="h-12 object-contain" />
            </div>

            {/* Nav Items */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setCurrentPage(item.key)}
                        className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200 group
              ${currentPage === item.key
                                ? 'bg-green-600 text-white shadow-lg'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`
                        }
                    >
                        <Icon name={item.icon} className="h-6 w-6 mr-3 text-xl" />
                        <span className="font-medium">{item.name}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 text-sm text-gray-500 border-t border-gray-700">
                © 2024 Carbon Audit.
            </div>
        </div>
    )
}

export default SideBar