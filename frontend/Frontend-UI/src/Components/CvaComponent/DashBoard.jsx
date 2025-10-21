import React from 'react'

const DashBoard = () => {

    const Icon = ({ name, className }) => {
        let text = '⚙️';
        switch (name) {
            case 'ClockIcon': text = '⏳'; break;
            case 'CheckCircleIcon': text = '✅'; break;
            case 'XMarkIcon': text = '❌'; break;
            case 'DocumentChartBarIcon': text = '📊'; break;
            default: text = '⚙️';
        }
        return <div className={`flex items-center justify-center ${className}`}>{text}</div>;
    };

    const stats = [
        {
            name: 'Yêu cầu Chờ duyệt',
            value: '45',
            icon: 'ClockIcon',
            color: 'border-yellow-500',
            description: 'Tổng số yêu cầu đang chờ kiểm tra.'
        },
        {
            name: 'Tín chỉ đã Cấp (T.Này)',
            value: '120,000 tCO2e',
            icon: 'CheckCircleIcon',
            color: 'border-green-500',
            description: 'Tổng lượng tín chỉ đã được cấp thành công.'
        },
        {
            name: 'Yêu cầu Bị từ chối',
            value: '5',
            icon: 'XMarkIcon',
            color: 'border-red-500',
            description: 'Số lượng yêu cầu không đạt tiêu chuẩn.'
        },
        {
            name: 'Tổng Hồ sơ Kiểm toán',
            value: '145',
            icon: 'DocumentChartBarIcon',
            color: 'border-blue-500',
            description: 'Tổng số hồ sơ đã được CVA xử lý trong năm.'
        },
    ];

  return (
      <div className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-800">Tổng quan Hoạt động Kiểm toán</h2>

          {/* Grid Thẻ Tổng quan (Stats Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                  <div
                      key={stat.name}
                      className={`bg-white p-6 rounded-2xl shadow-xl border-l-4 ${stat.color} hover:shadow-2xl transition duration-300`}
                  >
                      <div className="flex items-center justify-between">
                          <p className="text-lg font-medium text-gray-500">{stat.name}</p>
                          <div className={`p-2 rounded-full bg-green-100 text-green-600`}>
                              <Icon name={stat.icon} className="h-6 w-6 text-2xl" />
                          </div>
                      </div>
                      <p className="text-4xl font-extrabold text-gray-900 mt-2">{stat.value}</p>
                      <p className="text-sm text-gray-400 mt-1">{stat.description}</p>
                  </div>
              ))}
          </div>

          {/* Biểu đồ & Bảng hoạt động gần đây */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Biểu đồ xu hướng */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Xu hướng Phê duyệt Tín chỉ (6 tháng)</h3>
                  <div className="h-80 flex items-center justify-center text-gray-400 border border-dashed rounded-lg bg-gray-50">
                      [Placeholder Biểu đồ Xu hướng]
                  </div>
              </div>

              {/* Hoạt động Gần đây */}
              <div className="bg-white p-6 rounded-2xl shadow-xl">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Hoạt động Gần đây</h3>
                  <ul className="space-y-4">
                      <li className="flex justify-between items-center text-sm border-b pb-2">
                          <span className="text-gray-600">REQ001 - <span className="font-medium">Chờ kiểm tra</span></span>
                          <span className="text-xs text-gray-400">10 phút trước</span>
                      </li>
                      <li className="flex justify-between items-center text-sm border-b pb-2">
                          <span className="text-green-600 font-medium">Cấp 85,000 tCO2e</span>
                          <span className="text-xs text-gray-400">1 giờ trước</span>
                      </li>
                      <li className="flex justify-between items-center text-sm border-b pb-2">
                          <span className="text-red-600 font-medium">TỪ CHỐI REQ004</span>
                          <span className="text-xs text-gray-400">4 giờ trước</span>
                      </li>
                  </ul>
                  <button className="mt-4 w-full text-center text-green-600 font-medium hover:text-green-800 transition">Xem tất cả hoạt động</button>
              </div>
          </div>
      </div>
  )
}

export default DashBoard