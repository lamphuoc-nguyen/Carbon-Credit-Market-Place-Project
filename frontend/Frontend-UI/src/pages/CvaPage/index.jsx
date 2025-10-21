import React, {useState} from 'react'
import backgroundImage from '../../image/bghome.png';
import Sidebar from '../../Components/CvaComponent/SideBar';
import Dashboard from '../../Components/CvaComponent/DashBoard';
import AuditTable from '../../Components/CvaComponent/AuditTable';
import IssueCredit from '../../Components/CvaComponent/IssueCredit';
import Reports from '../../Components/CvaComponent/Report';

const CvaPage = () => {

    const [currentPage, setCurrentPage] = useState('dashboard');

    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard': return <Dashboard />;
            case 'approve_deny': return <AuditTable setCurrentPage={setCurrentPage} />;
            case 'issue_credit': return <IssueCredit />;
            case 'reports': return <Reports />;
            default: return <Dashboard />;
        }
    };

  return (
      <div className="flex h-screen bg-gray-50">
          {/* 1. Sidebar */}
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

          {/* 2. Nội dung chính - Áp dụng background */}
          <div
              className="flex-1 flex flex-col overflow-hidden bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundImage})` }}
          >
              <header className="flex items-center justify-between p-4 bg-white bg-opacity-90 border-b border-gray-200 shadow-md backdrop-blur-sm">
                  <h1 className="text-3xl font-extrabold text-gray-800">
                      Carbon Verification & Audit (CVA)
                  </h1>
                  <div className="flex items-center space-x-4">
                      <span className="text-gray-600 font-medium">CVA - Tổ chức Kiểm toán ABC</span>
                      <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold shadow-lg">
                          KA
                      </div>
                  </div>
              </header>

              <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
                  {renderContent()}
              </main>
          </div>
      </div>
  )
}

export default CvaPage