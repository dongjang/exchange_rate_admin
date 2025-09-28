import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { FaHome, FaArrowLeft } from 'react-icons/fa';
import { adminInfoAtom, adminAuthAtom } from '../../store/adminStore';
import { api } from '../../services/api';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminInfo] = useAtom(adminInfoAtom);
  const [adminAuth] = useAtom(adminAuthAtom);

  const handleHomeClick = () => {
   
    // App.tsx와 동일한 방식으로 admin 페이지 판별
    const validAdminPaths = ['/', '/remittance', '/countries-banks', '/users', '/notices', '/qna'];
    const isAdminPage = validAdminPaths.includes(location.pathname) || location.pathname.startsWith('/');

    // admin 페이지인 경우 관리자 로그인 상태 확인
    if (isAdminPage) {

      if (adminInfo) {

        // 관리자 로그인된 상태면 /admin으로 이동
        navigate('/');
      } else {
        // 관리자 로그인 안된 상태면 사용자 홈으로 이동
        navigate('/');
      }
    } else {
      // admin 페이지가 아니면 사용자 홈으로 이동
      navigate('/');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      width: '100%'
    }}>
      <div style={{
        fontSize: '8rem',
        fontWeight: 'bold',
        color: '#3b82f6',
        marginBottom: '1rem'
      }}>
        404
      </div>
      
      <h1 style={{
        fontSize: '2rem',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '1rem'
      }}
      className='not-found-h1'
      >
        페이지를 찾을 수 없습니다
      </h1>
      
      <p style={{
        fontSize: '1.1rem',
        color: '#6b7280',
        marginBottom: '2rem',
        maxWidth: '500px'
      }}
      className='not-found-text'
      >
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        <br />
        URL을 다시 확인해주세요.
      </p>
      
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          className='not-found-button'
        >
          <FaArrowLeft />
          이전 페이지
        </button>
        
        <button
          onClick={handleHomeClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          className='not-found-button'
        >
          <FaHome />
          홈으로 이동
        </button>
      </div>
    </div>
  );
};

export default NotFound;
