// src/pages/PendingVerifications.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ Import apiClient đã được cấu hình (từ axiosInstance.js)
import apiClient from '../../api/axiosInstance';


const PendingVerifications = () => {
    const [journeys, setJourneys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPendingJourneys = async () => {
            try {
                setLoading(true);
                setError(null);

                // Gọi API - endpoint này khớp với CVAController
                const response = await apiClient.get('/api/cva/pending-journeys');

                // Dữ liệu nằm trong response.data.data
                if (response.data && response.data.success) {
                    setJourneys(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch data.');
                }

            } catch (err) {
                console.error("Error fetching pending journeys:", err);

                {/* ✅ Tinh chỉnh: Đơn giản hóa khối catch.
                  File `axiosInstance` của bạn đã tự động xử lý lỗi 401 (Unauthorized)
                  bằng cách điều hướng người dùng về trang /login.
                  Vì vậy, ở đây chúng ta chỉ cần hiển thị lỗi cho các trường hợp khác (như 500, 404, 403...).
                */}
                if (err.response?.status !== 401) {
                    setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPendingJourneys();
    }, [navigate]); // Thêm navigate vào dependency array

    // Hàm xử lý khi nhấn nút "Review"
    const handleReviewClick = (journeyId) => {
        // Điều hướng đến trang chi tiết
        navigate(`/cva/review/${journeyId}`);
    };

    // --- Hiển thị Giao diện ---
    if (loading) {
        return <div className="p-10 text-center text-gray-500">Loading...</div>;
    }

    if (error) {
        return <div className="p-10 text-center text-red-600 font-bold">{error}</div>;
    }

    if (journeys.length === 0) {
        return <div className="p-10 text-center text-gray-500">Không có hành trình nào đang chờ duyệt.</div>;
    }

    // Hiển thị bảng dữ liệu
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Pending Verifications</h1>
            <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                            {/* ✅ Sửa 1: Đổi tên cột để khớp với DTO */}
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">CO2 Reduced (Kg)</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
                            <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        _ </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {journeys.map((journey) => (
                            <tr key={journey.id} className="hover:bg-gray-50 transition-colors">
                                _  <td className="py-4 px-6 whitespace-nowrap">
                                    {/* ✅ Sửa 2: Truy cập 'journey.user.username' thay vì 'journey.username' */}
                                    <div className="font-medium text-gray-900">{journey.user?.username || 'N/A'}</div>
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                    {/* ✅ Sửa 3: Dùng 'distanceKm' (khớp với DTO) thay vì 'distanceInKm' */}
                                    {journey.distanceKm ? Number(journey.distanceKm).toFixed(2) : '0.00'} km
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                    {/* ✅ Sửa 4: Dùng 'co2ReducedKg' (khớp với DTO) thay vì 'creditAmount'.
                                      Bạn cần cập nhật DTO để thêm 'creditAmount' nếu muốn hiển thị nó.
                                    */}
                                    <span className="font-semibold text-green-600">
                                        {journey.co2ReducedKg ? Number(journey.co2ReducedKg).toFixed(4) : '0.0000'}
                                    </span>
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-600">
                                    {/* ✅ Sửa 5: Dùng 'createdAt' (khớp với DTO) thay vì 'submissionDate' */}
                                    {journey.createdAt ? new Date(journey.createdAt).toLocaleString('vi-VN') : 'N/A'}
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap text-center">
                                    <button
                                        onClick={() => handleReviewClick(journey.id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                                    >
                                        Review
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PendingVerifications;