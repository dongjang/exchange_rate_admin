import React, { useState, useEffect } from 'react';

interface RemittancePagingProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const RemittancePaging: React.FC<RemittancePagingProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 1.5rem',
      background: '#fff',
      borderRadius: '0 0 18px 18px',
      margin: '0',
      borderTop: '1px solid #e5e7eb',
      width: '100%',
      boxSizing: 'border-box',
      gap: isMobile ? '1rem' : '0'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        justifyContent: isMobile ? 'center' : 'flex-start'
      }}>
        <select
          value={pageSize}
          onChange={e => {
            const newPageSize = Number(e.target.value);
            onPageSizeChange?.(newPageSize);
          }}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}
        >
          {PAGE_SIZE_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}개 보기</option>
          ))}
        </select>
        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
          {totalItems === 0
            ? '0개'
            : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalItems)} / 총 ${totalItems}개`}
        </span>
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        justifyContent: isMobile ? 'center' : 'flex-end'
      }}>
        <button
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: currentPage === 1 ? '#f3f4f6' : '#fff',
            color: currentPage === 1 ? '#9ca3af' : '#374151',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem'
          }}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="첫 페이지"
        >
          &laquo;
        </button>
        <button
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: currentPage === 1 ? '#f3f4f6' : '#fff',
            color: currentPage === 1 ? '#9ca3af' : '#374151',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem'
          }}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="이전 페이지"
        >
          &lt;
        </button>
        <span style={{ fontSize: '0.875rem', color: '#374151', padding: '0 0.5rem' }}>
          {currentPage} / {totalPages}
        </span>
        <button
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: currentPage === totalPages ? '#f3f4f6' : '#fff',
            color: currentPage === totalPages ? '#9ca3af' : '#374151',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem'
          }}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="다음 페이지"
        >
          &gt;
        </button>
        <button
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: currentPage === totalPages ? '#f3f4f6' : '#fff',
            color: currentPage === totalPages ? '#9ca3af' : '#374151',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem'
          }}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="마지막 페이지"
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default RemittancePaging; 