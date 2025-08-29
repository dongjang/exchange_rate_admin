import React, { useState, useEffect } from 'react';
import { FaHistory, FaCog } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import AdminRemittanceHistory from './AdminRemittanceHistory';
import AdminRemittanceLimits from './AdminRemittanceLimits';
import AdminLayout from './AdminLayout';
import './AdminRemittanceManagement.css';

interface AdminRemittanceManagementProps {
  admin?: any;
}

const AdminRemittanceManagement: React.FC<AdminRemittanceManagementProps> = ({ 
  admin 
}) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'history' | 'limits'>('history');

  // URL state에서 activeTab을 확인하여 탭 설정
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <AdminLayout admin={admin}>
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FaHistory />
          <span>송금 이력 조회</span>
        </button>
                 <button 
           className={`tab-button ${activeTab === 'limits' ? 'active' : ''}`}
           onClick={() => setActiveTab('limits')}
         >
           <FaCog />
           <span>송금 한도 관리</span>
         </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'history' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>송금 이력 조회</h2>
              <p>전체 송금 내역을 조회할 수 있습니다.</p>
            </div>
            <div className="panel-content">
              <AdminRemittanceHistory />
            </div>
          </div>
        )}

                         {activeTab === 'limits' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>송금 한도 관리</h2>
              <p>사용자별 송금 한도를 설정하고 관리할 수 있습니다.</p>
            </div>
            <div className="panel-content">
              <AdminRemittanceLimits />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRemittanceManagement; 