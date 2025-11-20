import axiosInstance from './axiosInstance';

/**
 * Notification API - Handles all notification-related requests
 */

/**
 * Get all notifications for the current user
 */
export const getUserNotifications = async () => {
    try {
        const response = await axiosInstance.get('/api/notifications');
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async () => {
    try {
        const response = await axiosInstance.get('/api/notifications/unread/count');
        return response.data;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        throw error;
    }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - The notification ID
 */
export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await axiosInstance.put(`/api/notifications/${notificationId}/read`);
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
    try {
        const response = await axiosInstance.put('/api/notifications/read-all');
        return response.data;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

/**
 * Delete a notification
 * @param {string} notificationId - The notification ID
 */
export const deleteNotification = async (notificationId) => {
    try {
        const response = await axiosInstance.delete(`/api/notifications/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

/**
 * Get notifications with pagination
 * @param {number} page - Page number (0-based)
 * @param {number} size - Page size
 */
export const getNotificationsPaginated = async (page = 0, size = 10) => {
    try {
        const response = await axiosInstance.get('/api/notifications', {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching paginated notifications:', error);
        throw error;
    }
};

export default {
    getUserNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getNotificationsPaginated
};

