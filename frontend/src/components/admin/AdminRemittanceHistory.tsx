import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import './AdminRemittanceHistory.css';
import RemittanceHistoryFilter from '../user/RemittanceHistoryFilter';
import AdminTable from './AdminTable';

interface Remittance {
  senderBank: string;
  userName: string;
  senderAccount: string;
  currency: string;
  receiverBank: string;
  receiverAccount: string;
  receiverBankName: string;
  receiverName: string;
  amount: number;
  exchangeRate?: number;
  convertedAmount?: number;
  status: string;
  createdAt: string;
}

interface AdminRemittanceHistoryProps {
  onQuickDateRangeChange?: (range: string) => void;
}

const AdminRemittanceHistory: React.FC<AdminRemittanceHistoryProps> = ({ 
  onQuickDateRangeChange 
}) => {
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    senderName: '',
    receiverName: '',
    recipient: '',
    currency: '',
    status: '',
    startDate: '',
    endDate: '',
    sortOrder: 'latest',
    quickDateRange: '',
    minAmount: '',
    maxAmount: ''
  });

  const fetchRemittances = async () => {
    setLoading(true);
    try {
      const searchParams = {
        userName: filters.senderName,
        receiverName: filters.receiverName,
        currency: filters.currency,
        status: filters.status,
        minAmount: filters.minAmount ? parseFloat(filters.minAmount) : null,
        maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : null,
        startDate: filters.startDate,
        endDate: filters.endDate,
        sortOrder: filters.sortOrder,
        page: (currentPage - 1) * pageSize,
        size: pageSize
      };
      
      const response = await api.getAdminRemittanceHistory(searchParams);
      
      setRemittances(response.list || []);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / pageSize));
    } catch (error) {
      console.error('송금 이력 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemittances();
  }, [currentPage, pageSize, filters]);

  const handleFilterChange = (newFilters: any) => {
    // Map the filter fields to match the expected backend field names
    const mappedFilters = {
      ...newFilters,
      receiverName: newFilters.recipient || '',
      senderName: newFilters.senderName || ''
    };
    setFilters(mappedFilters);
    // 필터 변경 시에는 검색하지 않음
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRemittances();
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleQuickDateRangeChange = (range: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (range) {
      case 'today':
        start = new Date(today);
        end = new Date(today);
        break;
      case '1month':
        start = new Date(today);
        start.setMonth(today.getMonth() - 1);
        end = new Date(today);
        break;
      case '3months':
        start = new Date(today);
        start.setMonth(today.getMonth() - 3);
        end = new Date(today);
        break;
      case '6months':
        start = new Date(today);
        start.setMonth(today.getMonth() - 6);
        end = new Date(today);
        break;
      case '1year':
        start = new Date(today);
        start.setFullYear(today.getFullYear() - 1);
        end = new Date(today);
        break;
      case '3years':
        start = new Date(today);
        start.setFullYear(today.getFullYear() - 3);
        end = new Date(today);
        break;
      case '5years':
        start = new Date(today);
        start.setFullYear(today.getFullYear() - 5);
        end = new Date(today);
        break;
    }

    const newFilters = {
      ...filters,
      startDate: start.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }),
      endDate: end.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }),
      quickDateRange: range
    };
    setFilters(newFilters);
    // 빠른 날짜 범위 변경 시 즉시 검색 실행
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + ' 원';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      'COMPLETED': { text: '성공', className: 'status-success' },
      'PENDING': { text: '대기', className: 'status-pending' },
      'FAILED': { text: '실패', className: 'status-failed' }
    };
    return statusMap[status] || { text: status, className: 'status-default' };
  };



  return (
    <div className="admin-remittance-history">
      {/* 검색 필터 */}
      <div>
        <RemittanceHistoryFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onQuickDateRangeChange={handleQuickDateRangeChange}
          showSenderFilter={true}
        />
      </div>

      {/* 공통 테이블 컴포넌트 사용 */}
      <AdminTable
        data={remittances}
        columns={[
          {
            key: 'userName',
            label: '보내는 사람',
            minWidth: '100px',
            flex: 1
          },
          {
            key: 'senderAccount',
            label: '보내는 계좌',
            minWidth: '70px',
            flex: 1,
            render: (value) => value || '-'
          },
          {
            key: 'receiverName',
            label: '받는 사람',
            minWidth: '100px',
            flex: 1
          },
          {
            key: 'receiverAccount',
            label: '받는 계좌',
            minWidth: '70px',
            flex: 1,
            render: (value) => value || '-'
          },
          {
            key: 'currency',
            label: '수취통화',
            minWidth: '150px',
            flex: 1.5
          },
          {
            key: 'senderBank',
            label: '보내는 은행',
            minWidth: '100px',
            flex: 1,
            render: (value) => value || '-'
          },
          {
            key: 'receiverBankName',
            label: '받는 은행',
            minWidth: '300px',
            flex: 1,
            render: (value) => value || '-'
          },
          {
            key: 'createdAt',
            label: '송금일',
            minWidth: '140px',
            flex: 1.2,
            align: 'center' as const,
            render: (value) => new Date(value).toLocaleString('ko-KR')
          },
          {
            key: 'exchangeRate',
            label: '환율',
            minWidth: '60px',
            flex: 0.8,
            align: 'right' as const,
            render: (value, row) => {
              if (row.exchangeRate) {
                return (
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    {row.exchangeRate.toLocaleString()}원
                  </div>
                );
              }
              return '-';
            }
          },
          {
            key: 'convertedAmount',
            label: '변환 금액',
            minWidth: '150px',
            flex: 1,
            align: 'right' as const,
            render: (value, row) => {
              if (row.convertedAmount && row.currency) {
                const currencyName = row.currency.split(' - ')[1] || row.currency;
                return (
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>
                    {row.convertedAmount.toLocaleString()} {currencyName}
                  </div>
                );
              }
              return '-';
            }
          },
          {
            key: 'amount',
            label: '송금액',
            minWidth: '150px',
            flex: 1,
            align: 'right' as const,
            render: (value) => formatCurrency(value)
          },
          {
            key: 'status',
            label: '상태',
            minWidth: '70px',
            flex: 0.7,
            align: 'center' as const,
            render: (value) => {
              const statusInfo = getStatusBadge(value);
              return (
                <span className={`status-badge ${statusInfo.className}`}>
                  {statusInfo.text}
                </span>
              );
            }
          }
        ]}
        loading={loading}
        emptyMessage="송금 이력이 없습니다"
        emptyIcon="📊"
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showPagination={totalPages > 1}
        showPageSizeSelector={true}
        showSortSelector={true}
        pageSize={pageSize}
        sortOrder={filters.sortOrder}
        onPageSizeChange={handlePageSizeChange}
        onSortOrderChange={(sortOrder) => handleFilterChange({ ...filters, sortOrder })}
        sortOptions={[
          { value: "latest", label: "최신순" },
          { value: "oldest", label: "과거순" },
          { value: "amount_desc", label: "송금액 많은 순" },
          { value: "amount_asc", label: "송금액 적은 순" }
        ]}
      />
    </div>
  );
};

export default AdminRemittanceHistory; 