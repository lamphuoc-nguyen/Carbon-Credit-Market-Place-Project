import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle, XCircle, User, Zap, Map, Clock, Hash, Calendar, Dna, Car, AtSign
} from 'lucide-react';

// Import các API service
import { journeyApi } from '../../api/journeyApi';
// import { carbonCreditApi } from '../../api/carbonCreditApi'; // Tạm thời không cần
import { vehicleApi } from '../../api/vehicleApi';
import { cvaApi } from '../../api/cvaApi'; // ✅ API chính chúng ta sẽ dùng

// --- Component con để hiển thị chi tiết ---
const DetailItem = (props) => (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <props.IconComponent className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
        <div>
            <p className="text-sm font-medium text-gray-500">{props.label}</p>
            <p className="text-lg font-semibold text-gray-900 break-words">
                {props.value || 'N/A'}
            </p>
        </div>
    </div>
);

// --- Component chính ---
const ReviewJourneyDetail = () => {
    const { journeyId } = useParams(); // ✅ Lấy ID hành trình từ URL
    const navigate = useNavigate();

    const [journey, setJourney] = useState(null);
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState('');

    // ❌ Không cần state carbonCreditId nữa
    // const [carbonCreditId, setCarbonCreditId] = useState(null); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const journeyData = await journeyApi.getJourneyById(journeyId);
                setJourney(journeyData);

                // ❌ Không cần lấy carbonCreditId
                // if (journeyData.carbonCreditId) { ... }

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

    // ✅ HÀM QUAN TRỌNG ĐÃ SỬA
    const handleVerification = async (action) => {

        // ❌ Không cần kiểm tra carbonCreditId
        // if (!carbonCreditId) { ... }

        // Kiểm tra lý do từ chối (vẫn giữ)
        if (action === 'reject' && !comments) {
            alert('Vui lòng nhập lý do từ chối.');
            return;
        }

        try {
            setLoading(true);

            if (action === 'approve') {
                // ✅ SỬA: Gọi cvaApi.approveJourney với journeyId
                await cvaApi.approveJourney(journeyId, comments || 'Approved by CVA');
            } else {
                // ✅ SỬA: Gọi cvaApi.rejectJourney với journeyId
                await cvaApi.rejectJourney(journeyId, comments);
            }

            alert(`Hành trình đã được ${action === 'approve' ? 'phê duyệt' : 'từ chối'}!`);
            navigate('/cva/pending');

        } catch (err) {
            console.error(`Lỗi khi ${action} hành trình:`, err);
            alert('Đã xảy ra lỗi: ' + err.message);
            setLoading(false);
        }
    };

    // --- PHẦN RENDER (Không có gì thay đổi) ---
    if (loading && !journey) {
        return <div className="p-10 text-center text-gray-500">Đang tải chi tiết...</div>;
    }

    if (error) {
        return <div className="p-10 text-center text-red-600 font-bold">{error}</div>;
    }

    if (!journey) {
        return <div className="p-10 text-center text-gray-500">Không tìm thấy dữ liệu.</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Review Journey</h1>
            <p className="text-lg text-gray-600">
                ID: <span className="font-mono text-sm bg-gray-100 p-1 rounded">{journey.id}</span>
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
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

                {/* CỘT 3: HÀNH ĐỘNG */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Actions</h2>
                    <div className="space-y-4">
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            rows="4"
                            placeholder="Thêm ghi chú/lý do từ chối (bắt buộc nếu từ chối)..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            onClick={() => handleVerification('reject')}
                            disabled={loading || !comments}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:bg-gray-400"
                        >
                            <XCircle className="h-5 w-5" /> Reject
                        </button>
                        <button
                            onClick={() => handleVerification('approve')}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                        >
                            <CheckCircle className="h-5 w-5" /> Approve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewJourneyDetail;