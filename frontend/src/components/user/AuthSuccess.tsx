import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthSuccessProps {
  handleUserAuthSuccess: () => Promise<boolean>;
}

const AuthSuccess = ({ handleUserAuthSuccess }: AuthSuccessProps) => {
  const navigate = useNavigate();
  
  const handleAuthSuccess = async () => {
    try {
      const success = await handleUserAuthSuccess();
      if (success) {
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Auth success handling failed:', error);
      navigate('/');
    }
  };
  
  useEffect(() => {
    handleAuthSuccess();
  }, [handleUserAuthSuccess]);
  

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