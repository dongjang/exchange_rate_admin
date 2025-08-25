import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

interface Notice {
  id: number;
  title: string;
  content: string;
  status: string;
  priority: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  noticeStartAt?: string;
  noticeEndAt?: string;
  createdUserId: number;
  createdUserName?: string;
}

const AdminTop5Notices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTop5Notices();
  }, []);

  const fetchTop5Notices = async () => {
    try {
      const response = await api.getTop5Notices();
      setNotices(response);
    } catch (error) {
      console.error('공지사항 TOP5 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return '#ef4444';
      case 'NORMAL':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return '높음';
      case 'NORMAL':
        return '보통';
      default:
        return priority;
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="admin-card-header">
          <h3>📢 공지사항 조회수 TOP5</h3>
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
        <h3>📢 공지사항 조회수 TOP5</h3>
        <button className="more-button" onClick={() => navigate('/admin/notices')}>
          더보기
        </button>
      </div>
      <div className="card-content">
        {notices.length === 0 ? (
          <div className="qna-empty-state">
            <div className="empty-icon">📢</div>
            <div className="empty-title">공지사항이 없습니다</div>
            <div className="empty-subtitle">새로운 공지사항이 등록되면 여기에 표시됩니다</div>
          </div>
        ) : (
          <div className="top-notices-list">
            {notices.map((notice, index) => (
              <div
                key={notice.id}
                className="top-notice-item"
              >
                <div className="top-notice-rank">
                  <span className={`rank-number ${index < 3 ? 'top-rank' : ''}`}>
                    {index + 1}
                  </span>
                </div>
                <div className="top-notice-info">
                  <div className="top-notice-title">{notice.title}</div>
                  <div className="top-notice-meta">
                    <span className="top-notice-priority" style={{
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: getPriorityColor(notice.priority) + '20',
                      color: getPriorityColor(notice.priority)
                    }}>
                      {getPriorityLabel(notice.priority)}
                    </span>
                    <span className="top-notice-date">
                      {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <div className="top-notice-views">
                  <div className="views-number">{formatNumber(notice.viewCount)}</div>
                  <div className="views-label">조회</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTop5Notices;
