import axiosInstance from './axiosInstance';

/**
 * Handle API response and extract data from ApiResponse
 * @param {Promise<object>} request - API request promise
 * @returns {Promise<any>} - Returns only the 'data' part from ApiResponse
 */
const handleRequest = async (request) => {
    try {
        const response = await request;
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'API request failed');
    } catch (error) {
        console.error('CO2 Transfer API Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * API service for CO2 transfer functionality
 */
export const co2TransferApi = {
    /**
     * Create a new CO2 to credit transfer request
     * POST /api/co2-transfer/request
     * @param {Object} requestData - Transfer request data
     * @param {number} requestData.co2Amount - Amount of CO2 to transfer (in kg)
     * @param {string[]} [requestData.journeyIds] - Optional list of journey IDs
     * @returns {Promise<Co2TransferRequestDTO>}
     */
    createTransferRequest: (requestData) => {
        return handleRequest(axiosInstance.post('/api/co2-transfer/request', requestData));
    },

    /**
     * Get all transfer requests for the current user
     * GET /api/co2-transfer/my-requests
     * @returns {Promise<Co2TransferRequestDTO[]>}
     */
    getMyTransferRequests: () => {
        return handleRequest(axiosInstance.get('/api/co2-transfer/my-requests'));
    },

    /**
     * Get transfer request statistics for the current user
     * GET /api/co2-transfer/stats
     * @returns {Promise<object>} - Transfer statistics
     */
    getTransferRequestStats: () => {
        return handleRequest(axiosInstance.get('/api/co2-transfer/stats'));
    },

    /**
     * Cancel a pending transfer request (if implemented in backend)
     * DELETE /api/co2-transfer/{requestId}
     * @param {string} requestId - Transfer request ID
     * @returns {Promise<string>} - Cancellation confirmation
     */
    cancelTransferRequest: (requestId) => {
        return handleRequest(axiosInstance.delete(`/api/co2-transfer/${requestId}`));
    },
};
