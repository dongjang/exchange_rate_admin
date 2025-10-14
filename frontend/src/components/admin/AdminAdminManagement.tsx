import React, { useEffect, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import AdminTable from './AdminTable';
import AdminAdminSearchForm from './AdminAdminSearchForm';
import AdminAdminModal from './AdminAdminModal';
import { api } from '../../services/api';
import { adminInfoAtom, setAdminAuthAtom } from '../../store/adminStore';
import Swal from 'sweetalert2';

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
  const [adminInfo] = useAtom(adminInfoAtom);
  const [, setAdminAuthState] = useAtom(setAdminAuthAtom);
  const navigate = useNavigate();
  
  // 현재 로그인한 관리자가 최고 관리자인지 확인
  const isSuperAdmin = adminInfo?.role === 'SUPER_ADMIN';

  const handleAdminNameClick = (adminId: number) => {
    if (!isSuperAdmin) return; // 최고 관리자가 아니면 클릭 무시
    setSelectedAdminId(adminId);
    setIsModalOpen(true);
  };

  // 관리자 정보 업데이트 후 처리
  const handleAdminUpdated = async () => {
    await fetchAdmins();
    
    // 본인 정보가 수정되었고 비밀번호가 변경된 경우 로그아웃 처리
    if (selectedAdminId === adminInfo?.id) {
      await Swal.fire({
        icon: 'info',
        title: '비밀번호 변경 완료',
        text: '비밀번호가 변경되었습니다. 다시 로그인해 주세요.',
        confirmButtonColor: '#3b82f6'
      });
      
      // 로그아웃 처리
      try {
        await api.adminLogout();
        setAdminAuthState({
          isAuthenticated: false,
          isLoading: false,
        });
        navigate('/');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
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
    if (!isSuperAdmin) return; // 최고 관리자가 아니면 등록 무시
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
      minWidth: '120px',
      flex: 1,
      render: (value: any, admin: Admin) => (
        <div
          style={{
            textDecoration: isSuperAdmin ? 'underline' : 'none', 
            fontWeight: 'bold', 
            cursor: isSuperAdmin ? 'pointer' : 'default',
            color: isSuperAdmin ? '#007bff' : '#333'
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
      minWidth: '120px',
      flex: 1,
      render: (value: any, admin: Admin) => admin.adminId,
      align: 'left' as const
    },
    {
      key: 'email',
      label: '이메일',
      minWidth: '300px',
      flex: 1.5,
      render: (value: any, admin: Admin) => admin.email,
      align: 'left' as const
    },
    {
      key: 'role',
      label: '권한',
      minWidth: '100px',
      flex: 0.8,
      render: (value: any) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: value === 'SUPER_ADMIN' ? '#fef3c7' : '#dbeafe',
          color: value === 'SUPER_ADMIN' ? '#92400e' : '#1e40af'
        }}>
          {value === 'SUPER_ADMIN' ? '최고 관리자' : '일반 관리자'}
        </span>
      ),
      align: 'center' as const
    },
    {
      key: 'status',
      label: '상태',
      minWidth: '100px',
      flex: 0.8,
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
      width: '200px',
      render: (value: any, admin: Admin) => admin.lastLoginAt ? formatDate(admin.lastLoginAt) : '-',
      align: 'center' as const
    },
    {
      key: 'createdAt',
      label: '생성일',
      width: '200px',
      render: (value: any, admin: Admin) => formatDate(admin.createdAt),
      align: 'center' as const
    },
  ];

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>관리자 관리</h2>
        <p>관리자 정보와 권한을 관리할 수 있습니다.</p>
        {!isSuperAdmin && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '12px 16px',
            marginTop: '12px',
            color: '#92400e',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ⚠️ 관리자 등록 및 수정은 최고 관리자만 가능합니다.
          </div>
        )}
      </div>
      <div className="panel-content">
        {/* 검색 폼 */}
        <AdminAdminSearchForm
          searchRequest={searchRequest}
          setSearchRequest={setSearchRequest}
          onSearch={handleSearch}
          onAdd={handleAdd}
          isSuperAdmin={isSuperAdmin}
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
          onAdminUpdated={handleAdminUpdated}
        />
      </div>
    </div>
  );
};

export default AdminAdminManagement;
