import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { api } from '../../services/api';
import { adminAuthAtom, setAdminAuthAtom } from '../../store/adminStore';
import type { User } from '../../store/userStore';
import { selectedUserAtom } from '../../store/userStore';
import './AdminHeader.css';
import { Link } from 'react-router-dom';


interface AdminHeaderProps {
  user: User | null;
  onUserUpdated: () => void;
}

function AdminHeader({ user, onUserUpdated }: AdminHeaderProps) {
  const [, setAdminAuthState] = useAtom(setAdminAuthAtom);
  const setSelectedUser = useSetAtom(selectedUserAtom);
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: 'question',
      title: '로그아웃 하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '로그아웃',
      cancelButtonText: '취소',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#d1d5db',
    });
    if (!result.isConfirmed) return;
    try {
      await api.logout();
      setAdminAuthState({
        isAuthenticated: false,
        isLoading: false,
      });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleUserNameClick = () => {
    if (!user) return;
    setSelectedUser({
      id: user.id,
      email: user.email,
      name: user.name,
      pictureUrl: user.pictureUrl,
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    onUserUpdated(); // App에서 user를 갱신하도록 콜백 호출
  };

  const handleMenuToggle = () => setIsMenuOpen((open) => !open);
  const handleMenuClose = () => setIsMenuOpen(false);

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        {isMobile ? (
          <>
            {/* 좌측: 홈 버튼 */}
            <a href="/" className="admin-home-button" aria-label="홈으로 이동">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 11.5L12 4l9 7.5V19a2 2 0 0 1-2 2h-3.5a.5.5 0 0 1-.5-.5V16a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4.5a.5.5 0 0 1-.5.5H5a2 2 0 0 1-2-2V11.5z" stroke="#2563eb" strokeWidth="1.5"/>
                <path d="M9 22V16a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6" fill="#fff"/>
              </svg>
            </a>
            
            {/* 중앙: 사용자 정보 */}
            <div className="admin-header-center-mobile">
              {user && (
                <div className="admin-user-info-mobile" onClick={handleUserNameClick}>
                  {user.pictureUrl && (
                    <img
                      src={user.pictureUrl}
                      alt={user.name || user.email}
                      className="admin-user-avatar"
                    />
                  )}
                  <span className="admin-user-name">
                    {user.name || user.email}
                  </span>
                </div>
              )}
            </div>
            
            {/* 우측: 햄버거 버튼 */}
            <div className="admin-header-right-mobile">
              <button className="admin-hamburger-btn" aria-label="메뉴 열기" onClick={handleMenuToggle}>
                <span className="admin-hamburger-icon" />
              </button>
            </div>
            
            {/* 모바일 드롭다운 메뉴 */}
            {isMenuOpen && (
              <div className="admin-mobile-dropdown-overlay" onClick={handleMenuClose}>
                <div className="admin-mobile-dropdown-menu" onClick={e => e.stopPropagation()}>
                  <Link to="/admin/remittance" className="admin-nav-link" onClick={handleMenuClose}>송금 이력 관리</Link>
                  <Link to="/admin/remittance-limits" className="admin-nav-link" onClick={handleMenuClose}>송금 한도 관리</Link>
                  <button onClick={() => { handleLogout(); handleMenuClose(); }} className="admin-logout-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16,17 21,12 16,7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <a href="/" className="admin-home-button" aria-label="홈으로 이동">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#3b82f6" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 11.5L12 4l9 7.5V19a2 2 0 0 1-2 2h-3.5a.5.5 0 0 1-.5-.5V16a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4.5a.5.5 0 0 1-.5.5H5a2 2 0 0 1-2-2V11.5z" stroke="#2563eb" strokeWidth="1.5"/>
                <path d="M9 22V16a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6" fill="#fff"/>
              </svg>
            </a>
            <div className="admin-header-nav">
              <Link to="/admin/remittance" className="admin-nav-link">송금 이력 관리</Link>
              <Link to="/admin/remittance-limits" className="admin-nav-link">송금 한도 관리</Link>
            </div>
            <div className="admin-header-user">
              {user && (
                <>
                  {user.pictureUrl && (
                    <img
                      src={user.pictureUrl}
                      alt={user.name || user.email}
                      className="admin-user-avatar"
                      onClick={handleUserNameClick}
                    />
                  )}
                  <span
                    className="admin-user-name"
                    onClick={handleUserNameClick}
                  >
                    {user.name || user.email}
                  </span>
                </>
              )}
              <button onClick={handleLogout} className="admin-logout-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                로그아웃
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export { AdminHeader };
