import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Swal from 'sweetalert2';

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

interface AdminUserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  onUserUpdated: () => void;
}

const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({
  isOpen,
  onClose,
  userId,
  onUserUpdated
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetail();
    }
  }, [isOpen, userId]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const userData = await api.getAdminUserById(userId!);
      setUser(userData);
      setStatus(userData.status);
    } catch (error) {
      console.error('사용자 상세 정보 조회 실패:', error);
      Swal.fire('오류', '사용자 정보를 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!user || !userId) return;

    // 컨펌 창 표시
    const result = await Swal.fire({
      title: '상태 변경 확인',
      text: `${user.name}님의 상태를 ${status === 'ACTIVE' ? '활성' : '비활성'}으로 변경하시겠습니까?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '변경',
      cancelButtonText: '취소',

    });

    if (result.isConfirmed) {
      try {
        await api.updateUserStatus(userId, status);
        await Swal.fire({
          title: '변경 완료!',
          text: '사용자 상태가 성공적으로 업데이트되었습니다.',
          icon: 'success',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            htmlContainer: 'swal-custom-content'
          }
        });
        onUserUpdated();
        onClose();
      } catch (error) {
        console.error('사용자 상태 업데이트 실패:', error);
        Swal.fire({
          title: '변경 실패',
          text: '사용자 상태 업데이트에 실패했습니다.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            htmlContainer: 'swal-custom-content'
          }
        });
      }
    }
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)'
    }}>
      <div className="modal-content" style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
        borderRadius: window.innerWidth <= 768 ? '12px' : '20px',
        padding: window.innerWidth <= 768 ? '20px' : '40px',
        width: window.innerWidth <= 768 ? '95vw' : '800px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        animation: 'modalSlideIn 0.3s ease-out'
      }}>
        <div className="modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: window.innerWidth <= 768 ? '16px' : '20px'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: window.innerWidth <= 768 ? '18px' : '24px', 
            fontWeight: '600' 
          }}>사용자 상세 정보</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: window.innerWidth <= 768 ? '20px' : '24px',
              cursor: 'pointer',
              padding: '0',
              width: window.innerWidth <= 768 ? '28px' : '30px',
              height: window.innerWidth <= 768 ? '28px' : '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner"></div>
            <p>사용자 정보를 불러오는 중...</p>
          </div>
        ) : user ? (
          <div className="modal-body">
            <div style={{ marginBottom: window.innerWidth <= 768 ? '16px' : '20px' }}>
              <h3 style={{ 
                marginBottom: window.innerWidth <= 768 ? '12px' : '16px', 
                fontSize: window.innerWidth <= 768 ? '16px' : '18px', 
                fontWeight: '600' 
              }}>기본 정보</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
                gap: window.innerWidth <= 768 ? '12px' : '16px' 
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontWeight: '500', 
                    color: '#6b7280',
                    fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                  }}>사용자명</label>
                  <div style={{ 
                    padding: window.innerWidth <= 768 ? '10px 12px' : '8px 12px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e7eb',
                    fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                  }}>
                    {user.name}
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontWeight: '500', 
                    color: '#6b7280',
                    fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                  }}>이메일</label>
                  <div style={{ 
                    padding: window.innerWidth <= 768 ? '10px 12px' : '8px 12px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e7eb',
                    fontSize: window.innerWidth <= 768 ? '14px' : '16px',
                    wordBreak: 'break-all'
                  }}>
                    {user.email}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: window.innerWidth <= 768 ? '16px' : '20px' }}>
              <h3 style={{ 
                marginBottom: window.innerWidth <= 768 ? '12px' : '16px', 
                fontSize: window.innerWidth <= 768 ? '16px' : '18px', 
                fontWeight: '600' 
              }}>송금 한도</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
                gap: window.innerWidth <= 768 ? '12px' : '16px' 
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontWeight: '500', 
                    color: '#6b7280',
                    fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                  }}>일일 한도</label>
                  <div style={{ 
                    padding: window.innerWidth <= 768 ? '10px 12px' : '8px 12px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e7eb',
                    fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                  }}>
                    {user.dailyLimit ? formatCurrency(user.dailyLimit) : '설정되지 않음'}
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontWeight: '500', 
                    color: '#6b7280',
                    fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                  }}>월 한도</label>
                  <div style={{ 
                    padding: window.innerWidth <= 768 ? '10px 12px' : '8px 12px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e7eb',
                    fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                  }}>
                    {user.monthlyLimit ? formatCurrency(user.monthlyLimit) : '설정되지 않음'}
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontWeight: '500', 
                    color: '#6b7280',
                    fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                  }}>1회 한도</label>
                  <div style={{ 
                    padding: window.innerWidth <= 768 ? '10px 12px' : '8px 12px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e7eb',
                    fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                  }}>
                    {user.singleLimit ? formatCurrency(user.singleLimit) : '설정되지 않음'}
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontWeight: '500', 
                    color: '#6b7280',
                    fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                  }}>한도 유형</label>
                  <div style={{ 
                    padding: window.innerWidth <= 768 ? '10px 12px' : '8px 12px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      padding: window.innerWidth <= 768 ? '6px 10px' : '4px 8px',
                      borderRadius: '4px',
                      fontSize: window.innerWidth <= 768 ? '13px' : '12px',
                      fontWeight: '500',
                      backgroundColor: user.limitType === 'C' ? '#fef3c7' : '#dbeafe',
                      color: user.limitType === 'C' ? '#92400e' : '#1e40af'
                    }}>
                      {user.limitType === 'C' ? '공통 한도' : '개인 한도'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: window.innerWidth <= 768 ? '16px' : '20px' }}>
              <h3 style={{ 
                marginBottom: window.innerWidth <= 768 ? '12px' : '16px', 
                fontSize: window.innerWidth <= 768 ? '16px' : '18px', 
                fontWeight: '600' 
              }}>계정 정보</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
                gap: window.innerWidth <= 768 ? '12px' : '16px' 
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontWeight: '500', 
                    color: '#6b7280',
                    fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                  }}>상태</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: window.innerWidth <= 768 ? '10px 12px' : '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: window.innerWidth <= 768 ? '14px' : '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="ACTIVE">활성</option>
                    <option value="INACTIVE">비활성</option>
                  </select>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontWeight: '500', 
                    color: '#6b7280',
                    fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                  }}>최근 로그인</label>
                  <div style={{ 
                    padding: window.innerWidth <= 768 ? '10px 12px' : '8px 12px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e7eb',
                    fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                  }}>
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : '로그인 기록 없음'}
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontWeight: '500', 
                    color: '#6b7280',
                    fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                  }}>가입일</label>
                  <div style={{ 
                    padding: window.innerWidth <= 768 ? '10px 12px' : '8px 12px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e7eb',
                    fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                  }}>
                    {formatDate(user.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                취소
              </button>
              <button
                onClick={handleStatusUpdate}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                상태 업데이트
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>사용자 정보를 찾을 수 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserDetailModal;
