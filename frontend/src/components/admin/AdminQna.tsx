import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import AdminLayout from './AdminLayout';
import AdminQnaSearchForm from './AdminQnaSearchForm';
import AdminQnaModal from './AdminQnaModal';
import AdminTable from './AdminTable';

interface Qna {
  id: number;
  title: string;
  content: string;
  status: string;
  fileId?: number;
  fileName?: string;
  createdAt: string;
  answeredAt?: string;
  answerContent?: string;
  answerUserName?: string;
  userName?: string;
}

interface QnaSearchRequest {
  title?: string;
  content?: string;
  status?: string;
  sortOrder?: string;
  page: number;
  size: number;
}

const AdminQna: React.FC = () => {
  const location = useLocation();
  const [qnaList, setQnaList] = useState<Qna[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchRequest, setSearchRequest] = useState<QnaSearchRequest>({
    page: 0,
    size: 10,
    sortOrder: 'latest'
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQna, setSelectedQna] = useState<Qna | null>(null);

  // URL state에서 대기중 상태로 자동 설정
  useEffect(() => {
    if (location.state?.fromDashboard) {
      setSearchRequest(prev => ({ ...prev, status: 'PENDING' }));
    }
  }, [location.state]);

  const statusOptions = [
    { value: 'PENDING', label: '대기중' },
    { value: 'ANSWERED', label: '답변완료' },
    { value: 'CANCELED', label: '취소됨' }
  ];

  const fetchQnaList = async () => {
    try {
      const response = await api.searchAdminQna(searchRequest);
      
      if (response && response.content) {
        setQnaList(response.content);
        setTotalCount(response.totalElements);
      } else {
        setQnaList([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Q&A 조회 실패:', error);
      setQnaList([]);
      setTotalCount(0);
    }
  };

  useEffect(() => {
    fetchQnaList();
  }, [searchRequest]);

  // 검색 조건이 변경될 때만 검색 실행 (페이지 변경 제외)
  useEffect(() => {
    setSearchRequest(prev => ({ ...prev, page: 0 }));
    setCurrentPage(1);
  }, [searchRequest.title, searchRequest.content, searchRequest.status, searchRequest.sortOrder]);

  const handleSearch = () => {
    setSearchRequest(prev => ({ ...prev, page: 0 }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchRequest(prev => ({ ...prev, page: (page - 1) * prev.size }));
  };

  const handleQnaClick = async (qna: Qna) => {
    try {
      // 개별 API 호출로 최신 데이터 가져오기
      const qnaDetail = await api.getAdminQnaById(qna.id);
      setSelectedQna(qnaDetail);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Q&A 상세 정보 조회 실패:', error);
      // 에러 발생 시 기존 데이터로 모달 열기
      setSelectedQna(qna);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQna(null);
  };

  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'ANSWERED':
        return '#10b981';
      case 'CANCELED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getFileLabel = (fileName?: string) => {
    if (fileName) {
      return (
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '600',
          backgroundColor: '#10b981',
          color: 'white',
          display: 'inline-block'
        }}>
          첨부파일
        </span>
      );
    } else {
      return (
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '600',
          backgroundColor: '#e5e7eb',
          color: '#6b7280',
          display: 'inline-block'
        }}>
          없음
        </span>
      );
    }
  };

  const columns = [
    {
      key: 'title',
      label: '제목',
      render: (value: any, qna: Qna) => {
        if (!qna || !qna.title) return '-';
        return (
          <div
            style={{
              textDecoration: 'underline', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              color: '#007bff'
            }}
            onClick={() => handleQnaClick(qna)}
          >
            {qna.title}
          </div>
        );
      }
    },
    {
      key: 'userName',
      label: '사용자명',
      render: (value: any, qna: Qna) => {
        if (!qna) return '-';
        return qna.userName || '알 수 없음';
      },
      align: 'center' as const
    },
    {
      key: 'status',
      label: '상태',
      render: (value: any, qna: Qna) => {
        if (!qna || !qna.status) return '-';
        return (
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            backgroundColor: getStatusColor(qna.status) + '20',
            color: getStatusColor(qna.status)
          }}>
            {getStatusLabel(qna.status)}
          </span>
        );
      },
      align: 'center' as const
    },
    {
      key: 'fileName',
      label: '첨부파일',
      render: (value: any, qna: Qna) => {
        if (!qna) return '-';
        return getFileLabel(qna.fileName);
      },
      align: 'center' as const
    },
    {
      key: 'createdAt',
      label: '등록일',
      render: (value: any, qna: Qna) => {
        if (!qna || !qna.createdAt) return '-';
        try {
          return new Date(qna.createdAt).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        } catch (error) {
          return '-';
        }
      },
      align: 'center' as const
    },
    {
      key: 'answeredAt',
      label: '처리일',
      render: (value: any, qna: Qna) => {
        if (!qna || !qna.answeredAt) return '-';
        try {
          return new Date(qna.answeredAt).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        } catch (error) {
          return '-';
        }
      },
      align: 'center' as const
    }
  ];

  return (
    <AdminLayout>
      <div className="tab-content">
        <div className="tab-panel">
          <div className="panel-header">
            <h2>Q&A</h2>
            <p>Q&A를 관리할 수 있습니다.</p>
          </div>
          <div className="panel-content">
            {/* 검색 폼 */}
            <AdminQnaSearchForm
              searchRequest={searchRequest}
              setSearchRequest={setSearchRequest}
              onSearch={handleSearch}
              statusOptions={statusOptions}
            />

            {/* Q&A 테이블 */}
            <AdminTable
              data={qnaList}
              columns={columns}
              currentPage={currentPage}
              totalPages={Math.ceil(totalCount / searchRequest.size)}
              totalCount={totalCount}
              pageSize={searchRequest.size}
              onPageChange={handlePageChange}
              emptyMessage="등록된 Q&A가 없습니다."
              showPagination={true}
              showPageSizeSelector={true}
              showSortSelector={true}
              sortOrder={searchRequest.sortOrder || 'latest'}
              onPageSizeChange={(newPageSize) => {
                setSearchRequest(prev => ({ ...prev, size: newPageSize, page: 0 }));
                setCurrentPage(1);
              }}
              onSortOrderChange={(newSortOrder) => {
                setSearchRequest(prev => ({ ...prev, sortOrder: newSortOrder, page: 0 }));
                setCurrentPage(1);
              }}
              sortOptions={[
                { value: 'latest', label: '최신순' },
                { value: 'oldest', label: '과거순' }
              ]}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
        </div>
      </div>

             {/* 상세 모달 */}
       <AdminQnaModal
         isOpen={isModalOpen}
         onClose={handleCloseModal}
         qna={selectedQna}
         onAnswerSubmit={fetchQnaList}
       />
    </AdminLayout>
  );
};

export default AdminQna;
