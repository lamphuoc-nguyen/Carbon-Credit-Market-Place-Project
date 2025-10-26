import axiosInstance from "./axiosInstance"; // Import instance axios đã cấu hình của bạn

/**
 * Helper function để trả về data từ response.
 * Controller này không dùng wrapper { success: true },
 * nên chúng ta chỉ cần trả về response.data.
 */
const validateResponse = (response) => {
    return response.data;
};

// Định nghĩa API service cho Carbon Credit
export const carbonCreditApi = {

    /**
     * Lấy tất cả các tín chỉ đang chờ xác minh
     * Tương ứng: @GetMapping("/pending")
     * Dùng cho: Dashboard.js
     */
    getPendingCredits: async () => {
        try {
            const response = await axiosInstance.get('/carbon-credits/pending');
            return validateResponse(response);
        } catch (error) {
            console.error("Error fetching pending credits:", error);
            // Lỗi sẽ được xử lý bởi interceptor trong axiosInstance
            throw error;
        }
    },

    /**
     * Phê duyệt một tín chỉ (Dùng cho trang ReviewJourneyDetail)
     * Tương ứng: @PostMapping("/{creditId}/verify")
     */
    verifyCredit: async (creditId, comments) => {
        if (!creditId) throw new Error('Credit ID is required');

        try {
            // Body của request phải khớp với DTO `VerifyRequest`
            // @RequestBody(required = false) nên body có thể rỗng
            const body = { comments: comments || 'Approved' };

            const response = await axiosInstance.post(
                `/carbon-credits/${creditId}/verify`,
                body
            );
            return validateResponse(response);
        } catch (error) {
            console.error("Error in verifyCredit:", error);
            throw error;
        }
    },

    /**
     * Từ chối một tín chỉ (Dùng cho trang ReviewJourneyDetail)
     * Tương ứng: @PostMapping("/{creditId}/reject")
     */
    rejectCredit: async (creditId, comments) => {
        if (!creditId) throw new Error('Credit ID is required');

        // Controller của bạn cũng cho phép comments rỗng, 
        // nhưng logic nghiệp vụ nên yêu cầu lý do khi từ chối.
        if (!comments) {
            throw new Error('Comments are required for rejection');
        }

        try {
            const body = { comments: comments };

            const response = await axiosInstance.post(
                `/carbon-credits/${creditId}/reject`,
                body
            );
            return validateResponse(response);
        } catch (error) {
            console.error("Error in rejectCredit:", error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết MỘT tín chỉ bằng ID
     * Tương ứng: @GetMapping("/{id}")
     */
    getCreditById: async (creditId) => {
        if (!creditId) throw new Error('Credit ID is required');
        try {
            const response = await axiosInstance.get(`/carbon-credits/${creditId}`);
            return validateResponse(response);
        } catch (error) {
            console.error(`Error fetching credit ${creditId}:`, error);
            throw error;
        }
    }
};