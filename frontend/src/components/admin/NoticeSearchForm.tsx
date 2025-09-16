import React from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';

interface NoticeSearchRequest {
  title?: string;
  content?: string;
  status?: string;
  priority?: string;
  page: number;
  size: number;
  sortOrder?: string;
}

interface NoticeSearchFormProps {
  searchRequest: NoticeSearchRequest;
  setSearchRequest: (request: NoticeSearchRequest) => void;
  onSearch: () => void;
  onAdd: () => void;
  priorityOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
}

const NoticeSearchForm: React.FC<NoticeSearchFormProps> = ({
  searchRequest,
  setSearchRequest,
  onSearch,
  onAdd,
  priorityOptions,
  statusOptions
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
             <div style={{ width: '280px' }}>
         <input
           type="text"
           placeholder="제목"
           value={searchRequest.title || ''}
           onChange={(e) => setSearchRequest({ ...searchRequest, title: e.target.value,page:0 })}
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
       <div style={{ width: '280px' }}>
         <input
           type="text"
           placeholder="내용"
           value={searchRequest.content || ''}
           onChange={(e) => setSearchRequest({ ...searchRequest, content: e.target.value,page:0 })}
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
           value={searchRequest.status || ''}
           onChange={(e) => setSearchRequest({ ...searchRequest, status: e.target.value })}
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
           {statusOptions.map(option => (
             <option key={option.value} value={option.value}>
               {option.label}
             </option>
           ))}
         </select>
       </div>
       <div style={{ width: '140px' }}>
         <select
           value={searchRequest.priority || ''}
           onChange={(e) => setSearchRequest({ ...searchRequest, priority: e.target.value })}
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
           <option value="">전체 중요도</option>
           {priorityOptions.map(option => (
             <option key={option.value} value={option.value}>
               {option.label}
             </option>
           ))}
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

export default NoticeSearchForm;
