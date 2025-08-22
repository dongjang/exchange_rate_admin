import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { api } from '../services/api';
import RemittanceList from './RemittanceList';
import RemittanceHistoryFilter from './RemittanceHistoryFilter';
import RemittancePaging from './RemittancePaging';
import RemittanceDetailModal from './RemittanceDetailModal';
import { userInfoAtom } from '../store/userStore';
import { authAtom } from '../store/authStore';
import CommonPageHeader from './CommonPageHeader';

interface RemittanceHistory {
  id: number;
  userId: number;
  senderBank: string;
  senderAccount: string;
  receiverBank: string;
  receiverAccount: string;
  receiverName: string;
  receiverCountry: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function RemittanceHistoryPage() {
  const [userInfo] = useAtom(userInfoAtom);
  const [remittances, setRemittances] = useState<RemittanceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    recipient: '',
    minAmount: '',
    maxAmount: '',
    currency: '',
    status: '',
    startDate: '',
    endDate: '',
    quickDateRange: '',
    sortOrder: 'latest' // 기본값: 최신순
  });
  const [selectedRemittance, setSelectedRemittance] = useState<RemittanceHistory | null>(null);

  const fetchRemittances = async () => {
    try {
      setLoading(true);
      
      // 사용자 정보가 없으면 에러 처리
      if (!userInfo?.id) {
        setError('사용자 정보를 가져올 수 없습니다.');
        setRemittances([]);
        return;
      }

      // 백엔드 API 호출 (페이징 포함)
      const response = await api.searchRemittanceHistory({
        userId: userInfo.id,
        recipient: filters.recipient,
        currency: filters.currency,
        status: filters.status,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
        startDate: filters.startDate,
        endDate: filters.endDate,
        sortOrder: filters.sortOrder,
        page: currentPage - 1, // 백엔드는 0부터 시작
        size: pageSize
      });
      
      // 페이징 정보 설정
      setRemittances(response.content);
      setTotalItems(response.totalElements);
      setTotalPages(response.totalPages);
      
      setError(null);
    } catch (err) {
      console.error('송금 이력 조회 실패:', err);
      setError('송금 이력을 불러오는데 실패했습니다.');
      setRemittances([]);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 로드 시 초기 데이터 가져오기 (사용자 정보가 있을 때만)
  useEffect(() => {
    if (userInfo?.id) {
      fetchRemittances();
    }
  }, [userInfo]);

  // 페이징 변경 시 데이터 가져오기
  useEffect(() => {
    if (userInfo?.id) {
      fetchRemittances();
    }
  }, [currentPage, pageSize, userInfo?.id]);

  // 필터 변경 시 자동 검색 (currency, status, sortOrder만 즉시 검색)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userInfo?.id) {
        setCurrentPage(1);
        fetchRemittances();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters.currency, filters.status, filters.sortOrder, userInfo?.id]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // 기간 설정 버튼 전용 핸들러
  const handleQuickDateRangeChange = (range: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (range) {
      case 'today':
        start = today;
        end = today;
        break;
      case '1month':
        start.setMonth(today.getMonth() - 1);
        break;
      case '3months':
        start.setMonth(today.getMonth() - 3);
        break;
      case '6months':
        start.setMonth(today.getMonth() - 6);
        break;
      case '1year':
        start.setFullYear(today.getFullYear() - 1);
        break;
      case '3years':
        start.setFullYear(today.getFullYear() - 3);
        break;
      case '5years':
        start.setFullYear(today.getFullYear() - 5);
        break;
      case 'custom':
        return; // 직접 선택은 그대로 유지
    }

    const newFilters = {
      ...filters,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      quickDateRange: range
    };
    setFilters(newFilters);
    setCurrentPage(1); // 기간 변경 시 첫 페이지로 이동
    
    // 새로운 필터 값으로 즉시 검색 실행
    const searchWithNewFilters = async () => {
      try {
        setLoading(true);
        
        if (!userInfo?.id) {
          setError('사용자 정보를 가져올 수 없습니다.');
          setRemittances([]);
          return;
        }

        const response = await api.searchRemittanceHistory({
          userId: userInfo.id,
          recipient: newFilters.recipient,
          currency: newFilters.currency,
          status: newFilters.status,
          minAmount: newFilters.minAmount,
          maxAmount: newFilters.maxAmount,
          startDate: newFilters.startDate,
          endDate: newFilters.endDate,
          sortOrder: newFilters.sortOrder,
          page: 0, // 첫 페이지
          size: pageSize
        });
        
        setRemittances(response.content);
        setTotalItems(response.totalElements);
        setTotalPages(response.totalPages);
        setError(null);
      } catch (err) {
        console.error('송금 이력 조회 실패:', err);
        setError('송금 이력을 불러오는데 실패했습니다.');
        setRemittances([]);
      } finally {
        setLoading(false);
      }
    };
    
    searchWithNewFilters();
  };



  const handleSearch = () => {
    setCurrentPage(1);
    fetchRemittances();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleRemittanceClick = (remittance: RemittanceHistory) => {
    setSelectedRemittance(remittance);
  };

  // // 사용자 정보가 로드되지 않았을 때
  // if (!userInfo?.id) {
  //   return (
  //     <div style={{ maxWidth: 1200, margin: '1.5rem auto 2.5rem auto', padding: '0 1rem' }}>
  //       <CommonPageHeader
  //         title="📋 송금 이력"
  //         subtitle="송금 내역을 확인하실 수 있습니다"
  //         gradientColors={{ from: '#3b82f6', to: '#60a5fa' }}
  //       />
  //       <div style={{ boxShadow: '0 4px 24px rgba(30,41,59,0.13), 0 1.5px 6px rgba(59,130,246,0.07)', borderRadius: 18, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', border: '1.5px solid #e0e7ef', padding: '0 0 2.2rem 0' }}>
  //         <div style={{ padding: '2.5rem 2.5rem 0 2.5rem' }}>
  //           <div style={{ textAlign: 'center', color: '#64748b', padding: '2.5rem 0', fontSize: '1.1rem' }}>
  //             사용자 정보를 불러오는 중...
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (loading) {
  // return (
  //   <div style={{ maxWidth: 1200, margin: '1.5rem auto 2.5rem auto', padding: '0 1rem' }}>
  //     <CommonPageHeader
  //       title="📋 송금 이력"
  //       subtitle="송금 내역을 확인하실 수 있습니다"
  //       gradientColors={{ from: '#3b82f6', to: '#60a5fa' }}
  //     />
  //     <div style={{ boxShadow: '0 4px 24px rgba(30,41,59,0.13), 0 1.5px 6px rgba(59,130,246,0.07)', borderRadius: 18, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', border: '1.5px solid #e0e7ef', padding: '0 0 2.2rem 0' }}>
  //       <div style={{ padding: '2.5rem 2.5rem 0 2.5rem' }}>
  //         <div style={{ textAlign: 'center', color: '#64748b', padding: '2.5rem 0', fontSize: '1.1rem' }}>
  //           송금 이력을 불러오는 중...
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
  // }

  return (
    <div style={{ maxWidth: 1200, margin: '1.5rem auto 2.5rem auto', padding: '0 1rem' }}>
      <CommonPageHeader
        title="📋 송금 이력"
        subtitle="송금 내역을 확인하실 수 있습니다"
        gradientColors={{ from: '#667eea', to: '#764ba2' }}
      />
      <div style={{ boxShadow: '0 4px 24px rgba(30,41,59,0.13), 0 1.5px 6px rgba(59,130,246,0.07)', borderRadius: 18, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', border: '1.5px solid #e0e7ef', padding: '0 0 0 0', overflow: 'hidden' }}>
        <div style={{ padding: '0', overflow: 'hidden' }}>
          <RemittanceHistoryFilter 
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onQuickDateRangeChange={handleQuickDateRangeChange}
            useSortSelect={true}
          />
          {error ? (
            <div style={{ textAlign: 'center', color: '#ef4444', padding: '2.5rem 0', fontSize: '1.1rem' }}>
              {error}
            </div>
          ) : (
            <div style={{ 
              background: '#fff', 
              borderTop: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <RemittanceList 
                remittances={remittances}
                onRemittanceClick={handleRemittanceClick}
              />
              <RemittancePaging
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      </div>
      <RemittanceDetailModal
        isOpen={!!selectedRemittance}
        onClose={() => setSelectedRemittance(null)}
        remittance={selectedRemittance}
      />
    </div>
  );
}

export default RemittanceHistoryPage; 