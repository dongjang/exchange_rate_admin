import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { api } from '../services/api';
import { authAtom, setAuthAtom } from '../store/authStore';
import type { User } from '../store/userStore';
import { selectedUserAtom } from '../store/userStore';
import './Header.css';
import { Link } from 'react-router-dom';
import { UserModal } from './UserModal';

interface HeaderProps {
  user: User | null;
  onUserUpdated: () => void;
}

function Header({ user, onUserUpdated }: HeaderProps) {
  const [auth, setAuth] = useAtom(authAtom);
  const [, setAuthState] = useAtom(setAuthAtom);
  const setSelectedUser = useSetAtom(selectedUserAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
      });
      window.location.reload();
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
    <header className="header">
      <div className="header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {isMobile ? (
          <>
            {/* 중앙: 사용자 정보 + 로그아웃 (메뉴 열릴 때는 숨김) */}
            {!isMenuOpen && (
              <div className="header-center-mobile" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', zIndex: 1 }}>
                {user && (
                  <>
                    {user.pictureUrl && (
                      <img
                        src={user.pictureUrl}
                        alt={user.name || user.email}
                        className="user-avatar"
                        style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                        onClick={handleUserNameClick}
                      />
                    )}
                    <span
                      className="user-name"
                      style={{ cursor: 'pointer', fontWeight: 600, marginRight: '0.5rem' }}
                      onClick={handleUserNameClick}
                    >
                      {user.name || user.email}
                    </span>
                  </>
                )}
                <button onClick={handleLogout} className="logout-button" style={{ 
                  marginLeft: user ? '1rem' : undefined,
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(107, 114, 128, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #4b5563 0%, #374151 100%)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(107, 114, 128, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(107, 114, 128, 0.2)';
                }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  로그아웃
                </button>
              </div>
            )}
            {/* 우측: 햄버거 버튼 */}
            <div className="header-right-mobile" style={{ marginLeft: 'auto', position: 'relative', zIndex: 2 }}>
              <button className="hamburger-btn" aria-label="메뉴 열기" onClick={handleMenuToggle}>
                <span className="hamburger-icon" />
              </button>
            </div>
            {/* 모바일 드로어 메뉴(오버레이+슬라이드) */}
            {isMenuOpen && (
              <div className="mobile-menu-overlay" onClick={handleMenuClose}>
                <div className="mobile-menu" onClick={e => e.stopPropagation()}>
                  {/* 닫기 버튼 */}
                  <button className="mobile-menu-close-btn" aria-label="메뉴 닫기" onClick={handleMenuClose}>&times;</button>
                  {/* 사용자 정보 (아바타, 이름) - 클릭 시 모달 */}
                  {user && (
                    <div className="mobile-menu-user" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem', marginTop: '0.2rem', cursor: 'pointer' }} onClick={() => { handleUserNameClick(); handleMenuClose(); }}>
                      {user.pictureUrl && (
                        <img
                          src={user.pictureUrl}
                          alt={user.name || user.email}
                          className="user-avatar"
                          style={{ width: 28, height: 28, marginRight: '0.2rem' }}
                        />
                      )}
                      <span className="user-name" style={{ fontWeight: 600 }}>{user.name || user.email}</span>
                    </div>
                  )}
                  <Link to="/" className="nav-link" onClick={handleMenuClose}>환율 조회</Link>
                  <Link to="/remit/apply" className="nav-link" onClick={handleMenuClose}>송금</Link>
                  <Link to="/remit/history" className="nav-link" onClick={handleMenuClose}>송금 이력</Link>
                  <button onClick={() => { handleLogout(); handleMenuClose(); }} className="logout-button" style={{ 
                    width: '100%',
                    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(107, 114, 128, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    marginTop: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #4b5563 0%, #374151 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(107, 114, 128, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(107, 114, 128, 0.2)';
                  }}
                  >
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
            <a href="/" className="home-button" aria-label="홈으로 이동" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', fontSize: '1.5rem', marginRight: '1.5rem' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#3b82f6" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.3rem', display: 'block' }}>
                <path d="M3 11.5L12 4l9 7.5V19a2 2 0 0 1-2 2h-3.5a.5.5 0 0 1-.5-.5V16a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4.5a.5.5 0 0 1-.5.5H5a2 2 0 0 1-2-2V11.5z" stroke="#2563eb" strokeWidth="1.5"/>
                <path d="M9 22V16a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6" fill="#fff"/>
              </svg>
            </a>
            <div className="header-nav" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginRight: '2rem' }}>
              <Link to="/" className="nav-link">환율 조회</Link>
              <Link to="/remit/apply" className="nav-link">송금</Link>
              <Link to="/remit/history" className="nav-link">송금 이력</Link>
            </div>
            <div className="header-right" style={{ display: 'flex', alignItems: 'center' }}>
              {user && (
                <>
                  {user.pictureUrl && (
                    <img
                      src={user.pictureUrl}
                      alt={user.name || user.email}
                      className="user-avatar"
                      style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                      onClick={handleUserNameClick}
                    />
                  )}
                  <span
                    className="user-name"
                    style={{ cursor: 'pointer', fontWeight: 600 }}
                    onClick={handleUserNameClick}
                  >
                    {user.name || user.email}
                  </span>
                </>
              )}
              <button onClick={handleLogout} className="logout-button" style={{
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.6rem 1.2rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(107, 114, 128, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginLeft: '1rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #4b5563 0%, #374151 100%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(107, 114, 128, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(107, 114, 128, 0.2)';
              }}
              >
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
      <UserModal isOpen={isModalOpen} onClose={handleModalClose} />
    </header>
  );
}

export { Header };
