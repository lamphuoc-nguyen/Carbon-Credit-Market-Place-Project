import React, { useState } from 'react';

// ICON PLACEHOLDER
const Icon = ({ name, className }) => {
    let text = '⚙️';
    switch (name) {
        case 'EyeIcon': text = '👁️'; break;
        case 'CheckIcon': text = '✅'; break;
        case 'XMarkIcon': text = '❌'; break;
        case 'DocumentTextIcon': text = '📝'; break;
        default: text = '⚙️';
    }
    return <div className={`flex items-center justify-center ${className}`}>{text}</div>;
};

const initialRequests = [
    { id: 'REQ001', project: 'Trang trại năng lượng mặt trời A', co2: 50000, date: '20/10/2024', status: 'Chờ kiểm tra', wallet: '0x1a2b3c...f9g0h1' },
    { id: 'REQ002', project: 'Dự án Lâm nghiệp B', co2: 120000, date: '19/10/2024', status: 'Đang kiểm tra', wallet: '0x2b3c4d...g0h1i2' },
    { id: 'REQ003', project: 'Phát triển bền vững C', co2: 3000, date: '18/10/2024', status: 'Chờ kiểm tra', wallet: '0x3c4d5e...h1i2j3' },
];


const AuditTable = ({ setCurrentPage }) => {
    const [requests, setRequests] = useState(initialRequests);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [proposedCredit, setProposedCredit] = useState(0);

    const openAuditModal = (request) => {
        setSelectedRequest(request);
        setProposedCredit(request.co2 * 0.95); // Giá trị đề xuất
        setIsModalOpen(true);
    };

    const handleApprove = () => {
        // Lưu tạm request đã duyệt để chuyển sang bước cấp tín chỉ
        localStorage.setItem('approvedRequest', JSON.stringify({ ...selectedRequest, finalCredit: proposedCredit }));
        alert(`Yêu cầu ${selectedRequest.id} đã DUYỆT với ${proposedCredit.toLocaleString()} tCO2e. Chuyển sang Cấp Tín chỉ.`);
        setIsModalOpen(false);
        setCurrentPage('issue_credit'); // Chuyển sang bước cấp tín chỉ
    };

    const handleReject = () => {
        const reason = prompt("Nhập lý do TỪ CHỐI yêu cầu:");
        if (reason) {
            alert(`Yêu cầu ${selectedRequest.id} đã TỪ CHỐI. Lý do: ${reason}`);
            setRequests(requests.map(req => req.id === selectedRequest.id ? { ...req, status: 'Đã từ chối' } : req));
            setIsModalOpen(false);
        }
    };

    const StatusBadge = ({ status }) => {
        let color = '';
        switch (status) {
            case 'Chờ kiểm tra': color = 'bg-yellow-100 text-yellow-800 border-yellow-300'; break;
            case 'Đang kiểm tra': color = 'bg-blue-100 text-blue-800 border-blue-300'; break;
            case 'Đã từ chối': color = 'bg-red-100 text-red-800 border-red-300'; break;
            default: color = 'bg-gray-100 text-gray-800 border-gray-300';
        }
        return (
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full border ${color}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Kiểm tra Dữ liệu & Phê duyệt Tín chỉ</h2>

            {/* Thanh lọc và tìm kiếm */}
            <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-md">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo ID Yêu cầu, Dự án..."
                    className="p-3 border border-gray-300 rounded-lg w-1/3 focus:ring-green-500 focus:border-green-500"
                />
                <select className="p-3 border border-gray-300 rounded-lg">
                    <option>Lọc theo Trạng thái: Chờ kiểm tra</option>
                    <option>Tất cả</option>
                    <option>Đang kiểm tra</option>
                    <option>Đã từ chối</option>
                </select>
            </div>

            {/* Bảng Yêu cầu */}
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['ID Yêu cầu', 'Dự án/Tổ chức', 'Phát thải Báo cáo (tCO2e)', 'Ngày Gửi', 'Trạng thái', 'Hành động'].map((header) => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-green-50 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.project}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">{req.co2.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={req.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => openAuditModal(req)}
                                        className="text-indigo-600 hover:text-indigo-900 font-medium p-2 rounded-full hover:bg-indigo-100 transition"
                                        title="Xem Chi tiết Kiểm toán"
                                    >
                                        <Icon name="EyeIcon" className="h-5 w-5 inline-block text-lg" /> Xem Chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Kiểm tra & Duyệt */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold text-gray-800 border-b pb-3">
                            Kiểm toán Yêu cầu: {selectedRequest.id} - {selectedRequest.project}
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-500">Lượng phát thải báo cáo</p>
                                <p className="text-xl font-bold text-green-600">{selectedRequest.co2.toLocaleString()} tCO2e</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-500">Địa chỉ Ví Carbon</p>
                                <p className="text-sm font-mono text-gray-800 truncate">{selectedRequest.wallet}</p>
                            </div>
                        </div>

                        <div className="border border-dashed border-gray-300 p-4 rounded-lg space-y-2">
                            <p className="font-semibold text-gray-700 flex items-center">
                                <Icon name="DocumentTextIcon" className="h-5 w-5 mr-2 text-blue-500 text-lg" /> Hồ sơ Kiểm toán (4 Files)
                            </p>
                            <ul className="text-sm text-gray-600 ml-4 list-disc space-y-1">
                                <li className="hover:text-green-600 cursor-pointer">Báo cáo Phát thải Q3/2024.pdf</li>
                                <li className="hover:text-green-600 cursor-pointer">Biên bản Xác minh hiện trường.docx</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-lg font-medium text-gray-700">Lượng Tín chỉ được đề xuất Cấp (tCO2e)</label>
                            <input
                                type="number"
                                value={proposedCredit}
                                onChange={(e) => setProposedCredit(e.target.value)}
                                className="p-3 border-2 border-green-300 rounded-lg w-full text-xl font-bold focus:ring-green-500"
                            />

                            <label className="block text-lg font-medium text-gray-700 pt-4">Nhận xét/Lý do (Bắt buộc)</label>
                            <textarea
                                placeholder="Ghi chú chi tiết về quá trình kiểm toán và quyết định..."
                                rows="4"
                                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-green-500 focus:border-green-500"
                            ></textarea>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4 border-t mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition flex items-center"
                            >
                                <Icon name="XMarkIcon" className="h-5 w-5 mr-2 text-lg" /> TỪ CHỐI
                            </button>
                            <button
                                onClick={handleApprove}
                                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center"
                            >
                                <Icon name="CheckIcon" className="h-5 w-5 mr-2 text-lg" /> DUYỆT & CẤP TÍN CHỈ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditTable;