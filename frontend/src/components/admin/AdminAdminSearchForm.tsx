import React from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';

interface AdminSearchRequest {
  name?: string;
  adminId?: string;
  email?: string;
  role?: string;
  status?: string;
  sortOrder?: string;
  page: number;
  size: number;
}

interface AdminAdminSearchFormProps {
  searchRequest: AdminSearchRequest;
  setSearchRequest: React.Dispatch<React.SetStateAction<AdminSearchRequest>>;
  onSearch: () => void;
  onAdd: () => void;
}

const AdminAdminSearchForm: React.FC<AdminAdminSearchFormProps> = ({
  searchRequest,
  setSearchRequest,
  onSearch,
  onAdd
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

    return (
    <div style={{ 
      background: '#f8fafc',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ width: '200px' }}>
          <input
            type="text"
            placeholder="관리자명"
            value={searchRequest.name || ''}
            onChange={(e) => setSearchRequest({ ...searchRequest, name: e.target.value, page: 0 })}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ width: '200px' }}>
          <input
            type="text"
            placeholder="아이디"
            value={searchRequest.adminId || ''}
            onChange={(e) => setSearchRequest({ ...searchRequest, adminId: e.target.value, page: 0 })}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ width: '250px' }}>
          <input
            type="text"
            placeholder="이메일"
            value={searchRequest.email || ''}
            onChange={(e) => setSearchRequest({ ...searchRequest, email: e.target.value, page: 0 })}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ width: '140px' }}>
          <select
            value={searchRequest.role || ''}
            onChange={(e) => setSearchRequest({ ...searchRequest, role: e.target.value, page: 0 })}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="">전체 권한</option>
            <option value="SUPER_ADMIN">최고 관리자</option>
            <option value="ADMIN">관리자</option>
          </select>
        </div>
        <div style={{ width: '140px' }}>
          <select
            value={searchRequest.status || ''}
            onChange={(e) => setSearchRequest({ ...searchRequest, status: e.target.value, page: 0 })}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="">전체 상태</option>
            <option value="ACTIVE">활성</option>
            <option value="INACTIVE">비활성</option>
          </select>
        </div>
        <button
          onClick={onSearch}
          style={{
            padding: '14px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaSearch />
          검색
        </button>
        <button
          onClick={onAdd}
          style={{
            padding: '14px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: 'auto'
          }}
        >
          <FaPlus />
          등록
        </button>
      </div>
    </div>
  );
};

export default AdminAdminSearchForm;
