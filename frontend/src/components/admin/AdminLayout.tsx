import React, { useState } from 'react';
import { FaExchangeAlt, FaSignOutAlt, FaBars, FaTimes, FaChartLine, FaUsers, FaBullhorn, FaComments, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaGlobe } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { api } from '../../services/api';
import { adminInfoAtom, clearAdminAuthAtom } from '../../store/adminStore';
import AdminAdminModal from './AdminAdminModal';
import Swal from 'sweetalert2';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
  admin?: any;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, admin }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMenuAnimating, setIsMenuAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminInfo] = useAtom(adminInfoAtom);
  const [, clearAdminAuth] = useAtom(clearAdminAuthAtom);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // 모바일 감지
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true); // 모바일에서는 기본적으로 접힌 상태
        setIsMenuOpen(false); // 모바일에서는 메뉴도 닫힌 상태
      } else {
        setSidebarCollapsed(false); // 데스크톱에서는 기본적으로 펼쳐진 상태
        setIsMenuOpen(false); // 데스크톱에서는 모바일 메뉴 닫기
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: 'question',
      title: '로그아웃',
      text: '정말 로그아웃 하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '로그아웃',
      cancelButtonText: '취소',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    });

    if (result.isConfirmed) {
      try {
        await api.adminLogout();
        clearAdminAuth();
        navigate('/admin');
      } catch (error) {
        console.error('관리자 로그아웃 실패:', error);
        // 에러가 발생해도 클라이언트 상태는 초기화
        clearAdminAuth();
        navigate('/admin');
      }
    }
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    if (isMobile) {
      // 모바일에서는 모바일 메뉴 토글
      if (isMenuOpen) {
        // 메뉴를 닫을 때 - 즉시 상태 변경
        setIsMenuOpen(false);
        setIsMenuAnimating(true);
        setTimeout(() => {
          setIsMenuAnimating(false);
        }, 250);
      } else {
        // 메뉴를 열 때
        setIsMenuOpen(true);
        setIsMenuAnimating(false);
      }
    } else {
      // 데스크톱에서는 사이드바 토글
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleMenuClose = () => {
    // 즉시 메뉴 상태를 닫힘으로 변경
    setIsMenuOpen(false);
    setIsMenuAnimating(true);
    setTimeout(() => {
      setIsMenuAnimating(false);
    }, 250);
  };

  const handleAnimationEnd = () => {
    if (isMenuAnimating) {
      setIsMenuAnimating(false);
    }
  };

  // 전체 페이지 클릭 이벤트 처리
  React.useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (isMobile && isMenuOpen) {
        const target = e.target as HTMLElement;
        const isMenuButton = target.closest('.sidebar-toggle');
        const isMenuContainer = target.closest('.mobile-menu');
        const isHeader = target.closest('.admin-header');
        
        // 헤더 외부를 클릭했을 때만 메뉴를 닫음
        if (!isHeader && !isMenuButton && !isMenuContainer) {
          handleMenuClose();
        }
      }
    };

    // 약간의 지연을 두어 햄버거 버튼 클릭 이벤트가 먼저 처리되도록 함
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleDocumentClick);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isMobile, isMenuOpen]);

  const getActiveNavItem = () => {
    const path = location.pathname;
    if (path === '/admin') return 'dashboard';
    if (path === '/admin/remittance') return 'remittance';
    if (path === '/admin/countries-banks') return 'countries-banks';
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
        <div className="admin-header-left">
          <button 
            className={`sidebar-toggle ${!sidebarCollapsed ? 'close' : ''}`}
            onClick={handleMenuToggle}
          >
            {isMobile ? (
              isMenuOpen ? <FaTimes /> : <FaBars />
            ) : (
              !sidebarCollapsed ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight />
            )}
          </button>
          <h1 className="admin-title" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>대시보드</h1>
        </div>
        
        {/* 데스크톱 헤더 우측 */}
        <div className="admin-header-right" style={{ display: isMobile ? 'none' : 'flex' }}>
          <span 
            className="admin-user" 
            onClick={() => setIsAdminModalOpen(true)}
            style={{ 
              cursor: 'pointer', 
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {adminInfo?.name || 'Admin'} ({adminInfo?.role === 'SUPER_ADMIN' ? '최고 관리자' : '일반 관리자'})
          </span>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>로그아웃</span>
          </button>
        </div>

        {/* 모바일 헤더 우측 */}
        <div className="mobile-header-right" style={{ display: isMobile ? 'flex' : 'none', alignItems: 'center', gap: '1rem' }}>
          <span 
            className="mobile-admin-user" 
            onClick={() => setIsAdminModalOpen(true)}
            style={{ 
              cursor: 'pointer', 
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              transition: 'background-color 0.2s ease',
              fontSize: '0.9rem',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {adminInfo?.name || 'Admin'} ({adminInfo?.role === 'SUPER_ADMIN' ? '최고 관리자' : '일반 관리자'})
          </span>
          <button 
            className="mobile-admin-logout-btn" 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'background-color 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <FaSignOutAlt />
            <span>로그아웃</span>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobile && (isMenuOpen || isMenuAnimating) && (
          <div 
            className={`mobile-menu ${isMenuAnimating ? 'slide-up' : 'slide-down'}`}
            onAnimationEnd={handleAnimationEnd}
          >
                          <div 
                className={`mobile-nav-item ${activeNavItem === 'dashboard' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/admin');
                  handleMenuClose();
                }}
              >
                <FaChartLine />
                <span>대시보드</span>
              </div>
                             <div 
                 className={`mobile-nav-item ${activeNavItem === 'remittance' ? 'active' : ''}`}
                 onClick={() => {
                   navigate('/admin/remittance');
                   handleMenuClose();
                 }}
               >
                 <FaExchangeAlt />
                 <span>송금 관리</span>
               </div>
               <div 
                 className={`mobile-nav-item ${activeNavItem === 'countries-banks' ? 'active' : ''}`}
                 onClick={() => {
                   navigate('/admin/countries-banks');
                   handleMenuClose();
                 }}
               >
                 <FaGlobe />
                 <span>국가/은행 관리</span>
               </div>
               <div 
                 className={`mobile-nav-item ${activeNavItem === 'users' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/admin/users');
                  handleMenuClose();
                }}
              >
                <FaUsers />
                <span>계정 관리</span>
              </div>
              <div 
                className={`mobile-nav-item ${activeNavItem === 'notices' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/admin/notices');
                  handleMenuClose();
                }}
              >
                <FaBullhorn />
                <span>공지사항</span>
              </div>
              <div 
                className={`mobile-nav-item ${activeNavItem === 'qna' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/admin/qna');
                  handleMenuClose();
                }}
              >
                <FaComments />
                <span>Q&A</span>
              </div>
            </div>
          )}
      </header>

      <div className="admin-container">
        
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ display: isMobile ? 'none' : 'block' }}>
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
               className={`nav-item ${activeNavItem === 'countries-banks' ? 'active' : ''}`} 
               title="국가/은행 관리"
               onClick={() => {
                 navigate('/admin/countries-banks');
                 if (isMobile) setSidebarCollapsed(true);
               }}
             >
               <FaGlobe />
               <span className="nav-text">국가/은행 관리</span>
             </div>

             <div 
               className={`nav-item ${activeNavItem === 'users' ? 'active' : ''}`}  
              title="계정 관리"
              onClick={() => {
                navigate('/admin/users');
                if (isMobile) setSidebarCollapsed(true);
              }}
            >
              <FaUsers />
              <span className="nav-text">계정 관리</span>
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

      {/* 관리자 정보 수정 모달 */}
      <AdminAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        adminId={adminInfo?.id || null}
        onAdminUpdated={() => {
          // Swal 메시지가 표시된 후 페이지를 새로고침
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }}
      />
    </div>
  );
};

export default AdminLayout; 