import React from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';

interface AdminBankSearchFormProps {
  searchRequest: {
    countryName?: string;
    bankName?: string;
    sortOrder?: string;
    page: number;
    size: number;
  };
  setSearchRequest: (request: any) => void;
  onSearch: () => void;
  onAddClick: () => void;
}

const AdminBankSearchForm: React.FC<AdminBankSearchFormProps> = ({
  searchRequest,
  setSearchRequest,
  onSearch,
  onAddClick
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
        {/* 국가명 */}
        <div style={{ width: '180px' }}>
          <input
            type="text"
            value={searchRequest.countryName || ''}
            onChange={(e) => setSearchRequest({ ...searchRequest, countryName: e.target.value })}
            placeholder="국가명"
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

        {/* 은행명 */}
        <div style={{ width: '200px' }}>
          <input
            type="text"
            value={searchRequest.bankName || ''}
            onChange={(e) => setSearchRequest({ ...searchRequest, bankName: e.target.value })}
            placeholder="은행명"
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

        {/* 검색 버튼 */}
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

        {/* 등록 버튼 */}
        <button
          onClick={onAddClick}
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

export default AdminBankSearchForm;
