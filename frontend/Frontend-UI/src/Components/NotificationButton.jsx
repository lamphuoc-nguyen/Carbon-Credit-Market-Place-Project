import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { getValidToken } from '../utils/tokenUtils';
import {
    getUserNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} from '../api/notificationApi';

const NotificationButton = ({ dropdownPosition = 'right' }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [buttonRect, setButtonRect] = useState(null);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Define callback functions first
    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) {
            console.log('NotificationButton - Skipping fetch (not authenticated)');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('NotificationButton - Fetching notifications...');
            const response = await getUserNotifications();
            console.log('NotificationButton - Fetch response:', response);

            if (response.success && response.data) {
                setNotifications(response.data);
                console.log('NotificationButton - Set notifications:', response.data.length);
            } else {
                console.warn('NotificationButton - Invalid response format:', response);
                setError('Failed to load notifications');
            }
        } catch (error) {
            console.error('NotificationButton - Error fetching notifications:', error);
            setError('Failed to load notifications');

            // If unauthorized, clear auth state
            if (error.response?.status === 401 || error.response?.status === 403) {
                setIsAuthenticated(false);
                setNotifications([]);
                setUnreadCount(0);
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) {
            console.log('NotificationButton - Skipping unread count (not authenticated)');
            return;
        }

        try {
            setError(null);

            console.log('NotificationButton - Fetching unread count...');
            const response = await getUnreadNotificationCount();
            console.log('NotificationButton - Unread count response:', response);

            if (response.success && typeof response.data === 'number') {
                setUnreadCount(response.data);
                console.log('NotificationButton - Set unread count:', response.data);
            } else {
                console.warn('NotificationButton - Invalid unread count response:', response);
            }
        } catch (error) {
            console.error('NotificationButton - Error fetching unread count:', error);

            // If unauthorized, clear auth state
            if (error.response?.status === 401 || error.response?.status === 403) {
                setIsAuthenticated(false);
                setUnreadCount(0);
            }
        }
    }, [isAuthenticated]);

    // Check authentication status
    useEffect(() => {
        const checkAuth = () => {
            const token = getValidToken();
            const authenticated = !!token;
            setIsAuthenticated(authenticated);

            // Debug logging
            console.log('NotificationButton - Auth check:', {
                token: !!token,
                authenticated,
                tokenSnippet: token ? token.substring(0, 20) + '...' : 'none'
            });

            return authenticated;
        };

        // Initial check
        if (checkAuth()) {
            fetchNotifications();
            fetchUnreadCount();
        }

        // Listen for storage changes (login/logout from other tabs)
        const handleStorageChange = () => {
            if (checkAuth()) {
                fetchNotifications();
                fetchUnreadCount();
            } else {
                // Clear state when logged out
                setNotifications([]);
                setUnreadCount(0);
                setIsOpen(false);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [fetchNotifications, fetchUnreadCount]);

    // Listen for manual refresh events
    useEffect(() => {
        const handleRefresh = () => {
            console.log('NotificationButton - Manual refresh triggered');
            if (isAuthenticated) {
                fetchNotifications();
                fetchUnreadCount();
            }
        };

        window.addEventListener('refreshNotifications', handleRefresh);
        return () => window.removeEventListener('refreshNotifications', handleRefresh);
    }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

    // Poll for notifications only when authenticated
    useEffect(() => {
        if (!isAuthenticated) return;

        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            fetchUnreadCount();
            if (isOpen) {
                fetchNotifications();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [isOpen, isAuthenticated, fetchNotifications, fetchUnreadCount]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const handleMarkAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            // Update local state
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await deleteNotification(notificationId);
            const deletedNotification = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            if (deletedNotification && !deletedNotification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchNotifications();
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const notificationDate = new Date(timestamp);
        const diffInSeconds = Math.floor((now - notificationDate) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return notificationDate.toLocaleDateString();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'WALLET_UPDATED':
                return <span className="text-2xl">💰</span>;
            case 'CREDIT_VERIFIED':
                return <span className="text-2xl">✅</span>;
            case 'CREDIT_REJECTED':
                return <span className="text-2xl">❌</span>;
            case 'CREDIT_SOLD':
                return <span className="text-2xl">💵</span>;
            case 'TRANSACTION_COMPLETED':
                return <span className="text-2xl">🎉</span>;
            case 'TRANSACTION_FAILED':
                return <span className="text-2xl">⚠️</span>;
            case 'RETIREMENT_COMPLETED':
                return <span className="text-2xl">🏆</span>;
            case 'ACCOUNT_UPDATE':
                return <span className="text-2xl">👤</span>;
            case 'DISPUTE_CREATED':
                return <span className="text-2xl">⚖️</span>;
            case 'DISPUTE_RESOLVED':
                return <span className="text-2xl">🤝</span>;
            case 'WELCOME':
                return <span className="text-2xl">👋</span>;
            default:
                return <span className="text-2xl">📢</span>;
        }
    };

    // Don't render if not authenticated
    if (!isAuthenticated) {
        console.log('NotificationButton - Not rendering (not authenticated)');
        return null;
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Bell Button */}
            <button
                ref={buttonRef}
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setButtonRect(rect);
                    toggleDropdown();
                }}
                className="relative p-2 text-gray-600 hover:text-green-500 hover:bg-gray-100 rounded-full transition-all duration-200"
                aria-label="Notifications"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
                {error && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-white transform translate-x-1/2 -translate-y-1/2 bg-orange-500 rounded-full text-xs">!</span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && buttonRect && (
                <div 
                    className="fixed w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-[9999] max-h-[600px] flex flex-col"
                    style={{
                        top: `${buttonRect.bottom + 8}px`,
                        left: dropdownPosition === 'left' ? `${buttonRect.left}px` : 'auto',
                        right: dropdownPosition === 'right' ? `${window.innerWidth - buttonRect.right}px` : 'auto'
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-sm text-green-500 hover:text-green-600 flex items-center gap-1"
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={16} />
                                    <span>Mark all</span>
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center p-8 text-gray-500">
                                <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">No notifications</p>
                                <p className="text-sm mt-2">You're all caught up!</p>
                            </div>
                        ) : (
                            <div>
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                            !notification.isRead ? 'bg-green-50' : ''
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Icon */}
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.notificationType)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <h4 className="text-sm font-semibold text-gray-800 truncate">
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.isRead && (
                                                        <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full ml-2 mt-1"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-400">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                className="text-xs text-green-500 hover:text-green-600 flex items-center gap-1"
                                                                title="Mark as read"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(notification.id)}
                                                            className="text-xs text-red-400 hover:text-red-600"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                </div>
            )}
        </div>
    );
};

export default NotificationButton;

