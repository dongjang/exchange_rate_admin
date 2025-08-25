import React, { useEffect, useState } from 'react';
import AdminTable from './AdminTable';
import AdminAdminSearchForm from './AdminAdminSearchForm';
import AdminAdminModal from './AdminAdminModal';
import { api } from '../../services/api';

interface Admin {
  id: number;
  adminId: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  updatedAdminName: string;
}

interface AdminSearchRequest {
  name?: string;
  adminId?: string;
  email?: string;
  role?: string;
  status?: string;
  sortOrder?: string;
  page: number;
  size: number;
}

const AdminAdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchRequest, setSearchRequest] = useState<AdminSearchRequest>({
    name: '',
    adminId: '',
    email: '',
    role: '',
    status: '',
    sortOrder: 'name',
    page: 0,
    size: 10
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);

  const handleAdminNameClick = (adminId: number) => {
    setSelectedAdminId(adminId);
    setIsModalOpen(true);
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.searchAdmins(searchRequest);
      setAdmins(response.content);
      setTotalItems(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('관리자 목록 조회 실패:', error);
      setAdmins([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [searchRequest]);

  useEffect(() => {
    setSearchRequest(prev => ({ ...prev, page: 0 }));
    setCurrentPage(1);
  }, [searchRequest.name, searchRequest.adminId, searchRequest.email, searchRequest.role, searchRequest.status, searchRequest.sortOrder]);

  const handleSearch = () => {
    setSearchRequest(prev => ({ ...prev, page: 0 }));
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setSelectedAdminId(null);
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchRequest(prev => ({ ...prev, page: page - 1 }));
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
      label: '관리자명',
      width: '120px',
      render: (value: any, admin: Admin) => (
        <div
          style={{
            textDecoration: 'underline', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            color: '#007bff'
          }}
          onClick={() => handleAdminNameClick(admin.id)}
        >
          {admin.name}
        </div>
      ),
      align: 'left' as const
    },
    {
      key: 'adminId',
      label: '아이디',
      width: '120px',
      render: (value: any, admin: Admin) => admin.adminId,
      align: 'left' as const
    },
    {
      key: 'email',
      label: '이메일',
      width: '200px',
      render: (value: any, admin: Admin) => admin.email,
      align: 'left' as const
    },
    {
      key: 'role',
      label: '권한',
      width: '100px',
      render: (value: any) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: value === 'SUPER_ADMIN' ? '#fef3c7' : '#dbeafe',
          color: value === 'SUPER_ADMIN' ? '#92400e' : '#1e40af'
        }}>
          {value === 'SUPER_ADMIN' ? '최고 관리자' : '관리자'}
        </span>
      ),
      align: 'center' as const
    },
    {
      key: 'status',
      label: '상태',
      width: '100px',
      render: (value: any) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: value === 'ACTIVE' ? '#dcfce7' : '#fef2f2',
          color: value === 'ACTIVE' ? '#166534' : '#dc2626'
        }}>
          {value === 'ACTIVE' ? '활성' : '비활성'}
        </span>
      ),
      align: 'center' as const
    },
    {
      key: 'lastLoginAt',
      label: '최근 로그인',
      width: '150px',
      render: (value: any, admin: Admin) => admin.lastLoginAt ? formatDate(admin.lastLoginAt) : '-',
      align: 'center' as const
    },
    {
      key: 'createdAt',
      label: '생성일',
      width: '150px',
      render: (value: any, admin: Admin) => formatDate(admin.createdAt),
      align: 'center' as const
    },
  ];

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>관리자 관리</h2>
        <p>관리자 정보와 권한을 관리할 수 있습니다.</p>
      </div>
      <div className="panel-content">
        {/* 검색 폼 */}
        <AdminAdminSearchForm
          searchRequest={searchRequest}
          setSearchRequest={setSearchRequest}
          onSearch={handleSearch}
          onAdd={handleAdd}
        />

        {/* 관리자 테이블 */}
        <AdminTable
          data={admins}
          columns={columns}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          emptyMessage="등록된 관리자가 없습니다."
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
            { value: 'adminId', label: '아이디순' },
            { value: 'email', label: '이메일순' },
            { value: 'role', label: '권한순' },
            { value: 'status', label: '상태순' },
            { value: 'lastLoginAt', label: '최근로그인순' },
            { value: 'createdAt', label: '생성일순' }
          ]}
          pageSizeOptions={[5, 10, 20, 50]}
        />

        {/* 관리자 상세 모달 */}
        <AdminAdminModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          adminId={selectedAdminId}
          onAdminUpdated={fetchAdmins}
        />
      </div>
    </div>
  );
};

export default AdminAdminManagement;
