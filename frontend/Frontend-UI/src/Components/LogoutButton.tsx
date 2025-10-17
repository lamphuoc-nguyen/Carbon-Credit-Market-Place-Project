import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { authApi } from '../api';
import { clearAuthData } from '../utils/tokenUtils';

interface LogoutButtonProps {
    className?: string;
    variant?: 'button' | 'dropdown' | 'icon';
    showText?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
    className = '',
    variant = 'button',
    showText = true
}) => {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            console.log('🔓 Logging out user...');

            // Call logout API
            await authApi.logout();
            console.log('✅ Logout API call successful');

        } catch (error) {
            console.warn('⚠️ Logout API call failed, but continuing with local cleanup:', error);
        } finally {
            // Always clear local data regardless of API call result
            clearAuthData();
            console.log('🧹 Authentication data cleared');

            // Redirect to login page
            navigate('/login');
            console.log('🔄 Redirected to login page');

            setIsLoggingOut(false);
        }
    };

    const baseClasses = "flex items-center justify-center transition-colors duration-200";

    const variantClasses = {
        button: "px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400",
        dropdown: "w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        icon: "p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full"
    };

    const finalClassName = `${baseClasses} ${variantClasses[variant]} ${className}`;

    return (
        <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={finalClassName}
            title="Logout"
            type="button"
        >
            <FaSignOutAlt className={showText ? "mr-2" : ""} />
            {showText && (
                <span>
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                </span>
            )}
        </button>
    );
};

export default LogoutButton;
