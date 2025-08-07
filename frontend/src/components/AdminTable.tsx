import React from 'react';
import './AdminTable.css';

export interface AdminTableColumn {
  key: string;
  label: string;
  width?: string;
  render?: (value: any, row?: any) => React.ReactNode;
}

interface AdminTableProps {
  data: any[];
  columns: AdminTableColumn[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
  showPageSizeSelector?: boolean;
  showSortSelector?: boolean;
  pageSize?: number;
  sortOrder?: string;
  onPageSizeChange?: (pageSize: number) => void;
  onSortOrderChange?: (sortOrder: string) => void;
  sortOptions?: { value: string; label: string }[];
  pageSizeOptions?: number[];
}

const AdminTable: React.FC<AdminTableProps> = ({
  data,
  columns,
  loading = false,
  emptyMessage = "데이터가 없습니다",
  emptyIcon = "📋",
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPagination = false,
  showPageSizeSelector = false,
  showSortSelector = false,
  pageSize = 10,
  sortOrder = "latest",
  onPageSizeChange,
  onSortOrderChange,
  sortOptions = [
    { value: "latest", label: "최신순" },
    { value: "oldest", label: "과거순" }
  ],
  pageSizeOptions = [10, 20, 50, 100]
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + ' 원';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      'SUCCESS': { text: '성공', className: 'status-success' },
      'PENDING': { text: '대기', className: 'status-pending' },
      'FAILED': { text: '실패', className: 'status-failed' },
      'APPROVED': { text: '승인', className: 'status-approved' },
      'REJECTED': { text: '반려', className: 'status-rejected' }
    };
    return statusMap[status] || { text: status, className: 'status-default' };
  };

  return (
    <div className="admin-table">
      {/* 결과 요약 */}
      {(showPageSizeSelector || showSortSelector || totalCount > 0) && (
        <div className="results-summary">
          <div className="summary-info">
            {totalCount > 0 && (
              <span className="total-count">총 {totalCount}건</span>
            )}
            {showPageSizeSelector && onPageSizeChange && (
              <div className="page-size-selector">
                <label>페이지 크기:</label>
                <select 
                  value={pageSize} 
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="page-size-select"
                >
                  {pageSizeOptions.map(size => (
                    <option key={size} value={size}>{size}개씩</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {showSortSelector && onSortOrderChange && (
            <div className="sort-info">
              <label>정렬:</label>
              <select
                value={sortOrder}
                onChange={(e) => onSortOrderChange(e.target.value)}
                className="sort-select"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* 테이블 리스트 */}
      <div className="table-list-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>데이터를 불러오는 중...</p>
          </div>
        ) : data.length > 0 ? (
          <div className="table-list-container">
            {/* 헤더 */}
            <div className="table-list-header">
              {columns.map((column) => (
                <div 
                  key={column.key} 
                  className="table-header-cell"
                  style={{ width: column.width }}
                >
                  {column.label}
                </div>
              ))}
            </div>
            
            {/* 리스트 */}
            {data.map((row, index) => (
              <div key={index} className="table-list-row">
                {columns.map((column) => (
                  <div 
                    key={column.key} 
                    className="table-cell"
                    style={{ width: column.width }}
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">{emptyIcon}</div>
            <h3>{emptyMessage}</h3>
            <p>검색 조건을 변경해보세요.</p>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {showPagination && onPageChange && totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
          >
            &laquo;
          </button>
          
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            &lsaquo;
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
          
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            &rsaquo;
          </button>
          
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTable; 