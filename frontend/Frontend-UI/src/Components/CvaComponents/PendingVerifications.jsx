// src/pages/PendingVerifications.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ Import apiClient đã được cấu hình (từ axiosInstance.js)
import { journeyApi } from '../../api/journeyApi';


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

                // ✅ BƯỚC 2: Gọi hàm API mới
                // Hàm này đã bao gồm cả việc gọi apiClient và validate
                const data = await journeyApi.getPendingJourneys();
                setJourneys(data);

            } catch (err) {
                console.error("Error fetching pending journeys:", err);
                if (err.response?.status !== 401) {
                    setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPendingJourneys();
    }, []); // Bỏ 'navigate' khỏi dependency array

    // Hàm xử lý khi nhấn nút "Review"
    const handleReviewClick = (journeyId) => {
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
        return <div className="p-10 text-center text-gray-500">There are no pending journeys awaiting approval.</div>;
    }


    const StatusBadge = ({ status }) => {
        let colorClasses = 'bg-gray-100 text-gray-600'; // Default
        let text = 'None';

        switch (status) {
            case 'PENDING_VERIFICATION':
                colorClasses = 'bg-orange-100 text-orange-700';
                text = 'Pending';
                break;
            case 'VERIFIED':
                colorClasses = 'bg-green-100 text-green-700';
                text = 'Verified';
                break;
            case 'REJECTED':
                colorClasses = 'bg-red-100 text-red-700';
                text = 'Rejected';
                break;
            default:
                text = status || 'None';
        }

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
                {text}
            </span>
        );
    };

    // Hiển thị bảng dữ liệu
    return (
        <div className="p-4 md:p-8">
            {/* Container: Giữ nguyên shadow-lg và rounded-lg, 
      thêm border mỏng để tăng độ sắc nét 
    */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    {/* Header: Tăng kích thước chữ, tăng độ đậm, thêm khoảng cách chữ (tracking)
            */}
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                User
                            </th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Distance
                            </th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                CO2 Reduced (Kg)
                            </th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Submitted At
                            </th>
                            <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="py-4 px-6 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {journeys.map((journey) => (
                            <tr key={journey.id} className="hover:bg-gray-50 transition-colors duration-150">

                                {/* Cell User: 
                          - Bỏ 'whitespace-nowrap' để tên dài có thể xuống dòng.
                          - Thêm padding dọc 'py-5' để tăng khoảng cách.
                        */}
                                <td className="py-5 px-6">
                                    <div className="text-sm font-medium text-gray-900">{journey.user?.username || 'N/A'}</div>
                                    {/* Bạn có thể thêm email ở đây nếu muốn */}
                                    {/* <div className="text-xs text-gray-500">{journey.user?.email}</div> */}
                                </td>

                                <td className="py-5 px-6 whitespace-nowrap text-sm text-gray-700">
                                    {journey.distanceKm ? Number(journey.distanceKm).toFixed(2) : '0.00'} km
                                </td>

                                <td className="py-5 px-6 whitespace-nowrap">
                                    <span className="text-sm font-semibold text-green-600">
                                        {journey.co2ReducedKg ? Number(journey.co2ReducedKg).toFixed(4) : '0.0000'}
                                    </span>
                                </td>

                                <td className="py-5 px-6 whitespace-nowrap text-sm text-gray-700">
                                    {journey.createdAt ? new Date(journey.createdAt).toLocaleString('vi-VN') : 'N/A'}
                                </td>

                                <td className="py-5 px-6 whitespace-nowrap text-center">
                                    {/* Sử dụng component StatusBadge và truyền journey.verificationStatus */}
                                    {/* (Kiểm tra console.log nếu tên trường khác) */}
                                    <StatusBadge status={journey.verificationStatus} />
                                </td>

                                <td className="py-5 px-6 whitespace-nowrap text-right">
                                    <button
                                        onClick={() => handleReviewClick(journey.id)}
                                        // Nút style mới: nhẹ nhàng hơn
                                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 
                                           text-xs font-semibold py-2 px-4 rounded-lg 
                                           transition-all duration-200"
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