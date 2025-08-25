import React from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';

interface AdminCountrySearchFormProps {
  searchRequest: {
    select?: string;
    countryName?: string;
    codeName?: string;
    code?: string;
    sortOrder?: string;
    page: number;
    size: number;
  };
  setSearchRequest: (request: any) => void;
  onSearch: () => void;
  onAddClick: () => void;
}

const AdminCountrySearchForm: React.FC<AdminCountrySearchFormProps> = ({
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
        {/* 국가 선택 */}
        <div style={{ width: '140px' }}>
          <select
            value={searchRequest.select || 'all'}
            onChange={(e) => setSearchRequest({ ...searchRequest, select: e.target.value })}
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
            <option value="all">전체 국가</option>
            <option value="remittance">송금 가능 국가</option>
          </select>
        </div>

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

        {/* 통화명 */}
        <div style={{ width: '180px' }}>
          <input
            type="text"
            value={searchRequest.codeName || ''}
            onChange={(e) => setSearchRequest({ ...searchRequest, codeName: e.target.value })}
            placeholder="통화명"
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

        {/* 통화 */}
        <div style={{ width: '150px' }}>
          <input
            type="text"
            value={searchRequest.code || ''}
            onChange={(e) => setSearchRequest({ ...searchRequest, code: e.target.value })}
            placeholder="통화"
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
      
      {/* 안내 문구 */}
      {searchRequest.select === 'remittance' && (
        <div style={{
          marginTop: '12px',
          padding: '12px 16px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#1e40af',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '14px' }}>💡</span>
          <span>
            <strong>송금 가능 국가</strong>는 은행 관리 탭에서 은행이 등록된 국가만 표시됩니다.
          </span>
        </div>
      )}
    </div>
  );
};

export default AdminCountrySearchForm;
