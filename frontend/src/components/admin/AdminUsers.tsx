import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserShield } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminUserManagement from './AdminUserManagement';
import AdminAdminManagement from './AdminAdminManagement';

const AdminUsers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users');
  const location = useLocation();

  // URL 파라미터에서 tab 확인
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'admin') {
      setActiveTab('admins');
    }
  }, [location.search]);

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
          <AdminAdminManagement />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
