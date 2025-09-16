import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { api } from '../../services/api';
import { userInfoAtom } from '../../store/userStore';
import AdminNoticeModal from './AdminNoticeModal';
import NoticeSearchForm from './NoticeSearchForm';
import AdminLayout from './AdminLayout';
import AdminTable from './AdminTable';

interface Notice {
  id: number;
  title: string;
  content: string;
  status: string;
  priority: string;
  noticeStartAt?: string;
  noticeEndAt?: string;
  effectivePriority?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  createdUserId: number;
  createdUserName: string;
  updatedUserName?: string;
}

interface NoticeSearchRequest {
  title?: string;
  content?: string;
  status?: string;
  priority?: string;
  page: number;
  size: number;
  sortOrder?: string;
}

const AdminNotices: React.FC = () => {
  const [userInfo] = useAtom(userInfoAtom);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchRequest, setSearchRequest] = useState<NoticeSearchRequest>({
    page: 0,
    size: 10,
    sortOrder: 'latest'
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'NORMAL',
    status: 'ACTIVE',
    noticeStartAt: null,
    noticeEndAt:  null
  });

  const priorityOptions = [
    { value: 'HIGH', label: '높음' },
    { value: 'NORMAL', label: '보통' },
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: '활성' },
    { value: 'INACTIVE', label: '비활성' }
  ];

  const fetchNotices = async () => {
    try {
      const response = await api.searchAdminNotices(searchRequest);
      if (response) {
        setNotices(response.list);
        setTotalCount(response.count);
      } else {
        setNotices([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('공지사항 조회 실패:', error);
      Swal.fire('오류', '공지사항을 불러오는데 실패했습니다.', 'error');
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [searchRequest]);

  useEffect(() => {
    handleSearch();
  }, [searchRequest.title, searchRequest.content,searchRequest.status,searchRequest.priority]);

  const handleSearch = () => {
    setSearchRequest(prev => ({ ...prev, page: 0 }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchRequest(prev => ({ ...prev, page: (page - 1) * prev.size }));
  };

  const handlePageSizeChange = (size: number) => {
    setSearchRequest(prev => ({ ...prev, size, page: 0 }));
    setCurrentPage(1);
  };

  const handleSortOrderChange = (sortOrder: string) => {
    setSearchRequest(prev => ({ ...prev, sortOrder, page: 0 }));
    setCurrentPage(1);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Swal.fire('오류', '제목을 입력해주세요.', 'error');
      return;
    }

    if (!formData.content.trim()) {
      Swal.fire('오류', '내용을 입력해주세요.', 'error');
      return;
    }

    if (formData.priority === 'HIGH' && !formData.noticeStartAt) {
      Swal.fire('오류', '높은 중요도는 시작일을 설정해야 합니다.', 'error');
      return;
    }

    if (formData.priority === 'HIGH' && !formData.noticeEndAt) {
      Swal.fire('오류', '높은 중요도는 종료일일 설정해야 합니다.', 'error');
      return;
    }

    // 컨펌 창 표시
    const confirmMessage = editingNotice ? '공지사항을 수정하시겠습니까?' : '공지사항을 등록하시겠습니까?';
    const result = await Swal.fire({
      title: '확인',
      text: confirmMessage,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#6b7280',
      confirmButtonText: editingNotice ? '수정' : '등록',
      cancelButtonText: '취소'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const noticeData = {
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        status: formData.status,
        noticeStartAt: formData.noticeStartAt,
        noticeEndAt: formData.noticeEndAt
      };

      if (editingNotice) {
        await api.updateNotice(editingNotice.id, noticeData);
        Swal.fire('성공', '공지사항이 수정되었습니다.', 'success');
      } else {
        await api.createNotice(noticeData);
        Swal.fire('성공', '공지사항이 등록되었습니다.', 'success');
      }

      setIsModalOpen(false);
      setEditingNotice(null);
      setFormData({
        title: '',
        content: '',
        priority: 'NORMAL',
        status: 'ACTIVE',
        noticeStartAt: null,
        noticeEndAt: null
      });
      fetchNotices();
    } catch (error) {
      console.error('공지사항 저장 실패:', error);
      Swal.fire('오류', '공지사항 저장에 실패했습니다.', 'error');
    }
  };

  const handleEdit = async (notice: Notice) => {
    try {
      // 개별 API 호출로 최신 데이터 가져오기
      const noticeDetail = await api.getAdminNoticeById(notice.id);
      setEditingNotice(noticeDetail);
      
      setFormData({
        title: noticeDetail.title,
        content: noticeDetail.content,
        priority: noticeDetail.priority,
        status: noticeDetail.status,
        noticeStartAt: noticeDetail.noticeStartAt ? noticeDetail.noticeStartAt.split('T')[0] : null,
        noticeEndAt: noticeDetail.noticeEndAt ? noticeDetail.noticeEndAt.split('T')[0] : null
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error('공지사항 상세 정보 조회 실패:', error);
      Swal.fire('오류', '공지사항 상세 정보를 가져오는데 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '확인',
      text: '정말로 이 공지사항을 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteNotice(id);
        Swal.fire('성공', '공지사항이 삭제되었습니다.', 'success');
        fetchNotices();
      } catch (error) {
        console.error('공지사항 삭제 실패:', error);
        Swal.fire('오류', '공지사항 삭제에 실패했습니다.', 'error');
      }
    }
  };

  const handleAdd = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      priority: 'NORMAL',
      status: 'ACTIVE',
      noticeStartAt: null,
      noticeEndAt: null
    });
    setIsModalOpen(true);
  };

  const tableColumns = [
    { 
      key: 'title', 
      label: '제목', 
      flex: 1.2,
      align: 'left' as const,
      render: (value: any, notice: Notice) => (
        <span 
          style={{ 
            textDecoration: 'underline', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            color: '#007bff'
          }}
          onClick={() => handleEdit(notice)}
        >
          {notice.title}
        </span>
      )
    },
    { 
      key: 'priority', 
      label: '중요도', 
      flex: 0.6,
      align: 'center' as const,
      render: (value: any, notice: Notice) => {
        const priority = priorityOptions.find(p => p.value === notice.priority);
        return priority ? priority.label : notice.priority;
      }
    },
    { 
      key: 'status', 
      label: '상태', 
      minWidth: '80px',
      flex: 0.6,
      align: 'center' as const,
      render: (value: any, notice: Notice) => {
        const status = statusOptions.find(s => s.value === notice.status);
        return status ? status.label : notice.status;
      }
    },
    { 
      key: 'viewCount', 
      label: '조회수', 
      minWidth: '50px',
      maxWidth: '100px',
      flex: 0.6,
      align: 'right' as const
    },
    { 
      key: 'createdUserName', 
      label: '작성자', 
      minWidth: '100px',
      flex: 0.8,
      align: 'center' as const
    },
    { 
      key: 'updatedUserName', 
      label: '수정자', 
      minWidth: '100px',
      flex: 0.8,
      align: 'center' as const,
      render: (value: any, notice: Notice) => {
        return notice.updatedUserName || '-';
      }
    },
    { 
      key: 'modalDisplayDate', 
      label: '모달 표시 기간', 
      minWidth: '350px',
      flex: 1.5,
      align: 'center' as const,
      render: (value: any, notice: Notice) => {
        if (notice.priority === 'HIGH' && notice.noticeStartAt) {
          const startDate = new Date(notice.noticeStartAt);
          const startDateStr = startDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).replace(/\./g, '.').replace(/,/g, '');
          
          if (notice.noticeEndAt) {
            const endDate = new Date(notice.noticeEndAt);
            const endDateStr = endDate.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\./g, '.').replace(/,/g, '');
            return `${startDateStr} 오전 00:00 ~ ${endDateStr} 오후 23:59`;
          } else {
            return '-';
          }
        }
        return '-';
      }
    },
    { 
      key: 'createdAt', 
      label: '작성일', 
      minWidth: '140px',
      maxWidth: '200px',
      flex: 1,
      align: 'center' as const,
      render: (value: any, notice: Notice) => {
        const date = new Date(notice.createdAt);
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\./g, '.').replace(/,/g, '');
      }
    },
    { 
      key: 'updatedAt', 
      label: '수정일', 
      minWidth: '140px',
      maxWidth: '200px',
      flex: 1,
      align: 'center' as const,
      render: (value: any, notice: Notice) => {
        const date = new Date(notice.updatedAt);
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\./g, '.').replace(/,/g, '');
      }
    },
    { 
      key: 'actions', 
      label: '관리', 
      minWidth: '80px',
      flex: 0.8,
      align: 'center' as const,
      render: (value: any, notice: Notice) => (
        <button
          onClick={() => handleDelete(notice.id)}
          style={{
            padding: '4px 8px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          삭제
        </button>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="tab-content">
        <div className="tab-panel">
          <div className="panel-header">
            <h2>공지사항</h2>
            <p>공지사항을 등록하고 관리할 수 있습니다.</p>
          </div>
          <div className="panel-content">
            <NoticeSearchForm
              searchRequest={searchRequest}
              setSearchRequest={setSearchRequest}
              onSearch={handleSearch}
              onAdd={handleAdd}
              priorityOptions={priorityOptions}
              statusOptions={statusOptions}
            />

            <AdminTable
              data={notices}
              columns={tableColumns}
              totalCount={totalCount}
              currentPage={currentPage}
              totalPages={Math.ceil(totalCount / searchRequest.size)}
              pageSize={searchRequest.size}
              onPageChange={handlePageChange}
              showPagination={true}
              showPageSizeSelector={true}
              showSortSelector={true}
              onPageSizeChange={handlePageSizeChange}
              onSortOrderChange={handleSortOrderChange}
              sortOrder={searchRequest.sortOrder || 'latest'}
              sortOptions={[
                { value: 'latest', label: '최신순' },
                { value: 'oldest', label: '과거순' },
                { value: 'views', label: '조회수순' }
              ]}
            />
          </div>
        </div>
      </div>

      <AdminNoticeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        editingNotice={editingNotice}
        formData={formData}
        setFormData={setFormData}
        priorityOptions={priorityOptions}
        statusOptions={statusOptions}
      />
    </AdminLayout>
  );
};

export default AdminNotices;
