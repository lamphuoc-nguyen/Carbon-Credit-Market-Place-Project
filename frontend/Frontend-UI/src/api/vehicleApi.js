import axiosInstance from "./axiosInstance";

/**
 * Helper function để validate và trích xuất dữ liệu từ response.
 * Backend trả về: { success: true, message: "...", data: ... }
 */
const validateResponse = (response) => {
    // Kiểm tra nếu response tồn tại và có data
    if (response && response.data) {
        // Trường hợp thành công (success = true)
        if (response.data.success) {
            return response.data.data; // Trả về phần data thực tế (VehicleDTO, List, v.v.)
        }

        // Trường hợp thất bại (success = false) -> Ném lỗi với message từ backend
        throw new Error(response.data.message || 'Request failed');
    }

    // Fallback cho các trường hợp không đúng chuẩn ApiResponse (ít gặp)
    if (response.status >= 200 && response.status < 300) {
        return response.data;
    }

    throw new Error('No response data received');
};

export const vehicleApi = {

    // ==================== CORE CRUD OPERATIONS ====================
    /**
     * Cập nhật thông tin phương tiện
     * Endpoint: PUT /api/vehicles/{id}
     */
    updateVehicle: async (vehicleId, vehicleData) => {
        if (!vehicleId) throw new Error('Vehicle ID is required');
        try {
            const response = await axiosInstance.put(`/api/vehicles/${vehicleId}`, vehicleData);
            return validateResponse(response);
        } catch (error) {
            console.error(`Error updating vehicle ${vehicleId}:`, error);
            throw error;
        }
    },
    /**
     * Xóa phương tiện
     * Endpoint: DELETE /api/vehicles/{id}
     */
    deleteVehicle: async (vehicleId) => {
        if (!vehicleId) throw new Error('Vehicle ID is required');
        try {
            const response = await axiosInstance.delete(`/api/vehicles/${vehicleId}`);
            return validateResponse(response); // Trả về null hoặc message thành công
        } catch (error) {
            console.error(`Error deleting vehicle ${vehicleId}:`, error);
            throw error;
        }
    },
// ==================== USER SPECIFIC ====================
// ==================== ADMIN / CVA OPERATIONS ====================

    /**
     * Lấy danh sách TẤT CẢ xe trên hệ thống (Admin/CVA)
     * Endpoint: GET /api/vehicles
     */
    getAllVehicles: async () => {
        try {
            const response = await axiosInstance.get('/api/vehicles');
            return validateResponse(response);
        } catch (error) {
            console.error("Error fetching all vehicles:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách xe của một User cụ thể (Admin/CVA)
     * Endpoint: GET /api/vehicles/user/{userId}
     */
    getVehiclesByUserId: async (userId) => {
        if (!userId) throw new Error('User ID is required');
        try {
            const response = await axiosInstance.get(`/api/vehicles/user/${userId}`);
            return validateResponse(response);
        } catch (error) {
            console.error(`Error fetching vehicles for user ${userId}:`, error);
            throw error;
        }
    }
};