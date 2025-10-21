import React, { useState, useEffect } from 'react';

// ICON PLACEHOLDER
const Icon = ({ name, className }) => {
    let text = '⚙️';
    switch (name) {
        case 'MagicWandIcon': text = '✨'; break;
        case 'ExternalLinkIcon': text = '🔗'; break;
        case 'CheckIcon': text = '✅'; break;
        default: text = '⚙️';
    }
    return <div className={`flex items-center justify-center ${className}`}>{text}</div>;
};

const IssueCredit = () => {
    const [isIssued, setIsIssued] = useState(false);
    const [transactionHash, setTransactionHash] = useState('');
    const [requestData, setRequestData] = useState(null);

    useEffect(() => {
        // Lấy dữ liệu yêu cầu đã duyệt từ AuditTable (giả lập)
        const approvedReq = localStorage.getItem('approvedRequest');
        if (approvedReq) {
            setRequestData(JSON.parse(approvedReq));
        } else {
            // Dữ liệu giả định nếu không tìm thấy trong localStorage
            setRequestData({ id: 'REQ000_SAMPLE', project: 'Dự án Mẫu', finalCredit: 100000, wallet: '0xSAMPLE...ADDRESS' });
        }
    }, []);

    const handleIssue = () => {
        // Giả lập giao dịch blockchain
        setTimeout(() => {
            const hash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
            setTransactionHash(hash);
            setIsIssued(true);
            localStorage.removeItem('approvedRequest'); // Xóa sau khi cấp thành công
        }, 1500);
    }

    if (!requestData) {
        return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu yêu cầu...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 p-8 bg-white shadow-2xl rounded-2xl border-t-4 border-green-600">
            <h2 className="text-3xl font-bold text-gray-800">Cấp Tín chỉ và Ghi vào Ví Carbon</h2>
            <p className="text-gray-600">Xác nhận thông tin và thực hiện giao dịch cấp tín chỉ lên hệ thống/blockchain.</p>

            <div className="space-y-6 p-6 bg-green-50 border border-green-300 rounded-xl">
                <h3 className="text-xl font-semibold text-green-800">Thông tin Tín chỉ</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">ID Yêu cầu Đã Duyệt</p>
                        <p className="text-lg font-bold text-gray-900">{requestData.id}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Dự án/Tổ chức</p>
                        <p className="text-lg font-bold text-gray-900">{requestData.project}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Lượng Tín chỉ Chính thức</p>
                        <p className="text-3xl font-extrabold text-green-700">{requestData.finalCredit.toLocaleString()} tCO2e</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Ví Carbon Nhận</p>
                        <p className="text-md font-mono text-gray-800 truncate" title={requestData.wallet}>{requestData.wallet}</p>
                    </div>
                </div>
            </div>

            {!isIssued ? (
                <button
                    onClick={handleIssue}
                    className="w-full px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-xl shadow-lg hover:bg-green-700 transition duration-300 flex items-center justify-center space-x-3"
                    disabled={!requestData.id}
                >
                    <Icon name="MagicWandIcon" className="h-7 w-7 text-2xl" />
                    <span>THỰC HIỆN CẤP TÍN CHỈ LÊN HỆ THỐNG</span>
                </button>
            ) : (
                <div className="p-6 bg-lime-100 border border-lime-400 rounded-xl space-y-4">
                    <h3 className="text-xl font-bold text-lime-800 flex items-center space-x-2">
                        <Icon name="CheckIcon" className="h-6 w-6 text-2xl" /> <span>ĐÃ CẤP TÍN CHỈ THÀNH CÔNG!</span>
                    </h3>
                    <p className="text-gray-700 break-words">
                        **Mã Giao dịch (Hash):** <span className="font-mono text-sm text-green-700">{transactionHash}</span>
                    </p>
                    <a
                        href={`#explorer/${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                    >
                        <span>Xem trên Carbon Explorer</span>
                        <Icon name="ExternalLinkIcon" className="h-4 w-4 text-base" />
                    </a>
                </div>
            )}
        </div>
    );
};

export default IssueCredit;