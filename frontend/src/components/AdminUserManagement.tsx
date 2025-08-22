import React, { useEffect, useState } from 'react';
import AdminTable from './AdminTable';
import AdminUserSearchForm from './AdminUserSearchForm';
import AdminUserDetailModal from './AdminUserDetailModal';
import { api } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  dailyLimit: number;
  monthlyLimit: number;
  singleLimit: number;
  limitType: string;
  status: string;
  lastLoginAt: string;
  createdAt: string;
}

interface UserSearchRequest {
  name?: string;
  email?: string;
  limitType?: string;
  status?: string;
  sortOrder?: string;
  page: number;
  size: number;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchRequest, setSearchRequest] = useState<UserSearchRequest>({
    name: '',
    email: '',
    limitType: undefined,
    status: '',
    sortOrder: 'name',
    page: 0,
    size: 10
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleUserNameClick = (userId: number) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };


  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.searchUsers(searchRequest);
      setUsers(response.content);
      setTotalItems(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      setUsers([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchRequest]);

  useEffect(() => {
    setSearchRequest(prev => ({ ...prev, page: 0 }));
    setCurrentPage(1);
  }, [searchRequest.name, searchRequest.email, searchRequest.limitType, searchRequest.status, searchRequest.sortOrder]);

  const handleSearch = () => {
    setSearchRequest(prev => ({ ...prev, page: 0 }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (totalPages > 0 && page > totalPages)) {
      return;
    }
    setCurrentPage(page);
    setSearchRequest(prev => ({ ...prev, page: (page - 1) * prev.size }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + ' 원';
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

  const columns = [
         {
       key: 'name',
       label: '사용자명',
       width: '120px',
       render: (value: any, user: User) => (
        <div
        style={{
          textDecoration: 'underline', 
          fontWeight: 'bold', 
          cursor: 'pointer',
          color: '#007bff'
        }}
        onClick={() => handleUserNameClick(user.id)}
      >
        {user.name}
      </div>
       ),
       align: 'left' as const
     },
    {
      key: 'email',
      label: '이메일',
      width: '200px',
      render: (value: any, user: User) => user.email,
      align: 'left' as const
    },
    {
      key: 'dailyLimit',
      label: '일일 한도',
      width: '120px',
      render: (value: any, user: User) => formatCurrency(user.dailyLimit),
      align: 'right' as const
    },
    {
      key: 'monthlyLimit',
      label: '월 한도',
      width: '120px',
      render: (value: any, user: User) => formatCurrency(user.monthlyLimit),
      align: 'right' as const
    },
    {
      key: 'singleLimit',
      label: '1회 한도',
      width: '120px',
      render: (value: any, user: User) => formatCurrency(user.singleLimit),
      align: 'right' as const
    },
    {
      key: 'limitType',
      label: '한도 유형',
      width: '120px',
      render: (value: any) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: value === 'C' ? '#fef3c7' : '#dbeafe',
          color: value === 'C' ? '#92400e' : '#1e40af'
        }}>
          {value === 'C' ? '공통 한도' : '개인 한도'}
        </span>
      ),
      align: 'center' as const
    },
    {
      key: 'status',
      label: '상태',
      width: '100px',
      render: (value: any, user: User) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: user.status === 'ACTIVE' ? '#dcfce7' : '#fef2f2',
          color: user.status === 'ACTIVE' ? '#166534' : '#dc2626'
        }}>
          {user.status === 'ACTIVE' ? '활성' : '비활성'}
        </span>
      ),
      align: 'center' as const
    },
    {
      key: 'lastLoginAt',
      label: '최근 로그인',
      width: '150px',
      render: (value: any, user: User) => formatDate(user.lastLoginAt),
      align: 'center' as const
    },
    {
      key: 'createdAt',
      label: '가입일',
      width: '150px',
      render: (value: any, user: User) => formatDate(user.createdAt),
      align: 'center' as const
    }
  ];

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>사용자 관리</h2>
        <p>사용자 정보와 송금 한도를 관리할 수 있습니다.</p>
      </div>
      <div className="panel-content">
        {/* 검색 폼 */}
        <AdminUserSearchForm
          searchRequest={searchRequest}
          setSearchRequest={setSearchRequest}
          onSearch={handleSearch}
        />

        {/* 사용자 테이블 */}
        <AdminTable
          data={users}
          columns={columns}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          emptyMessage="등록된 사용자가 없습니다."
          showPagination={true}
          showPageSizeSelector={true}
          showSortSelector={true}
          sortOrder={searchRequest.sortOrder || 'name'}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setSearchRequest(prev => ({ ...prev, size: newPageSize, page: 0 }));
            setCurrentPage(1);
          }}
          onSortOrderChange={(newSortOrder) => {
            setSearchRequest(prev => ({ ...prev, sortOrder: newSortOrder, page: 0 }));
            setCurrentPage(1);
          }}
          sortOptions={[
            { value: 'name', label: '이름순' },
            { value: 'dailyLimit', label: '일일한도순' },
            { value: 'monthlyLimit', label: '월한도순' },
            { value: 'singleLimit', label: '1회한도순' }
          ]}
          pageSizeOptions={[5, 10, 20, 50]}
        />

        {/* 사용자 상세 모달 */}
        <AdminUserDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={selectedUserId}
        onUserUpdated={fetchUsers}
        />
      </div>
    </div>
  );
};

export default AdminUserManagement;
