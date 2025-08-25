
import React, { useState, useEffect } from 'react';

interface ExchangeRatesPagingProps {
  page: number;
  totalPages: number;
  pageSize: number;
  setPage: (v: number) => void;
  setPageSize: (v: number) => void;
  total: number;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20];

function ExchangeRatesPaging({ page, totalPages, pageSize, setPage, setPageSize, total }: ExchangeRatesPagingProps) {
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
      borderRadius: '0 0 16px 16px',
      margin: '0 0 1rem 0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
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
          onChange={e => setPageSize(Number(e.target.value))}
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
          {total === 0
            ? '0개'
            : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} / 총 ${total}개`}
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
            background: page === 1 ? '#f3f4f6' : '#fff',
            color: page === 1 ? '#9ca3af' : '#374151',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem'
          }}
            onClick={() => setPage(1)}
            disabled={page === 1}
            aria-label="첫 페이지"
          >
            &laquo;
          </button>
          <button
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: page === 1 ? '#f3f4f6' : '#fff',
            color: page === 1 ? '#9ca3af' : '#374151',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem'
          }}
          onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="이전 페이지"
          >
            &lt;
          </button>
        <span style={{ fontSize: '0.875rem', color: '#374151', padding: '0 0.5rem' }}>
          {page} / {totalPages}
        </span>
          <button
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: page === totalPages ? '#f3f4f6' : '#fff',
            color: page === totalPages ? '#9ca3af' : '#374151',
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem'
          }}
          onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            aria-label="다음 페이지"
          >
            &gt;
          </button>
          <button
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: page === totalPages ? '#f3f4f6' : '#fff',
            color: page === totalPages ? '#9ca3af' : '#374151',
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem'
          }}
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            aria-label="마지막 페이지"
          >
            &raquo;
          </button>
      </div>
    </div>
  );
}

export default ExchangeRatesPaging; 