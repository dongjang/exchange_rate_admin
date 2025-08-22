import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaEye, FaEyeSlash } from 'react-icons/fa';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 에러 메시지 초기화
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: 실제 관리자 로그인 API 호출
      // const response = await api.adminLogin(formData);
      
      // 임시로 성공 처리 (나중에 실제 API로 교체)
      setTimeout(() => {
        setLoading(false);
        navigate('/admin');
      }, 1000);
      
    } catch (err) {
      setLoading(false);
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-icon">
            <FaUserShield />
          </div>
          <h1 className="admin-login-title">관리자 로그인</h1>
          <p className="admin-login-subtitle">관리자 계정으로 로그인하세요</p>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="input-group">
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="관리자 아이디를 입력하세요"
              disabled={loading}
              className="admin-input"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="비밀번호를 입력하세요"
                disabled={loading}
                className="admin-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                disabled={loading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="admin-login-btn"
          >
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : (
              '로그인'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;


