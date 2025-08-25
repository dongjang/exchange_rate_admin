import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { setAuthAtom } from '../../store/authStore';
import { api } from '../../services/api';

const AuthSuccess =()=> {
  const [, setAuthState] = useAtom(setAuthAtom);

  const handleAuthSuccess = async () => {
    try {
      const successResult = await api.authSuccess();

      if (successResult.success && successResult.user) {
        setAuthState({
          isAuthenticated: true,
          user: successResult.user,
          isLoading: false,
        });
        window.location.href = '/';
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Auth success handling failed:', error);
      window.location.href = '/';
    }
  };

  useEffect(() => {
    handleAuthSuccess();
  }, [setAuthState]);

  return (
    <div className="auth-success">
      <div className="auth-message">
        <h2>로그인 성공!</h2>
        <p>잠시만 기다려주세요...</p>
        <div className="spinner"></div>
      </div>
    </div>
  );
}

export default AuthSuccess; 