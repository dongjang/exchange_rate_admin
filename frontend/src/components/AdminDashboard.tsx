import React, { useState } from 'react';
import { FaChartLine, FaUsers, FaExchangeAlt, FaQuestionCircle, FaBars, FaTimes, FaSignOutAlt, FaBullhorn, FaComments } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './AdminDashboard.css';
import { api } from '../services/api';

interface AdminDashboardProps {
  user?: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await api.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 송금 통계 데이터
  const remittanceStats = {
    dailyCount: 22, // 일간 송금 건수
    monthlyCount: 280, // 월간 송금 건수
    yearlyCount: 3200, // 연간 송금 건수
    dailyAverageAmount: 450000, // 일간 평균 송금액
    monthlyAverageAmount: 520000, // 월간 평균 송금액
    yearlyAverageAmount: 480000, // 연간 평균 송금액
    dailyMaxAmount: 2500000, // 일간 최고 송금액
    monthlyMaxAmount: 15000000, // 월간 최고 송금액
    yearlyMaxAmount: 50000000 // 연간 최고 송금액
  };

  // 송금 통계 차트용 데이터 (최근 7일)
  const getRecentDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      dates.push({ 
        day: `${month}/${day}`, 
        count: Math.floor(Math.random() * 20) + 10 
      });
    }
    return dates;
  };

  const remittanceChartData = getRecentDates();

  // 환율 통계 데이터
  const exchangeRateData = {
    totalCountries: 45, // 전체 국가 수
    availableCountries: 32, // 송금 가능 국가
    totalFavorites: 391, // 등록된 관심 환율 (수취 통화 수)
    topFavorites: [
      { currency: 'USD', count: 156, country: '미국' },
      { currency: 'EUR', count: 89, country: '유럽' },
      { currency: 'JPY', count: 67, country: '일본' },
      { currency: 'CNY', count: 45, country: '중국' },
      { currency: 'GBP', count: 34, country: '영국' }
    ]
  };

  // 사용자 통계 데이터
  const userStats = {
    totalUsers: 1250, // 총 가입 수
    newUsers: 55, // 신규 가입 (최근 30일)
    activeUsers: 980, // 활성 사용자
    inactiveUsers: 270 // 비활성 사용자
  };

  // 사용자 통계 차트용 데이터
  const userChartData = [
    { name: '총 가입자', value: userStats.totalUsers, color: '#667eea' },
    { name: '신규 가입', value: userStats.newUsers, color: '#4CAF50' },
    { name: '활성 사용자', value: userStats.activeUsers, color: '#FF9800' },
    { name: '비활성 사용자', value: userStats.inactiveUsers, color: '#F44336' }
  ];

  // Q&A 데이터 (실제 API 연동 시에는 이 부분을 제거하고 API에서 가져올 예정)
  const qnaStats = {
    pendingCount: 0, // 답변 대기 중인 건수 (0으로 설정하여 빈 상태 테스트)
    pendingList: [] // 빈 배열로 설정하여 답변이 없을 때 테스트
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <FaBars />
          </button>
          <h1 className="admin-title">관리자 대시보드</h1>
        </div>
        <div className="header-right">
          <span className="admin-user">관리자: {user?.name || 'Admin'}</span>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>로그아웃</span>
          </button>
        </div>
      </header>

      <div className="admin-container">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className="sidebar-nav">
            <div className="nav-item active" title="대시보드">
              <FaChartLine />
              <span className="nav-text">대시보드</span>
            </div>
            <div className="nav-item" title="송금 관리">
              <FaExchangeAlt />
              <span className="nav-text">송금 관리</span>
            </div>
            <div className="nav-item" title="사용자 관리">
              <FaUsers />
              <span className="nav-text">사용자 관리</span>
            </div>
            <div className="nav-item" title="공지사항">
              <FaBullhorn />
              <span className="nav-text">공지사항</span>
            </div>
            <div className="nav-item" title="Q&A">
              <FaComments />
              <span className="nav-text">Q&A</span>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <div className="dashboard-grid">
            {/* 송금 통계 - 큰 카드 */}
            <div className="dashboard-card wide">
              <div className="card-header">
                <h3>📊 송금 통계</h3>
              </div>
              <div className="card-content">
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">일간 송금 건수</div>
                    <div className="stat-value">{formatNumber(remittanceStats.dailyCount)}건</div>
                    <div className="stat-subtitle">오늘</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">월간 송금 건수</div>
                    <div className="stat-value">{formatNumber(remittanceStats.monthlyCount)}건</div>
                    <div className="stat-subtitle">이번 달</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">연간 송금 건수</div>
                    <div className="stat-value">{formatNumber(remittanceStats.yearlyCount)}건</div>
                    <div className="stat-subtitle">올해</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">일간 평균 송금액</div>
                    <div className="stat-value">{formatCurrency(remittanceStats.dailyAverageAmount)}원</div>
                    <div className="stat-subtitle">일평균</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">월간 평균 송금액</div>
                    <div className="stat-value">{formatCurrency(remittanceStats.monthlyAverageAmount)}원</div>
                    <div className="stat-subtitle">월평균</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">연간 평균 송금액</div>
                    <div className="stat-value">{formatCurrency(remittanceStats.yearlyAverageAmount)}원</div>
                    <div className="stat-subtitle">연평균</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">일간 최고 송금액</div>
                    <div className="stat-value">{formatCurrency(remittanceStats.dailyMaxAmount)}원</div>
                    <div className="stat-subtitle">오늘</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">월간 최고 송금액</div>
                    <div className="stat-value">{formatCurrency(remittanceStats.monthlyMaxAmount)}원</div>
                    <div className="stat-subtitle">이번 달</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">연간 최고 송금액</div>
                    <div className="stat-value">{formatCurrency(remittanceStats.yearlyMaxAmount)}원</div>
                    <div className="stat-subtitle">올해</div>
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
                        dataKey="day" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6c757d' }}
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
              <div className="card-header">
                <h3>💱 환율 통계</h3>
              </div>
              <div className="card-content">
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">전체 국가</div>
                    <div className="stat-value">{exchangeRateData.totalCountries}개</div>
                    <div className="stat-subtitle">환율 제공 국가</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">송금 가능 국가</div>
                    <div className="stat-value">{exchangeRateData.availableCountries}개</div>
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
                    {exchangeRateData.topFavorites.map((item, index) => (
                      <div key={item.currency} className="currency-item">
                        <span className="currency-rank">{index + 1}</span>
                        <span className="currency-code">{item.currency} ({item.country})</span>
                        <span className="currency-count">{item.count}개</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 사용자 통계 - 중간 카드 */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3>👥 사용자 통계</h3>
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
                    <div className="stat-subtitle">최근 30일</div>
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

            {/* Q&A 미답변 - 작은 카드 */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3>❓ Q&A 미답변</h3>
                <button className="more-button">더보기</button>
              </div>
              <div className="card-content">
                {qnaStats.pendingCount > 0 ? (
                  <>
                    <div className="qna-list">
                      {qnaStats.pendingList.map((item: any) => (
                        <div key={item.id} className="qna-item">
                          <div className="qna-info">
                            <div className="qna-title">{item.title}</div>
                            <div className="qna-date">{item.date}</div>
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 