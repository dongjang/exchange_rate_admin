import React, { useEffect, useRef } from 'react';
import './AdminTable.css';

export interface AdminTableColumn {
  key: string;
  label: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  flex?: number;
  align?: 'left' | 'center' | 'right';
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
  tableLayout?: 'auto' | 'fixed' | 'responsive';
  enableHorizontalScroll?: boolean;
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
  pageSizeOptions = [10, 20, 50, 100],
  tableLayout = 'responsive',
  enableHorizontalScroll = true
}) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // 스크롤 이벤트 처리 함수
  const handleScroll = () => {
    const container = tableContainerRef.current;
    if (!container) return;

    const header = container.querySelector('.table-list-header') as HTMLElement;
    const headerCells = container.querySelectorAll('.table-header-cell') as NodeListOf<HTMLElement>;
    const dataCells = container.querySelectorAll('.table-cell') as NodeListOf<HTMLElement>;

    // 화면 크기 확인
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;

    // 헤더 스타일 강제 적용
    if (header) {
      header.style.setProperty('background', '#f9fafb', 'important');
      
      // 반응형에 따라 다른 border-bottom 적용
      if (isSmallMobile || isMobile) {
        header.style.setProperty('border-bottom', '1px solid #e5e7eb', 'important');
      } else {
        header.style.setProperty('border-bottom', '2px solid #e5e7eb', 'important');
      }
      
      // 더 강력한 방법으로 border-bottom 강제 적용
      header.style.borderBottom = isSmallMobile || isMobile ? '1px solid #e5e7eb' : '2px solid #e5e7eb';
      header.style.background = '#f9fafb';
    }

    // 헤더 셀 스타일 강제 적용
    headerCells.forEach((cell, index) => {
      cell.style.setProperty('background', '#f9fafb', 'important');
      cell.style.setProperty('border-right', '1px solid #e5e7eb', 'important');
      
      // 더 강력한 방법으로 스타일 적용
      cell.style.background = '#f9fafb';
      
      // 마지막 컬럼의 border-right 제거
      if (index === headerCells.length - 1) {
        cell.style.setProperty('border-right', 'none', 'important');
        cell.style.borderRight = 'none';
      } else {
        cell.style.borderRight = '1px solid #e5e7eb';
      }
    });

    // 데이터 셀의 마지막 컬럼 border-right 제거
    dataCells.forEach((cell, index) => {
      const cellIndex = index % columns.length;
      if (cellIndex === columns.length - 1) {
        cell.style.setProperty('border-right', 'none', 'important');
        cell.style.borderRight = 'none';
      } else {
        cell.style.setProperty('border-right', '1px solid #f3f4f6', 'important');
        cell.style.borderRight = '1px solid #f3f4f6';
      }
    });
  };

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    // 초기 스타일 적용
    handleScroll();

    // 스크롤 이벤트 리스너 추가
    container.addEventListener('scroll', handleScroll);
    
    // 리사이즈 이벤트도 처리
    window.addEventListener('resize', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [data, columns]);

  // 컬럼 너비를 고정값으로 설정하는 함수
  const getColumnWidth = (column: AdminTableColumn) => {
    // 컬럼별 고정 너비 설정 (더 큰 너비로 조정)
    switch (column.key) {
      case 'title':
      case 'content':
        return '300px';  // 제목은 더 넓게
      case 'status':
      case 'priority':
        return '120px';  // 상태는 조금 더 넓게
      case 'views':
      case 'id':
        return '100px';  // ID는 조금 더 넓게
      case 'createdAt':
      case 'updatedAt':
      case 'modalDisplayPeriod':
      case 'answeredAt':
        return '180px';  // 날짜는 더 넓게
      case 'username':
      case 'userName':
        return '150px';  // 사용자명은 더 넓게
      case 'attachedFile':
      case 'attachment':
      case 'fileName':
        return '120px';  // 첨부파일은 더 넓게
      case 'modalDisplayDate':
        return '350px';  // 모달 표시 기간은 더 넓게
      default:
        return '200px'; // 기본 너비를 더 크게
    }
  };
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
        <div className="results-summary">
          <div className="summary-info">
              <span className="total-count">총 {totalCount}건</span>
            {data && data.length > 0 && onPageSizeChange && (
              <div className="page-size-selector">
                <label>페이지</label>
                <select 
                  value={pageSize} 
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="page-size-select"
                >
                  {pageSizeOptions.map(size => (
                    <option key={size} value={size}>{size}개 보기</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {data && data.length > 0 && showSortSelector && onSortOrderChange && (
            <div className="sort-info">
              <label>정렬</label>
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

      {/* 테이블 리스트 */}
      <div className="table-list-container" ref={tableContainerRef}>
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>데이터를 불러오는 중...</p>
          </div>
        ) : data && data.length > 0 ? (
          <>
            {/* 헤더 */}
            <div className="table-list-header">
              {columns.map((column) => (
                <div 
                  key={column.key} 
                  className="table-header-cell"
                  style={{ 
                    width: column.width || getColumnWidth(column),
                    minWidth: column.minWidth || getColumnWidth(column),
                    maxWidth: column.maxWidth || getColumnWidth(column),
                    flex: 'none', // 모든 컬럼이 고정 너비 유지
                    textAlign: column.align || 'left'
                  }}
                >
                  {column.label}
                </div>
              ))}
            </div>
            
            {/* 리스트 */}
            {data.map((row, rowIndex) => (
              <div key={rowIndex} className="table-list-row">
                {columns.map((column, colIndex) => (
                  <div 
                    key={column.key} 
                    className="table-cell"
                    style={{ 
                      width: column.width || getColumnWidth(column),
                      minWidth: column.minWidth || getColumnWidth(column),
                      maxWidth: column.maxWidth || getColumnWidth(column),
                      flex: 'none', // 모든 컬럼이 고정 너비 유지
                      textAlign: column.align || 'left',
                      justifyContent: column.align === 'center' ? 'center' : 
                                   column.align === 'right' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </div>
                ))}
              </div>
            ))}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">{emptyIcon}</div>
            <h3>{emptyMessage}</h3>
            <p>검색 조건을 변경해보세요.</p>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {data && data.length > 0 && onPageChange && (
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
          
          {(() => {
            const maxVisiblePages = 10;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            // 시작 페이지 조정
            if (endPage - startPage + 1 < maxVisiblePages) {
              startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            const pages = [];
            
            // 첫 페이지
            if (startPage > 1) {
              pages.push(
                <button
                  key={1}
                  className="page-btn"
                  onClick={() => onPageChange(1)}
                >
                  1
                </button>
              );
              if (startPage > 2) {
                pages.push(
                  <span key="ellipsis1" className="page-ellipsis">...</span>
                );
              }
            }
            
            // 중간 페이지들
            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  className={`page-btn ${currentPage === i ? 'active' : ''}`}
                  onClick={() => onPageChange(i)}
                >
                  {i}
                </button>
              );
            }
            
            // 마지막 페이지
            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(
                  <span key="ellipsis2" className="page-ellipsis">...</span>
                );
              }
              pages.push(
                <button
                  key={totalPages}
                  className="page-btn"
                  onClick={() => onPageChange(totalPages)}
                >
                  {totalPages}
                </button>
              );
            }
            
            return pages;
          })()}
          
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