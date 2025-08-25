import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaCheck, FaDownload, FaEye, FaSearch, FaCog as FaSettings, FaTimes, FaUsers } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { api } from '../../services/api';
import { defaultRemittanceLimitAtom, defaultRemittanceLimitLoadingAtom } from '../../store/defaultRemittanceLimitStore';
import { userInfoAtom } from '../../store/userStore';
import DefaultRemittanceLimitModal from './DefaultRemittanceLimitModal';
import SimpleFileViewer from './SimpleFileViewer';
import CommentModal from './CommentModal';
import AdminTable  from './AdminTable';
import './AdminTable.css';

interface RemittanceLimitRequest {
  id: number;
  userId: number;
  userName: string;
  dailyLimit: number;
  monthlyLimit: number;
  singleLimit: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  incomeFileId?: number;
  bankbookFileId?: number;
  businessFileId?: number;
  incomeFileName?: string;
  incomeFileSize?: number;
  incomeFileType?: string;
  bankbookFileName?: string;
  bankbookFileSize?: number;
  bankbookFileType?: string;
  businessFileName?: string;
  businessFileSize?: number;
  businessFileType?: string;
}

const AdminRemittanceLimits: React.FC = () => {
  const location = useLocation();
  const [requests, setRequests] = useState<RemittanceLimitRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortOrder, setSortOrder] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{
    income?: { id: number; originalName: string; fileSize: number; fileType: string };
    bankbook?: { id: number; originalName: string; fileSize: number; fileType: string };
    business?: { id: number; originalName: string; fileSize: number; fileType: string };
  }>({});

  const [defaultLimit, setDefaultLimit] = useAtom(defaultRemittanceLimitAtom);
  const [defaultLimitLoading] = useAtom(defaultRemittanceLimitLoadingAtom);
  const [userInfo] = useAtom(userInfoAtom);
  const [isDefaultLimitModalOpen, setIsDefaultLimitModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [pendingRejectRequestId, setPendingRejectRequestId] = useState<number | null>(null);
  const [pendingRejectRequestData, setPendingRejectRequestData] = useState<{
    userId?: number;
    dailyLimit?: number;
    monthlyLimit?: number;
    singleLimit?: number;
  } | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);

  // URL state에서 activeTab이 'limits'인 경우 대기중 상태로 자동 설정
  useEffect(() => {
    if (location.state?.activeTab === 'limits') {
      setStatusFilter('PENDING');
    }
  }, [location.state]);

  useEffect(() => {
    loadRequests();
  }, [currentPage, pageSize, sortOrder, searchTerm, statusFilter]);

  useEffect(() => {
    loadDefaultLimit();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    loadRequests();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await api.getAdminRemittanceLimitRequests({
        page: currentPage - 1,
        size: pageSize,
        searchTerm: searchTerm,
        status: statusFilter || undefined,
        sortOrder: sortOrder
      });
      setRequests(response.list);
      setTotalPages(Math.ceil(response.count / pageSize));
      setTotalCount(response.count);
    } catch (error) {
      console.error('송금 한도 요청 목록을 불러오는데 실패했습니다:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '송금 한도 요청 목록을 불러오는데 실패했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultLimit = async () => {
    try {
      const response = await api.getDefaultRemittanceLimit();
      setDefaultLimit(response);
    } catch (error) {
      console.error('기본 송금 한도를 불러오는데 실패했습니다:', error);
    }
  };

  const handleRequestAction = async (action: 'approve' | 'reject',requestId: number,userId?: number, dailyLimit?: number, monthlyLimit?: number, singleLimit?: number) => {

    if (action === 'reject') {
      // 반려의 경우 코멘트 모달 열기
      setPendingRejectRequestId(requestId);
      setPendingRejectRequestData({
        userId,
        dailyLimit,
        monthlyLimit,
        singleLimit
      });
      setIsCommentModalOpen(true);
      return;
    }

    // 승인의 경우 기존 로직 실행
    const result = await Swal.fire({
      title: '승인 확인',
      text: '이 송금 한도 요청을 승인하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '승인',
      cancelButtonText: '취소'
    });

    if (!result.isConfirmed) {
      return;
    }

    await processRequest(requestId, 'APPROVED', '승인되었습니다.', userId, dailyLimit, monthlyLimit, singleLimit);
  };

  const handleRejectWithComment = async (comment: string) => {
    if (!pendingRejectRequestId || !pendingRejectRequestData) return;
    
    // 디버깅을 위한 로그 추가
    console.log('handleRejectWithComment called:', {
      pendingRejectRequestId,
      pendingRejectRequestData,
      comment
    });
    
    // 반려 시에도 한도 정보와 함께 처리
    await processRequest(
      pendingRejectRequestId, 
      'REJECTED', 
      comment, 
      pendingRejectRequestData.userId,
      pendingRejectRequestData.dailyLimit,
      pendingRejectRequestData.monthlyLimit,
      pendingRejectRequestData.singleLimit
    );
    setIsCommentModalOpen(false);
    setPendingRejectRequestId(null);
    setPendingRejectRequestData(null);
  };

  const processRequest = async (requestId: number, status: 'APPROVED' | 'REJECTED', adminComment: string, userId?: number, dailyLimit?: number, monthlyLimit?: number, singleLimit?: number) => {
    setProcessingRequestId(requestId);
    try {
      
      // 사용자 정보 확인
      if (!userInfo || !userInfo.id) {
        Swal.fire({
          icon: 'error',
          title: '오류',
          text: '로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.'
        });
        return;
      }
      
      // 요청 데이터 구성
      const requestData: any = {
        status,
        adminId: userInfo.id,
        userId: userId,
        dailyLimit: dailyLimit,
        monthlyLimit: monthlyLimit,
        singleLimit: singleLimit,
        adminComment
      };
                  
      const response = await api.processRemittanceLimitRequest(requestId, requestData);

      Swal.fire({
        icon: 'success',
        title: '완료',
        text: status === 'APPROVED' ? '송금 한도 요청이 승인되었습니다.' : '송금 한도 요청이 반려되었습니다.'
      });

      // 목록 새로고침
      await loadRequests();
    } catch (error) {
      console.error('요청 처리에 실패했습니다:', error);
      
      // 더 자세한 에러 메시지 표시
      let errorMessage = '요청 처리에 실패했습니다.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      Swal.fire({
        icon: 'error',
        title: '오류',
        text: errorMessage
      });
    } finally {
      setProcessingRequestId(null);
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { text: '대기중', class: 'status-pending' },
      APPROVED: { text: '승인', class: 'status-approved' },
      REJECTED: { text: '반려', class: 'status-rejected' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { text: status, class: 'status-default' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getStatusBadgeClass = (status: string) => {
    const statusConfig = {
      PENDING: 'status-pending',
      APPROVED: 'status-approved',
      REJECTED: 'status-rejected'
    };
    return statusConfig[status as keyof typeof statusConfig] || 'status-default';
  };

  const getStatusText = (status: string) => {
    const statusConfig = {
      PENDING: '대기중',
      APPROVED: '승인',
      REJECTED: '반려'
    };
    return statusConfig[status as keyof typeof statusConfig] || status;
  };

  const handleModalSuccess = () => {
    setIsDefaultLimitModalOpen(false);
    loadDefaultLimit();
  };

  const handleViewFiles = (request: RemittanceLimitRequest) => {
    const files: {
      income?: { id: number; originalName: string; fileSize: number; fileType: string };
      bankbook?: { id: number; originalName: string; fileSize: number; fileType: string };
      business?: { id: number; originalName: string; fileSize: number; fileType: string };
    } = {};

    if (request.incomeFileId && request.incomeFileName && request.incomeFileSize && request.incomeFileType) {
      files.income = {
        id: request.incomeFileId,
        originalName: request.incomeFileName,
        fileSize: request.incomeFileSize,
        fileType: request.incomeFileType
      };
    }

    if (request.bankbookFileId && request.bankbookFileName && request.bankbookFileSize && request.bankbookFileType) {
      files.bankbook = {
        id: request.bankbookFileId,
        originalName: request.bankbookFileName,
        fileSize: request.bankbookFileSize,
        fileType: request.bankbookFileType
      };
    }

    if (request.businessFileId && request.businessFileName && request.businessFileSize && request.businessFileType) {
      files.business = {
        id: request.businessFileId,
        originalName: request.businessFileName,
        fileSize: request.businessFileSize,
        fileType: request.businessFileType
      };
    }

    setSelectedFiles(files);
    setIsFileViewerOpen(true);
  };

  return (
    <div className="admin-remittance-limits">
      {/* 전체 페이지 로딩 오버레이 */}
      {processingRequestId && (
        <div className="loading-overlay">
          <div className="loading-modal">
            {/* 로딩 스피너 */}
            <div className="loading-spinner-large" />
            
            {/* 로딩 텍스트 */}
            <div className="loading-text">
              요청을 처리하고 있습니다...
            </div>
            
            {/* 진행 상태 텍스트 */}
            <div className="loading-subtext">
              잠시만 기다려주세요.
            </div>
          </div>
        </div>
      )}
      
      {/* 통합 헤더 섹션 */}
      <div className="unified-header">
        <div className="header-left">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="">전체 상태</option>
            <option value="PENDING">대기중</option>
            <option value="APPROVED">승인</option>
            <option value="REJECTED">반려</option>
          </select>
          <div className="search-input">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="사용자명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <button onClick={handleSearch} className="search-btn">
            검색
          </button>
        </div>
        
        <div className="header-center">
          {defaultLimit && (
            <div className="limit-display">
              <div className="limit-item">
                <span className="limit-label">일일한도</span>
                <span className="limit-value">{formatCurrency(defaultLimit.dailyLimit)}원</span>
              </div>
              <div className="limit-item">
                <span className="limit-label">월한도</span>
                <span className="limit-value">{formatCurrency(defaultLimit.monthlyLimit)}원</span>
              </div>
              <div className="limit-item">
                <span className="limit-label">1회한도</span>
                <span className="limit-value">{formatCurrency(defaultLimit.singleLimit)}원</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="header-right">
          <button
            onClick={() => setIsDefaultLimitModalOpen(true)}
            className="btn btn-primary"
            disabled={defaultLimitLoading}
          >
            <FaSettings /> 기본 한도 설정
          </button>
        </div>
      </div>

      <AdminTable
        data={requests}
        columns={[
          {
            key: 'userName',
            label: '사용자명',
            width: '120px'
          },
          {
            key: 'dailyLimit',
            label: '일일 한도',
            width: '120px',
            render: (value) => formatCurrency(value) + '원'
          },
          {
            key: 'monthlyLimit',
            label: '월 한도',
            width: '120px',
            render: (value) => formatCurrency(value) + '원'
          },
          {
            key: 'singleLimit',
            label: '1회 한도',
            width: '120px',
            render: (value) => formatCurrency(value) + '원'
          },
          {
            key: 'reason',
            label: '신청 사유',
            width: '250px',
            render: (value) => <div className="reason-cell">{value}</div>
          },
          {
            key: 'status',
            label: '상태',
            width: '100px',
            render: (value) => (
              <span className={`status-badge ${getStatusBadgeClass(value)}`}>
                {getStatusText(value)}
              </span>
            )
          },
          {
            key: 'createdAt',
            label: '신청일',
            width: '170px',
            render: (value) => new Date(value).toLocaleString('ko-KR')
          },
          {
            key: 'files',
            label: '첨부파일',
            width: '100px',
            render: (_, row) => (
              (row.incomeFileId || row.bankbookFileId || row.businessFileId) ? (
                <button
                  onClick={() => handleViewFiles(row)}
                  className="btn btn-secondary btn-sm"
                >
                  <FaEye /> 보기
                </button>
              ) : '-'
            )
          },
          {
            key: 'actions',
            label: '작업',
            width: '80px',
            render: (_, row) => (
              row.status === 'PENDING' ? (
                <div className="action-buttons">
                  <button
                    onClick={() => handleRequestAction('approve',row.id, row.userId, row.dailyLimit,row.monthlyLimit, row.singleLimit)}
                    className="btn btn-success btn-sm"
                    disabled={processingRequestId === row.id}
                  >
                    <FaCheck /> 승인
                  </button>
                                     <button
                     onClick={() => handleRequestAction('reject',row.id, row.userId, row.dailyLimit, row.monthlyLimit, row.singleLimit)}
                     className="btn btn-danger btn-sm"
                     disabled={processingRequestId === row.id}
                   >
                     <FaTimes /> 반려
                   </button>
                </div>
              ) : '-'
            )
          }
        ]}
        loading={loading}
        emptyMessage="송금 한도 요청이 없습니다"
        emptyIcon="📋"
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showPagination={totalPages > 1}
        showPageSizeSelector={true}
        showSortSelector={true}
        pageSize={pageSize}
        sortOrder={sortOrder}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setCurrentPage(1); // 페이지 크기 변경 시 첫 페이지로 이동
        }}
        onSortOrderChange={(sortOrder) => {
          setSortOrder(sortOrder);
          setCurrentPage(1); // 정렬 순서 변경 시 첫 페이지로 이동
        }}
        sortOptions={[
          { value: "latest", label: "최신순" },
          { value: "oldest", label: "과거순" },
        ]}
      />

      <DefaultRemittanceLimitModal
        isOpen={isDefaultLimitModalOpen}
        onClose={() => setIsDefaultLimitModalOpen(false)}
        onSuccess={handleModalSuccess}
        defaultLimit={defaultLimit}
      />

      <SimpleFileViewer
        isOpen={isFileViewerOpen}
        onClose={() => setIsFileViewerOpen(false)}
        files={selectedFiles}
      />

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false);
          setPendingRejectRequestId(null);
          setPendingRejectRequestData(null);
        }}
        onSubmit={handleRejectWithComment}
        title="반려 사유 입력"
        placeholder="반려 사유를 입력해주세요..."
      />
    </div>
  );
};

export default AdminRemittanceLimits; 