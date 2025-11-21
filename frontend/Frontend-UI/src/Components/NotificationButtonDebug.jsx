import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

const NotificationButtonDebug = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');

        setIsAuthenticated(!!token);
        setDebugInfo(`Token: ${!!token}, User: ${!!user}`);

        console.log('Debug - Token exists:', !!token);
        console.log('Debug - User exists:', !!user);
        console.log('Debug - LocalStorage authToken:', localStorage.getItem('authToken'));
        console.log('Debug - SessionStorage authToken:', sessionStorage.getItem('authToken'));
    }, []);

    const handleClick = () => {
        alert(`Debug Info: ${debugInfo}\nAuthenticated: ${isAuthenticated}`);
    };

    return (
        <div className="relative">
            <button
                onClick={handleClick}
                className="relative p-2 text-gray-600 hover:text-green-500 hover:bg-gray-100 rounded-full transition-all duration-200 border border-red-500"
                title="Debug Notification Button"
            >
                <Bell size={24} />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    ?
                </span>
            </button>
            {/* Debug info */}
            <div className="absolute top-full left-0 mt-1 p-2 bg-black text-white text-xs rounded whitespace-nowrap z-50">
                Auth: {isAuthenticated ? 'Yes' : 'No'}
            </div>
        </div>
    );
};

export default NotificationButtonDebug;
