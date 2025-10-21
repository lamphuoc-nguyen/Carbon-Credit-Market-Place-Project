import React, { useState } from 'react';

// ICON PLACEHOLDER
const Icon = ({ name, className }) => {
    let text = '⚙️';
    switch (name) {
        case 'CalendarIcon': text = '📅'; break;
        case 'ArrowDownTrayIcon': text = '⬇️'; break;
        default: text = '⚙️';
    }
    return <div className={`flex items-center justify-center ${className}`}>{text}</div>;
};

const mockReportData = [
    { id: 'REQ001', project: 'Năng lượng A', date: '20/10/2024', amount: 47500, status: 'Đã Cấp', issuer: 'CVA-ABC' },
    { id: 'REQ002', project: 'Lâm nghiệp B', date: '19/10/2024', amount: 120000, status: 'Đang kiểm tra', issuer: 'CVA-ABC' },
    { id: 'REQ004', project: 'Công nghiệp D', date: '15/10/2024', amount: 85000, status: 'Đã từ chối', issuer: 'CVA-ABC' },
    { id: 'REQ005', project: 'Năng lượng C', date: '14/10/2024', amount: 20000, status: 'Đã Cấp', issuer: 'CVA-ABC' },
];

const Reports = () => {
    const [reportType, setReportType] = useState('issued');

    const handleExport = () => {
        alert(`Đang xuất báo cáo loại: ${reportType} ra file Excel/CSV...`);
    };

    const filteredData = mockReportData.filter(d => {
        const statusLower = d.status.toLowerCase();
        switch (reportType) {
            case 'issued': return statusLower.includes('cấp');
            case 'pending': return statusLower.includes('kiểm tra');
            case 'denied': return statusLower.includes('từ chối');
            case 'all': default: return true;
        }
    });

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Xuất Báo cáo Phát hành Tín chỉ Carbon</h2>

            {/* Bộ lọc và Thao tác */}
            <div className="bg-white p-6 rounded-xl shadow-xl flex items-center space-x-4">

                {/* Lọc theo Phạm vi Thời gian */}
                <div className="flex items-center space-x-2 border p-2 rounded-lg">
                    <Icon name="CalendarIcon" className="h-6 w-6 text-xl text-gray-500" />
                    <input type="date" className="p-1 border rounded" defaultValue="2024-10-01" />
                    <span>đến</span>
                    <input type="date" className="p-1 border rounded" defaultValue="2024-10-31" />
                </div>

                {/* Lọc theo Trạng thái */}
                <select
                    className="p-3 border border-gray-300 rounded-lg"
                    onChange={(e) => setReportType(e.target.value)}
                    value={reportType}
                >
                    <option value="issued">Tín chỉ Đã Cấp</option>
                    <option value="pending">Yêu cầu Đang Chờ</option>
                    <option value="denied">Yêu cầu Đã Từ chối</option>
                    <option value="all">Tất cả Giao dịch</option>
                </select>

                {/* Nút Xuất Báo cáo */}
                <button
                    onClick={handleExport}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition flex items-center space-x-2"
                >
                    <Icon name="ArrowDownTrayIcon" className="h-5 w-5 text-lg" />
                    <span>XUẤT BÁO CÁO (.xlsx)</span>
                </button>
            </div>

            {/* Bảng Dữ liệu Báo cáo */}
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                <h3 className="p-4 text-xl font-semibold border-b text-gray-700">Kết quả Báo cáo: {reportType.toUpperCase()}</h3>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['ID Yêu cầu', 'Dự án', 'Ngày Xử lý', 'Lượng Tín chỉ (tCO2e)', 'Trạng thái', 'Tổ chức CVA'].map((header) => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map((data) => (
                            <tr key={data.id} className="hover:bg-gray-50 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{data.project}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">{data.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{data.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.issuer}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;