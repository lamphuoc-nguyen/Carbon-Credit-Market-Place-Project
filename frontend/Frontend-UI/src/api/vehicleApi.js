import axiosInstance from "./axiosInstance";

/**
 * Helper function để xử lý wrapper { success: true, data: ... }
 * Nó sẽ trả về phần 'data' nếu thành công, hoặc ném lỗi nếu thất bại.
 */
const validateResponse = (response) => {
    if (response.data && response.data.success) {
        return response.data.data; // Chỉ trả về phần 'data'
    } else {
        // Ném lỗi nếu success: false hoặc không có data
        throw new Error(response.data.message || 'API request failed');
    }
};

export const vehicleApi = {

    /**
     * Lấy chi tiết MỘT vehicle bằng ID
     * Dùng cho: Trang ReviewJourneyDetail.jsx
     * Endpoint: GET /api/vehicles/{id}
     */
    getVehicleById: async (vehicleId) => {
        if (!vehicleId) throw new Error('Vehicle ID is required');
        try {
            const response = await axiosInstance.get(`/api/vehicles/${vehicleId}`);
            // Controller này trả về ApiResponse, nên chúng ta dùng validateResponse
            return validateResponse(response);
        } catch (error) {
            console.error(`Error fetching vehicle ${vehicleId}:`, error);
            throw error; // Ném lỗi để interceptor hoặc component xử lý
        }
    },

    /**
     * Lấy danh sách xe của người dùng đang đăng nhập
     * Endpoint: GET /api/vehicles/my-vehicles
     */
    getMyVehicles: async () => {
        try {
            const response = await axiosInstance.get('/api/vehicles/my-vehicles');
            return validateResponse(response);
        } catch (error) {
            console.error("Error fetching my vehicles:", error);
            throw error;
        }
    },

    /**
     * Tạo một vehicle mới
     * Endpoint: POST /api/vehicles
     */
    createVehicle: async (vehicleData) => {
        // vehicleData là một object, ví dụ:
        // { vin: "...", model: "...", registrationDate: "..." }
        // userId sẽ được set ở backend hoặc bạn có thể thêm vào đây nếu là Admin
        try {
            const response = await axiosInstance.post('/api/vehicles', vehicleData);
            return validateResponse(response);
        } catch (error) {
            console.error("Error creating vehicle:", error);
            throw error;
        }
    },

    /**
     * Cập nhật một vehicle
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
     * Xóa một vehicle
     * Endpoint: DELETE /api/vehicles/{id}
     */
    deleteVehicle: async (vehicleId) => {
        if (!vehicleId) throw new Error('Vehicle ID is required');
        try {
            const response = await axiosInstance.delete(`/api/vehicles/${vehicleId}`);
            return validateResponse(response); // Thường trả về { success: true, message: "..." }
        } catch (error) {
            console.error(`Error deleting vehicle ${vehicleId}:`, error);
            throw error;
        }
    },

    // ===========================================
    // CÁC HÀM DÀNH CHO ADMIN / CVA
    // ===========================================

    /**
     * Lấy TẤT CẢ vehicle (Admin/CVA)
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
     * Lấy vehicle theo User ID (Admin/CVA)
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
    },

    /**
     * Lấy vehicle theo VIN (Admin/CVA)
     * Endpoint: GET /api/vehicles/vin/{vin}
     */
    getVehicleByVin: async (vin) => {
        if (!vin) throw new Error('VIN is required');
        try {
            const response = await axiosInstance.get(`/api/vehicles/vin/${vin}`);
            return validateResponse(response);
        } catch (error) {
            console.error(`Error fetching vehicle by VIN ${vin}:`, error);
            throw error;
        }
    },
};