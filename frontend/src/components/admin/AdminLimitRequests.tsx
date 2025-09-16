import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

interface LimitRequest {
  id: number;
  userId: number;
  newDailyLimit: number;
  newMonthlyLimit: number;
  singleLimit?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const AdminLimitRequests: React.FC = () => {
  const [limitRequests, setLimitRequests] = useState<LimitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLimitRequests();
  }, []);

  const fetchLimitRequests = async () => {
    try {
      const response = await api.getLimitRequests();
      // 대기중인 신청만 필터링
      const pendingRequests = response.filter((request: LimitRequest) => request.status === 'PENDING');
      setLimitRequests(pendingRequests.slice(0, 5)); // 최대 5개만 표시
    } catch (error) {
      console.error('한도 변경 신청 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 대기중인 신청 총 건수 계산
  const getPendingCount = () => {
    return limitRequests.length;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기중';
      case 'APPROVED':
        return '승인됨';
      case 'REJECTED':
        return '거절됨';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'APPROVED':
        return '#10b981';
      case 'REJECTED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="admin-card-header">
          <h3>📋 한도 변경 신청</h3>
        </div>
        <div className="card-content">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            로딩 중...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="admin-card-header">
        <h3>📋 한도 변경 신청</h3>
        <button className="more-button" onClick={() => navigate('/remittance', { state: { activeTab: 'limits' } })}>
          더보기
        </button>
      </div>
      <div className="card-content">
        {limitRequests.length === 0 ? (
          <div className="qna-empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">한도 변경 신청이 없습니다</div>
            <div className="empty-subtitle">새로운 신청이 들어오면 여기에 표시됩니다</div>
          </div>
        ) : (
          <>
            <div className="limit-requests-list">
              {limitRequests.map((request) => (
                <div
                  key={request.id}
                  className="limit-request-item"
                >
                                     <div className="limit-request-info">
                     <div className="limit-request-user">사용자 {request.userId}</div>
                     <div className="limit-request-limits">
                       <span>일일: {formatNumber(request.newDailyLimit)}원</span>
                       <span>월간: {formatNumber(request.newMonthlyLimit)}원</span>
                       <span>1회: {formatNumber(request.singleLimit || 0)}원</span>
                     </div>
                     <div className="limit-request-date">
                       {formatDate(request.createdAt)}
                     </div>
                   </div>
                  {/* <div className="limit-request-status">
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: getStatusColor(request.status) + '20',
                      color: getStatusColor(request.status)
                    }}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div> */}
                </div>
              ))}
            </div>
            <div className="pending-count-footer">
              <button className="pending-count-button">
                총 {getPendingCount()}건의 신청 대기 중
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLimitRequests;
