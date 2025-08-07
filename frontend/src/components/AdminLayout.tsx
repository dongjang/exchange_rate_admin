import React, { useState } from 'react';
import { FaExchangeAlt, FaSignOutAlt, FaBars, FaChartLine, FaUsers, FaBullhorn, FaComments } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
  user?: any;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 감지
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true); // 모바일에서는 기본적으로 접힌 상태
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.logout();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const getActiveNavItem = () => {
    const path = location.pathname;
    if (path === '/admin') return 'dashboard';
    if (path === '/admin/remittance') return 'remittance';
    if (path === '/admin/users') return 'users';
    if (path === '/admin/notices') return 'notices';
    if (path === '/admin/qna') return 'qna';
    return 'dashboard';
  };

  const activeNavItem = getActiveNavItem();

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
          <h1 className="admin-title" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>대시보드</h1>
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
        {/* Mobile Overlay */}
        {isMobile && !sidebarCollapsed && (
          <div 
            className="mobile-overlay"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className="sidebar-nav">
            <div 
              className={`nav-item ${activeNavItem === 'dashboard' ? 'active' : ''}`} 
              title="대시보드" 
              onClick={() => {
                navigate('/admin');
                if (isMobile) setSidebarCollapsed(true);
              }}
            >
              <FaChartLine />
              <span className="nav-text">대시보드</span>
            </div>
            <div 
              className={`nav-item ${activeNavItem === 'remittance' ? 'active' : ''}`} 
              title="송금 관리"
              onClick={() => {
                navigate('/admin/remittance');
                if (isMobile) setSidebarCollapsed(true);
              }}
            >
              <FaExchangeAlt />
              <span className="nav-text">송금 관리</span>
            </div>

            <div 
              className={`nav-item ${activeNavItem === 'users' ? 'active' : ''}`} 
              title="사용자 관리"
              onClick={() => {
                navigate('/admin/users');
                if (isMobile) setSidebarCollapsed(true);
              }}
            >
              <FaUsers />
              <span className="nav-text">사용자 관리</span>
            </div>
            <div 
              className={`nav-item ${activeNavItem === 'notices' ? 'active' : ''}`} 
              title="공지사항"
              onClick={() => {
                navigate('/admin/notices');
                if (isMobile) setSidebarCollapsed(true);
              }}
            >
              <FaBullhorn />
              <span className="nav-text">공지사항</span>
            </div>
            <div 
              className={`nav-item ${activeNavItem === 'qna' ? 'active' : ''}`} 
              title="Q&A"
              onClick={() => {
                navigate('/admin/qna');
                if (isMobile) setSidebarCollapsed(true);
              }}
            >
              <FaComments />
              <span className="nav-text">Q&A</span>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 