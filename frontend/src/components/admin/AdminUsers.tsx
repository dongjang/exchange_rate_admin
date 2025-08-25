import React, { useState } from 'react';
import { FaUsers, FaUserShield } from 'react-icons/fa';
import AdminLayout from './AdminLayout';
import AdminUserManagement from './AdminUserManagement';
import AdminAdminManagement from './AdminAdminManagement';

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
          <AdminAdminManagement />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
