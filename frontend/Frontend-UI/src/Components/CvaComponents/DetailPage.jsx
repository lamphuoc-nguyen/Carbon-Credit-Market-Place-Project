import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, Zap, Map, Clock, Hash, Calendar, Dna, Car, AtSign, ArrowLeft,
    CheckCircle, XCircle,
    FileText // ✅ BƯỚC 1: Import thêm icon cho Status
} from 'lucide-react';

// Import các API service
import { journeyApi } from '../../api/journeyApi';
import { vehicleApi } from '../../api/vehicleApi';

// --- Component con để hiển thị chi tiết (✅ ĐÃ NÂNG CẤP) ---
// Giờ đây component này chấp nhận 'value' (cho text) hoặc 'children' (cho component)
const DetailItem = (props) => (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 h-full">

        {/* Dùng props.IconComponent */}
        <props.IconComponent className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />

        <div>
            {/* Dùng props.label */}
            <p className="text-sm font-medium text-gray-500">{props.label}</p>

            {/* Dùng props.children và props.value */}
            {props.children ? (
                <div className="mt-1">{props.children}</div> // Hiển thị StatusBadge
            ) : (
                <p className="text-lg font-semibold text-gray-900 break-words">
                    {props.value || 'N/A'}
                </p>
            )}
        </div>
    </div>
);

// --- Component StatusBadge (Không đổi) ---
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
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses}`}>
            {text}
        </span>
    );
};


// --- Component chính (Trang Detail MỚI) ---
const DetailPage = () => {
    const { journeyId } = useParams();
    const navigate = useNavigate();

    const [journey, setJourney] = useState(null);
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect (Không đổi)
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const journeyData = await journeyApi.getJourneyById(journeyId);
                setJourney(journeyData);

                if (journeyData.vehicleId) {
                    const vehicleData = await vehicleApi.getVehicleById(journeyData.vehicleId);
                    setVehicle(vehicleData);
                } else {
                    throw new Error('Journey does not have an associated vehicle ID.');
                }

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu chi tiết:", err);
                if (err.response?.status !== 401) {
                    setError('Không thể tải dữ liệu. ' + err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [journeyId]);

    // --- PHẦN RENDER ---
    if (loading && !journey) {
        return <div className="p-10 text-center text-gray-500">Đang tải chi tiết...</div>;
    }

    if (error) {
        return <div className="p-10 text-center text-red-600 font-bold">{error}</div>;
    }

    if (!journey) {
        return <div className="p-10 text-center text-gray-500">Không tìm thấy dữ liệu.</div>;
    }

    // Logic lấy lý do (dựa trên ảnh database bạn gửi)
    const reasonValue = journey.rejectionReason || journey.verificationNotes;

    return (
        <div className="space-y-6 p-4 md:p-8">

            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
            >
                <ArrowLeft size={16} />
                Quay lại
            </button>

            <h1 className="text-3xl font-bold text-gray-800">Journey Details</h1>
            <p className="text-lg text-gray-600">
                ID: <span className="font-mono text-sm bg-gray-100 p-1 rounded">{journey.id}</span>
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 space-y-6">

                    {/* ✅ BƯỚC 3: THIẾT KẾ LẠI "Verification Details" */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* Dùng DetailItem bọc StatusBadge */}
                            <DetailItem IconComponent={FileText} label="Status">
                                <StatusBadge status={journey.verificationStatus} />
                            </DetailItem>

                            {/* Dùng DetailItem cho Người duyệt (vẫn dùng 'value') */}
                            <DetailItem
                                IconComponent={User}
                                label="Verified By"
                                value={journey.verifiedByUsername}
                            />

                            {/* Dùng DetailItem cho Ngày duyệt (vẫn dùng 'value') */}
                            <DetailItem
                                IconComponent={Calendar}
                                label="Verification Date"
                                value={journey.verificationDate ? new Date(journey.verificationDate).toLocaleString('vi-VN') : 'N/A'}
                            />
                        </div>

                        {/* Hiển thị Lý do (nếu có) */}
                        {reasonValue && (
                            <div className="mt-4">
                                <DetailItem
                                    IconComponent={journey.verificationStatus === 'REJECTED' ? XCircle : CheckCircle}
                                    label={journey.verificationStatus === 'REJECTED' ? "Rejection Reason" : "Approval Notes"}
                                    value={reasonValue}
                                />
                            </div>
                        )}
                    </div>

                    {/* Các box chi tiết khác (giữ nguyên) */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Journey Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DetailItem IconComponent={Map} label="Distance" value={`${journey.distanceKm} km`} />
                            <DetailItem IconComponent={Zap} label="Energy Consumed" value={`${journey.energyConsumedKwh} kWh`} />
                            <DetailItem IconComponent={Dna} label="CO₂ Reduced" value={`${journey.co2ReducedKg} kg`} />
                            <DetailItem IconComponent={Clock} label="Start Time" value={new Date(journey.startTime).toLocaleString('vi-VN')} />
                            <DetailItem IconComponent={Clock} label="End Time" value={new Date(journey.endTime).toLocaleString('vi-VN')} />
                            <DetailItem IconComponent={Calendar} label="Submitted At" value={new Date(journey.createdAt).toLocaleString('vi-VN')} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle & User Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DetailItem IconComponent={Hash} label="Vehicle VIN" value={vehicle?.vin} />
                            <DetailItem IconComponent={Car} label="Vehicle Model" value={vehicle?.model} />
                            <DetailItem IconComponent={Calendar} label="Reg. Date" value={vehicle ? new Date(vehicle.registrationDate).toLocaleDateString('vi-VN') : 'N/A'} />
                            <DetailItem IconComponent={User} label="EV Owner" value={journey.user.username} />
                            <DetailItem IconComponent={Dna} label="Owner Full Name" value={journey.user.fullName} />
                            <DetailItem IconComponent={AtSign} label="Owner Email" value={journey.user.email} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailPage;