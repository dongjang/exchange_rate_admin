import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAtom } from 'jotai';
import { api } from '../../services/api';
import { adminAuthAtom, setAdminAuthAtom, adminInfoAtom, setAdminInfoAtom } from '../../store/adminStore';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    adminId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminAuth] = useAtom(adminAuthAtom);
  const [, setAdminAuth] = useAtom(setAdminAuthAtom);
  const [, setAdminInfo] = useAtom(setAdminInfoAtom);

  // 이미 로그인된 관리자 체크
  useEffect(() => {
    if (adminAuth.isAuthenticated) {
      navigate('/admin');
    }
  }, [adminAuth.isAuthenticated, navigate]);

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
    
    if (!formData.adminId || !formData.password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.adminLogin(formData);
      
      if (response.success) {

        // 관리자 정보 설정
        setAdminInfo(response.admin);
        setAdminAuth({ isAuthenticated: true, isLoading: false });
        navigate('/admin');
      } else {
        setError(response.message || '로그인에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.아이디와 비밀번호를 확인해 주세요.');
    } finally {
      setLoading(false);
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
            <label htmlFor="adminId">아이디</label>
            <input
              type="text"
              id="adminId"
              name="adminId"
              value={formData.adminId}
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


