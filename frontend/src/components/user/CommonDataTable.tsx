import React, { useState, useEffect } from 'react';

interface Column {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: any) => React.ReactNode;
}

interface CommonDataTableProps {
  columns: Column[];
  data: any[];
  emptyMessage: string;
  onRowClick?: (item: any) => void;
  isLoading?: boolean;
}

const CommonDataTable: React.FC<CommonDataTableProps> = ({
  columns,
  data,
  emptyMessage,
  onRowClick,
  isLoading = false
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getColumnStyle = (column: Column) => ({
    textAlign: column.align || 'left' as const,
    width: column.width || 'auto'
  });

  return (
    <div style={{
      background: 'white',
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '16px' : '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: isMobile ? '16px' : '24px'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: columns.map(col => col.width || '1fr').join(' '),
        gap: isMobile ? '12px' : '16px',
        padding: isMobile ? '12px 0' : '16px 0',
        borderBottom: '2px solid #e2e8f0',
        fontWeight: '600',
        color: '#374151',
        fontSize: isMobile ? '12px' : '14px'
      }}>
        {columns.map((column) => (
          <div key={column.key} style={getColumnStyle(column)}>
            {column.label}
          </div>
        ))}
      </div>

      {/* 데이터 행 */}
      {isLoading ? (
        <div style={{
          textAlign: 'center',
          padding: isMobile ? '40px 16px' : '60px 20px',
          color: '#6b7280',
          fontSize: isMobile ? '14px' : '16px'
        }}>
          로딩 중...
        </div>
      ) : data.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: isMobile ? '40px 16px' : '60px 20px',
          color: '#6b7280',
          fontSize: isMobile ? '14px' : '16px'
        }}>
          {emptyMessage}
        </div>
      ) : (
        data.map((item, index) => (
          <div
            key={item.id || index}
            style={{
              display: 'grid',
              gridTemplateColumns: columns.map(col => col.width || '1fr').join(' '),
              gap: isMobile ? '12px' : '16px',
              padding: isMobile ? '12px 0' : '16px 0',
              borderBottom: '1px solid #f1f5f9',
              alignItems: 'center',
              cursor: onRowClick ? 'pointer' : 'default',
              transition: 'background-color 0.2s ease',
              fontSize: isMobile ? '12px' : '14px'
            }}
            onMouseEnter={(e) => {
              if (onRowClick) {
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }
            }}
            onMouseLeave={(e) => {
              if (onRowClick) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            onClick={() => onRowClick && onRowClick(item)}
          >
            {columns.map((column) => (
              <div key={column.key} style={getColumnStyle(column)}>
                {column.render ? column.render(item) : item[column.key]}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default CommonDataTable;
