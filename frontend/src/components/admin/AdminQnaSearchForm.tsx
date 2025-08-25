import React from 'react';
import { FaSearch } from 'react-icons/fa';

interface AdminQnaSearchFormProps {
  searchRequest: {
    title?: string;
    content?: string;
    status?: string;
    sortOrder?: string;
    page: number;
    size: number;
  };
  setSearchRequest: (request: any) => void;
  onSearch: () => void;
  statusOptions: { value: string; label: string }[];
}

const AdminQnaSearchForm: React.FC<AdminQnaSearchFormProps> = ({
  searchRequest,
  setSearchRequest,
  onSearch,
  statusOptions
}) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'end',
        flexWrap: 'wrap'
      }}>
        <div style={{ 
          width: '180px',
          minWidth: '150px',
          flex: '0 1 180px'
        }}>
          <input
            type="text"
            value={searchRequest.title || ''}
            onChange={(e) => setSearchRequest({ ...searchRequest, title: e.target.value })}
            placeholder="제목"
            style={{
              width: '100%',
              padding: '14px 18px',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '15px',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease'
            }}
          />
        </div>

        <div style={{ 
          width: '180px',
          minWidth: '150px',
          flex: '0 1 180px'
        }}>
          <input
            type="text"
            value={searchRequest.content || ''}
            onChange={(e) => setSearchRequest({ ...searchRequest, content: e.target.value })}
            placeholder="내용"
            style={{
              width: '100%',
              padding: '14px 18px',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '15px',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease'
            }}
          />
        </div>

        <div style={{ 
          width: '150px',
          minWidth: '120px',
          flex: '0 1 150px'
        }}>
          <select
            value={searchRequest.status || ''}
            onChange={(e) => setSearchRequest({ ...searchRequest, status: e.target.value })}
            style={{
              width: '100%',
              padding: '14px 18px',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '15px',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease',
              background: 'white'
            }}
          >
            <option value="">전체 상태</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{
          flex: '0 0 auto'
        }}>
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
        </div>
      </div>
    </div>
  );
};

export default AdminQnaSearchForm;
