import axiosInstance from "./axiosInstance";

/**
 * Helper function để xử lý wrapper từ backend (nếu có)
 */
const validateResponse = (response) => {
    // Nếu backend trả về trực tiếp DTO hoặc PageDTO
    if (response.data) {
        // Nếu có wrapper { success: true, data: ... }
        if (response.data.success === true && response.data.data) {
            return response.data.data;
        }
        // Nếu không có wrapper (trả về trực tiếp)
        return response.data;
    }
    throw new Error('No data received from server');
};

export const creditListingApi = {

    // ==================== CREATION ====================

    /**
     * Tạo tin đăng bán tín chỉ (Fixed Price)
     * Endpoint: POST /credit-listings/create
     * @param {string} creditId - ID của tín chỉ
     * @param {number} price - Giá bán
     * @param {string} [sellerLocation] - Vị trí người bán (tùy chọn)
     */
    createListing: async (creditId, price, sellerLocation) => {
        try {
            // Controller dùng @RequestParam nên gửi qua params
            const response = await axiosInstance.post('/credit-listings/create', null, {
                params: {
                    creditId,
                    price,
                    sellerLocation
                }
            });
            return validateResponse(response);
        } catch (error) {
            console.error("Error creating listing:", error);
            throw error;
        }
    },

    /**
     * Tạo tin đăng bán gộp nhiều tín chỉ
     * Endpoint: POST /credit-listings/create-combined
     * @param {string[]} creditIds - Danh sách ID tín chỉ
     * @param {number} pricePerCredit - Giá trên mỗi tín chỉ
     * @param {string} [sellerLocation] - Vị trí người bán
     */
    createCombinedListing: async (creditIds, pricePerCredit, sellerLocation) => {
        try {
            // Controller nhận List<UUID> creditIds qua @RequestParam
            // Axios sẽ tự động serialize mảng thành format: creditIds=id1&creditIds=id2...
            const response = await axiosInstance.post('/credit-listings/create-combined', null, {
                params: {
                    creditIds: creditIds.join(','), // Spring Boot thường nhận dạng id1,id2
                    pricePerCredit,
                    sellerLocation
                }
            });
            return validateResponse(response);
        } catch (error) {
            console.error("Error creating combined listing:", error);
            throw error;
        }
    },

    // ==================== MARKETPLACE (PUBLIC/BUYER) ====================

    /**
     * Lấy danh sách tin đăng đang hoạt động (Marketplace)
     * Endpoint: GET /credit-listings
     */
    getActiveListings: async (page = 0, size = 20, sortBy = 'newest') => {
        try {
            const response = await axiosInstance.get('/credit-listings', {
                params: { page, size, sortBy }
            });
            return validateResponse(response); // Trả về PagedResponseDTO
        } catch (error) {
            console.error("Error fetching active listings:", error);
            throw error;
        }
    },

    /**
     * Tìm kiếm tin đăng theo khoảng giá
     * Endpoint: GET /credit-listings/search
     */
    searchByPriceRange: async (minPrice, maxPrice, page = 0, size = 20) => {
        try {
            const response = await axiosInstance.get('/credit-listings/search', {
                params: { minPrice, maxPrice, page, size }
            });
            return validateResponse(response);
        } catch (error) {
            console.error("Error searching listings:", error);
            throw error;
        }
    },

    /**
     * Mua tin đăng (Purchase Listing)
     * Endpoint: POST /credit-listings/{listingId}/purchase
     */
    purchaseListing: async (listingId) => {
        if (!listingId) throw new Error("Listing ID is required");
        try {
            const response = await axiosInstance.post(`/credit-listings/${listingId}/purchase`);
            return validateResponse(response);
        } catch (error) {
            console.error(`Error purchasing listing ${listingId}:`, error);
            throw error;
        }
    },

    /**
     * Lấy thống kê thị trường
     * Endpoint: GET /credit-listings/stats
     */
    getMarketplaceStats: async () => {
        try {
            const response = await axiosInstance.get('/credit-listings/stats');
            return validateResponse(response);
        } catch (error) {
            console.error("Error fetching marketplace stats:", error);
            throw error;
        }
    },

    // ==================== SELLER MANAGEMENT ====================

    /**
     * Lấy danh sách tin đăng của tôi (bao gồm cả đã bán/hủy)
     * Endpoint: GET /credit-listings/my-listings
     */
    getMyListings: async (page = 0, size = 20) => {
        try {
            const response = await axiosInstance.get('/credit-listings/my-listings', {
                params: { page, size }
            });
            return validateResponse(response);
        } catch (error) {
            console.error("Error fetching my listings:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách tin đăng ĐANG HOẠT ĐỘNG của tôi
     * Endpoint: GET /credit-listings/my-active-listings
     */
    getMyActiveListings: async (page = 0, size = 20) => {
        try {
            const response = await axiosInstance.get('/credit-listings/my-active-listings', {
                params: { page, size }
            });
            return validateResponse(response);
        } catch (error) {
            console.error("Error fetching my active listings:", error);
            throw error;
        }
    },

    /**
     * Cập nhật giá tin đăng
     * Endpoint: PUT /credit-listings/{listingId}/price
     */
    updateListingPrice: async (listingId, newPrice) => {
        if (!listingId) throw new Error("Listing ID is required");
        try {
            const response = await axiosInstance.put(`/credit-listings/${listingId}/price`, null, {
                params: { newPrice }
            });
            return validateResponse(response);
        } catch (error) {
            console.error(`Error updating price for listing ${listingId}:`, error);
            throw error;
        }
    },

    /**
     * Hủy tin đăng
     * Endpoint: DELETE /credit-listings/{listingId}
     */
    cancelListing: async (listingId) => {
        if (!listingId) throw new Error("Listing ID is required");
        try {
            const response = await axiosInstance.delete(`/credit-listings/${listingId}`);
            return validateResponse(response);
        } catch (error) {
            console.error(`Error cancelling listing ${listingId}:`, error);
            throw error;
        }
    }
};