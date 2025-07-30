import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { clearAuthAtom } from '../store/authStore';

const AuthFailure = () => {
  const [, clearAuth] = useAtom(clearAuthAtom);

  const handleAuthFailure = () => {
    clearAuth();
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  };

  useEffect(() => {
    handleAuthFailure();
  }, [clearAuth]);

  return (
    <div className="auth-failure">
      <div className="auth-message">
        <h2>로그인 실패</h2>
        <p>로그인 중 문제가 발생했습니다</p>
        <p>잠시 후 다시 시도해주세</p>
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default AuthFailure; 