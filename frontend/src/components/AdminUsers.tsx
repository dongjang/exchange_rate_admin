import React, { useState } from 'react';
import { FaUsers, FaUserShield } from 'react-icons/fa';
import AdminLayout from './AdminLayout';
import AdminUserManagement from './AdminUserManagement';

const AdminUsers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users');

  return (
    <AdminLayout>
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers />
          <span>사용자 관리</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'admins' ? 'active' : ''}`}
          onClick={() => setActiveTab('admins')}
        >
          <FaUserShield />
          <span>관리자 관리</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'users' && (
          <AdminUserManagement />
        )}

        {activeTab === 'admins' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>관리자 관리</h2>
              <p>관리자 계정과 권한을 관리할 수 있습니다.</p>
            </div>
            <div className="panel-content">
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>관리자 관리 기능이 여기에 표시됩니다.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
