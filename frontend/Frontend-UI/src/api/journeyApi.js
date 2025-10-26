import axiosInstance from "./axiosInstance"; // Import instance đã cấu hình

// Helper function (giống như trong userApi)
// Nó sẽ xử lý cấu trúc { success: true, data: {...} } của bạn
const validateResponse = (response) => {
    if (response.data && response.data.success) {
        return response.data.data; // Chỉ trả về phần 'data'
    } else {
        // Ném lỗi nếu success: false hoặc không có data
        throw new Error(response.data.message || 'API request failed');
    }
};

export const journeyApi = {

    /**
     * Lấy danh sách hành trình đang chờ duyệt
     * Endpoint: GET /api/journeys/admin/by-status/{status}
     * Dùng cho: Trang PendingVerifications.jsx
     */
    getPendingJourneys: async () => {
        try {
            // CVA/ADMIN gọi endpoint này với status PENDING_VERIFICATION
            const response = await axiosInstance.get('/api/journeys/admin/by-status/PENDING_VERIFICATION');
            return validateResponse(response);
        } catch (error) {
            console.error("Error fetching pending journeys:", error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết MỘT hành trình bằng ID
     * Endpoint: GET /api/journeys/{journeyId}
     * Dùng cho: Trang ReviewJourneyDetail.jsx
     */
    getJourneyById: async (journeyId) => {
        if (!journeyId) throw new Error('Journey ID is required');
        try {
            const response = await axiosInstance.get(`/api/journeys/${journeyId}`);
            return validateResponse(response);
        } catch (error) {
            console.error(`Error fetching journey ${journeyId}:`, error);
            throw error;
        }
    },

};