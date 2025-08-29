import React, { useState, useEffect } from 'react';
import { FaChartLine, FaUsers, FaExchangeAlt, FaQuestionCircle, FaBullhorn, FaComments } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './AdminDashboard.css';
import { api } from '../../services/api';
import AdminLayout from './AdminLayout';
import AdminLimitRequests from './AdminLimitRequests';
import AdminTop5Notices from './AdminTop5Notices';

interface AdminDashboardProps {
  admin?: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 대시보드 데이터 조회
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
                 const data = await api.getDashboardStats();
         setDashboardData(data);
      } catch (err) {
        console.error('대시보드 데이터 조회 실패:', err);
        setError('대시보드 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 송금 통계 데이터 (API에서 가져온 데이터 사용)
  const remittanceStats = dashboardData?.remittanceStats || {
    dailyCount: 0,
    monthlyCount: 0,
    yearlyCount: 0,
    dailyAverageAmount: 0,
    monthlyAverageAmount: 0,
    yearlyAverageAmount: 0,
    dailyMaxAmount: 0,
    monthlyMaxAmount: 0,
    yearlyMaxAmount: 0
  };

  // 송금 통계 차트용 데이터 (API에서 가져온 데이터 사용)
  const remittanceChartData = dashboardData?.recentRemittanceCount || [];

  // 환율 통계 데이터 (API에서 가져온 데이터 사용)
  const exchangeRateData = dashboardData?.exchangeRateStats || {
    totalCountries: 0,
    availableCountries: 0,
    totalFavorites: 0
  };
  
  const favoriteCurrencyTop5 = dashboardData?.favoriteCurrencyTop5 || [];

  // 사용자 통계 데이터 (API에서 가져온 데이터 사용)
  const userStats = dashboardData?.userStats || {
    totalUsers: 0,
    newUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0
  };

  // 사용자 통계 차트용 데이터
  const userChartData = [
    { name: '총 가입자', value: userStats.totalUsers, color: '#667eea' },
    { name: '신규 가입', value: userStats.newUsers, color: '#4CAF50' },
    { name: '활성 사용자', value: userStats.activeUsers, color: '#FF9800' },
    { name: '비활성 사용자', value: userStats.inactiveUsers, color: '#F44336' }
  ];

  // Q&A 데이터 (API에서 가져온 데이터 사용)
  const qnaStats = dashboardData?.qnaStats || {
    pendingCount: 0
  };
  
  const pendingQnaList = dashboardData?.pendingQnaList || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  // 로딩 중일 때 표시
  if (loading) {
    return (
      <div className="admin-layout">
        <div className="loading-container">
          <div className="loading-popup">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러가 있을 때 표시
  if (error) {
    return (
      <div className="admin-layout">
        <div className="error-container">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout admin={admin}>
      <div className="admin-dashboard-container">
        {/* 첫 번째 로우: 통계 카드들 */}
        <div className="dashboard-grid">
          {/* 송금 통계 - 큰 카드 */}
          <div className="dashboard-card wide">
            <div className="admin-card-header">
              <h3>📊 송금 통계</h3>
            </div>
            <div className="card-content">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">일간 송금 건수</div>
                  <div className="stat-value">{formatNumber(remittanceStats.dailyCount)}건</div>
                  <div className="stat-subtitle">{new Date().getFullYear()}년 {new Date().getMonth() + 1}월 {new Date().getDate()}일</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">월간 송금 건수</div>
                  <div className="stat-value">{formatNumber(remittanceStats.monthlyCount)}건</div>
                  <div className="stat-subtitle">{new Date().getFullYear()}년 {new Date().getMonth() + 1}월</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">연간 송금 건수</div>
                  <div className="stat-value">{formatNumber(remittanceStats.yearlyCount)}건</div>
                  <div className="stat-subtitle">{new Date().getFullYear()}년</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">일간 평균 송금액</div>
                  <div className="stat-value">{formatCurrency(remittanceStats.dailyAverageAmount)}원</div>
                  <div className="stat-subtitle">{new Date().getFullYear()}년 {new Date().getMonth() + 1}월 {new Date().getDate()}일</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">월간 평균 송금액</div>
                  <div className="stat-value">{formatCurrency(remittanceStats.monthlyAverageAmount)}원</div>
                  <div className="stat-subtitle">{new Date().getFullYear()}년 {new Date().getMonth() + 1}월</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">연간 평균 송금액</div>
                  <div className="stat-value">{formatCurrency(remittanceStats.yearlyAverageAmount)}원</div>
                  <div className="stat-subtitle">{new Date().getFullYear()}년</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">일간 최고 송금액</div>
                  <div className="stat-value">{formatCurrency(remittanceStats.dailyMaxAmount)}원</div>
                  <div className="stat-subtitle">{new Date().getFullYear()}년 {new Date().getMonth() + 1}월 {new Date().getDate()}일</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">월간 최고 송금액</div>
                  <div className="stat-value">{formatCurrency(remittanceStats.monthlyMaxAmount)}원</div>
                  <div className="stat-subtitle">{new Date().getFullYear()}년 {new Date().getMonth() + 1}월</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">연간 최고 송금액</div>
                  <div className="stat-value">{formatCurrency(remittanceStats.yearlyMaxAmount)}원</div>
                  <div className="stat-subtitle">{new Date().getFullYear()}년</div>
                </div>
              </div>
            </div>

            {/* 송금 통계 미니 차트 */}
            <div className="chart-section">
              <h4>최근 7일 송금 건수</h4>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={remittanceChartData}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(102, 126, 234, 0.1)" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6c757d' }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6c757d' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid rgba(102, 126, 234, 0.1)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                      labelStyle={{ color: '#2c3e50', fontWeight: '600' }}
                      formatter={(value, name) => [value, '송금 건수']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="url(#lineGradient)" 
                      strokeWidth={3}
                      dot={{ fill: '#667eea', stroke: 'white', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#764ba2' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 환율 통계 - 중간 카드 */}
          <div className="dashboard-card">
            <div className="admin-card-header">
              <h3>💱 환율 통계</h3>
            </div>
            <div className="card-content">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">전체 국가</div>
                  <div className="stat-value">{exchangeRateData.totalCountries}국</div>
                  <div className="stat-subtitle">환율 제공 국가</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">송금 가능 국가</div>
                  <div className="stat-value">{exchangeRateData.availableCountries}국</div>
                  <div className="stat-subtitle">송금 서비스 제공</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">관심 환율</div>
                  <div className="stat-value">{formatNumber(exchangeRateData.totalFavorites)}개</div>
                  <div className="stat-subtitle">수취 통화 수</div>
                </div>
              </div>
              
              {/* TOP 관심 환율 */}
              <div className="chart-section">
                <h4>관심 환율 TOP 5</h4>
                <div className="top-currencies">
                  {favoriteCurrencyTop5.map((item: any, index: number) => (
                    <div key={index} className="currency-item">
                      <span className="currency-rank">{index + 1}</span>
                      <span className="currency-code">{item.favoriteContents}</span>
                      <span className="currency-count">{item.cnt}개</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 사용자 통계 - 중간 카드 */}
          <div className="dashboard-card">
            <div className="admin-card-header">
              <h3>👥 사용자 통계</h3>
              <button className="more-button" onClick={() => navigate('/admin/users')}>더보기</button>
            </div>
            <div className="card-content">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">총 가입자 수</div>
                  <div className="stat-value">{formatNumber(userStats.totalUsers)}명</div>
                  <div className="stat-subtitle">전체 사용자</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">신규 가입</div>
                  <div className="stat-value">{formatNumber(userStats.newUsers)}명</div>
                  <div className="stat-subtitle">최근 7일</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">활성 사용자</div>
                  <div className="stat-value">{formatNumber(userStats.activeUsers)}명</div>
                  <div className="stat-subtitle">활성 상태</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">비활성 사용자</div>
                  <div className="stat-value">{formatNumber(userStats.inactiveUsers)}명</div>
                  <div className="stat-subtitle">비활성 상태</div>
                </div>
              </div>
              
              {/* 사용자 통계 파이 차트 */}
              <div className="chart-section">
                <h4>사용자 분포</h4>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={userChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {userChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [formatNumber(value as number), name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* 범례 */}
                <div className="chart-legend">
                  {userChartData.map((item, index) => (
                    <div key={index} className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: item.color }}></span>
                      <span className="legend-label">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 두 번째 로우: 관리 카드들 */}
        <div className="dashboard-grid second-row">
          <AdminLimitRequests />
          <div className="dashboard-card">
            <div className="admin-card-header">
              <h3>❓ Q&A 미답변</h3>
              <button className="more-button" onClick={() => navigate('/admin/qna', { state: { fromDashboard: true } })}>더보기</button>
            </div>
            <div className="card-content">
              {qnaStats.pendingCount > 0 ? (
                <>
                  <div className="qna-list">
                    {pendingQnaList.map((item: any) => (
                      <div key={item.id} className="qna-item">
                        <div className="qna-info">
                          <div className="qna-title">{item.title}</div>
                          <div className="qna-date">{new Date(item.createdAt).toLocaleDateString('ko-KR')}</div>
                        </div>
                        {item.hasFile && (
                          <div className={`qna-priority ${item.hasFile ? 'file-attached' : ''}`}>
                            파일 첨부
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="qna-summary">
                    총 {qnaStats.pendingCount}건의 답변 대기 중
                  </div>
                </>
              ) : (
                <div className="qna-empty-state">
                  <div className="empty-icon">📝</div>
                  <div className="empty-title">답변 대기 중인 문의가 없습니다</div>
                  <div className="empty-subtitle">새로운 문의가 들어오면 여기에 표시됩니다</div>
                </div>
              )}
            </div>
          </div>
          <AdminTop5Notices />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 