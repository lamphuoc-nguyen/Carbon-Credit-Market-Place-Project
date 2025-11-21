import axiosInstance from "./axiosInstance";

/**
 * Helper function xử lý response.
 * Lưu ý: CarbonCreditController trả về 2 định dạng khác nhau:
 * 1. Trực tiếp DTO/List (ví dụ: getPendingCredits) -> trả về response.data
 * 2. ApiResponse (ví dụ: convertCo2ToCredits) -> trả về response.data (chứa success, message, data)
 */
const handleResponse = (response) => {
    return response.data;
};

export const carbonCreditApi = {

    // ==================== PUBLIC / MARKETPLACE ====================

    /**
     * Lấy tất cả tín chỉ khả dụng (Available)
     * Endpoint: GET /carbon-credits
     * @returns {Promise<CarbonCreditDTO[]>}
     */
    getAllAvailableCredits: async () => {
        const response = await axiosInstance.get('/carbon-credits');
        return handleResponse(response);
    },

    /**
     * Lấy chi tiết tín chỉ theo ID
     * Endpoint: GET /carbon-credits/{id}
     * @returns {Promise<CarbonCreditDTO>}
     */
    getCreditById: async (id) => {
        const response = await axiosInstance.get(`/carbon-credits/${id}`);
        return handleResponse(response);
    },

    // ==================== CVA / ADMIN VERIFICATION ====================

    /**
     * Lấy danh sách tín chỉ đang chờ xác minh (Pending)
     * Endpoint: GET /carbon-credits/pending
     * @returns {Promise<CarbonCreditDTO[]>}
     */
    getPendingCredits: async () => {
        const response = await axiosInstance.get('/carbon-credits/pending');
        return handleResponse(response);
    },

    /**
     * Xác minh (Approve) tín chỉ
     * Endpoint: POST /carbon-credits/{creditId}/verify
     * @param {string} creditId
     * @param {string} comments - (Optional) Ghi chú
     */
    verifyCredit: async (creditId, comments) => {
        const body = { comments: comments || "Verified by CVA" };
        const response = await axiosInstance.post(`/carbon-credits/${creditId}/verify`, body);
        return handleResponse(response);
    },

    /**
     * Từ chối (Reject) tín chỉ
     * Endpoint: POST /carbon-credits/{creditId}/reject
     * @param {string} creditId
     * @param {string} comments - Lý do từ chối (Nên bắt buộc ở FE)
     */
    rejectCredit: async (creditId, comments) => {
        if (!comments) throw new Error("Comments are required for rejection");
        const body = { comments };
        const response = await axiosInstance.post(`/carbon-credits/${creditId}/reject`, body);
        return handleResponse(response);
    },

    // ==================== USER SPECIFIC ====================

    /**
     * Lấy danh sách tín chỉ của một user cụ thể
     * Endpoint: GET /carbon-credits/user/{userId}
     * @param {string} userId
     * @returns {Promise<CarbonCreditDTO[]>}
     */
    getCreditsByUser: async (userId) => {
        const response = await axiosInstance.get(`/carbon-credits/user/${userId}`);
        return handleResponse(response);
    },

    /**
     * Chuyển đổi CO2 đã giảm thành Carbon Credits
     * Endpoint: POST /carbon-credits/convert-co2-to-credits
     * @param {number} co2Amount - Số lượng kg CO2 (tối thiểu 1000)
     * @returns {Promise<ApiResponse>} Trả về object chứa { success, message, data }
     */
    convertCo2ToCredits: async (co2Amount) => {
        // Controller dùng @RequestParam nên phải gửi qua params
        const response = await axiosInstance.post('/carbon-credits/convert-co2-to-credits', null, {
            params: { co2Amount }
        });
        // Hàm này trả về ApiResponse nên FE cần check result.success
        return handleResponse(response);
    }
};