import React from 'react';
import axiosInstance from '../api/axiosInstance';

const CreateTestNotification = () => {
    const createTestNotification = async () => {
        try {
            // Get current user info
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
            if (!user.id) {
                alert('No user found. Please log in first.');
                return;
            }

            console.log('Creating test notification for user:', user);

            // Create a test notification via our backend endpoint
            const response = await axiosInstance.post('/api/notifications/test');
            console.log('Test notification response:', response);

            if (response.data.success) {
                alert('✅ Test notification created! Check your notification bell.');
                // Trigger a custom event to refresh notifications
                window.dispatchEvent(new CustomEvent('refreshNotifications'));
            } else {
                alert('❌ Failed to create test notification: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error creating test notification:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                alert('🔐 Authentication error. Please log in again.');
            } else {
                alert('❌ Error creating test notification: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={createTestNotification}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-lg transition-colors"
                title="Create Test Notification"
            >
                🧪 Test Notification
            </button>
        </div>
    );
};

export default CreateTestNotification;
