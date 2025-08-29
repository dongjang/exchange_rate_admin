import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { api } from '../../services/api';
import { adminInfoAtom } from '../../store/adminStore';
import './AdminAdminModal.css';
import Swal from 'sweetalert2';

interface AdminAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminId: number | null;
  onAdminUpdated: () => void;
}

function AdminAdminModal({ isOpen, onClose, adminId, onAdminUpdated }: AdminAdminModalProps) {
  const [adminInfo] = useAtom(adminInfoAtom);
  const [formData, setFormData] = useState({
    adminId: '',
    password: '',
    name: '',
    email: '',
    role: 'ADMIN',
    status: 'ACTIVE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backdropClicked, setBackdropClicked] = useState(false);
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState('');
  const [idCheckLoading, setIdCheckLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    hasNumber: false,
    hasSpecial: false,
    hasUpper: false,
    hasLower: false
  });

  // 현재 로그인한 관리자가 본인 정보를 수정하는지 확인
  const isEditingSelf = adminId === adminInfo?.id;

  // 비밀번호 유효성 검사 함수
  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 8 && password.length <= 10,
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password)
    });
  };

  // 아이디 유효성 검사 함수
  const validateAdminId = (adminId: string) => {
    return adminId.length >= 4 && adminId.length <= 20 && /^[a-zA-Z0-9_]+$/.test(adminId);
  };

  const isEditMode = Boolean(adminId);

  useEffect(() => {
    if (adminId && isOpen) {
      fetchAdminData();
    } else if (!adminId && isOpen) {
      // 새로 등록하는 경우 폼 초기화
      setFormData({
        adminId: '',
        password: '',
        name: '',
        email: '',
        role: 'ADMIN',
        status: 'ACTIVE'
      });
      setConfirmPassword('');
      setIsIdChecked(false);
      setIdCheckMessage('');
      setPasswordValidation({
        length: false,
        hasNumber: false,
        hasSpecial: false,
        hasUpper: false,
        hasLower: false
      });
    }
  }, [adminId, isOpen]);

  const fetchAdminData = async () => {
    if (!adminId) return;
    
    try {
      setLoading(true);
      const admin = await api.getAdminById(adminId);
      setFormData({
        adminId: admin.adminId,
        password: '', // 수정 시에는 비밀번호를 보여주지 않음
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status
      });
    } catch (err) {
      console.error('관리자 정보 조회 실패:', err);
      setError('관리자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleIdCheck = async () => {
    // 아이디 입력 여부 확인
    if (!formData.adminId || !formData.adminId.trim()) {
      setIdCheckMessage('아이디를 입력해주세요.');
      return;
    }

    // 아이디 형식 검증
    if (!validateAdminId(formData.adminId)) {
      setIdCheckMessage('아이디는 4~20자의 영문, 숫자, 언더스코어만 사용 가능합니다.');
      return;
    }

    setIdCheckLoading(true);
    try {
      const isDuplicate = await api.checkAdminIdDuplicate(formData.adminId);
      if (isDuplicate) {
        setIdCheckMessage('이미 사용 중인 아이디입니다.');
        setIsIdChecked(false);
      } else {
        setIdCheckMessage('사용 가능한 아이디입니다.');
        setIsIdChecked(true);
      }
    } catch (err) {
      setIdCheckMessage('아이디 중복 확인에 실패했습니다.');
      setIsIdChecked(false);
    } finally {
      setIdCheckLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'adminId') {
      setIsIdChecked(false);
      setIdCheckMessage('');
    }
    
    if (name === 'password') {
      validatePassword(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 필수 필드 검증
    if (!formData.adminId || !formData.name || !formData.email) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }

    // 등록 시 비밀번호 필수
    if (!isEditMode && !formData.password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    // 등록 시 아이디 중복 확인 필수
    if (!isEditMode && !isIdChecked) {
      setError('아이디 중복 확인을 해주세요.');
      return;
    }

    // 비밀번호가 입력된 경우 비밀번호 확인 필수
    if (formData.password && formData.password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호가 입력된 경우 유효성 검사
    if (formData.password) {
      const isPasswordValid = Object.values(passwordValidation).every(Boolean);
      if (!isPasswordValid) {
        setError('비밀번호는 8~10자이며, 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다.');
        return;
      }
    }

    const result = await Swal.fire({
      icon: 'question',
      title: isEditMode ? '수정하시겠습니까?' : '등록하시겠습니까?',
      text: isEditMode ? '관리자 정보를 수정하시겠습니까?' : '새로운 관리자를 등록하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: isEditMode ? '수정' : '등록',
      cancelButtonText: '취소',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#d1d5db',
      customClass: {
        popup: 'swal2-popup-high-zindex'
      }
    });
    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      if (isEditMode && adminId) {
        // 수정 모드
        const updateData = { ...formData };
        if (!updateData.password) {
          delete (updateData as any).password; // 비밀번호가 비어있으면 제외
        }
        await api.updateAdmin(adminId, updateData);
      } else {
        // 등록 모드
        await api.createAdmin(formData);
      }
      
      handleClose();
      onAdminUpdated();
      
      // 성공 메시지 표시
      await Swal.fire({
        icon: 'success',
        title: '완료',
        text: isEditMode ? '관리자 정보가 성공적으로 수정되었습니다.' : '관리자가 성공적으로 등록되었습니다.',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'swal2-popup-high-zindex'
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save admin');
      Swal.fire({
        icon: 'error',
        title: '실패',
        text: isEditMode ? '관리자 정보 수정에 실패했습니다.' : '관리자 등록에 실패했습니다.',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'swal2-popup-high-zindex'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      adminId: '',
      password: '',
      name: '',
      email: '',
      role: 'ADMIN',
      status: 'ACTIVE'
    });
    setConfirmPassword('');
    setError(null);
    setIsIdChecked(false);
    setIdCheckMessage('');
    setPasswordValidation({
      length: false,
      hasNumber: false,
      hasSpecial: false,
      hasUpper: false,
      hasLower: false
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="admin-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setBackdropClicked(true);
      }}
      onMouseUp={(e) => {
        if (e.target === e.currentTarget && backdropClicked) {
          setBackdropClicked(false);
          handleClose();
        }
      }}
    >
      <div
        className="admin-modal-card"
        style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
              {isEditMode ? '관리자 정보 수정' : '관리자 등록'}
            </h2>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '0.25rem',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="admin-form admin-modal-form-fancy">
            <div className="form-group">
              <label htmlFor="adminId">아이디 *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  id="adminId"
                  name="adminId"
                  value={formData.adminId}
                  onChange={handleChange}
                  required
                  className="admin-modal-input"
                  disabled={isEditMode}
                  autoComplete='off'
                  style={{ flex: 1 }}
                />
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={handleIdCheck}
                    disabled={idCheckLoading || !formData.adminId || !validateAdminId(formData.adminId)}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: idCheckLoading || !formData.adminId || !validateAdminId(formData.adminId) ? '#d1d5db' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: idCheckLoading || !formData.adminId || !validateAdminId(formData.adminId) ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {idCheckLoading ? '확인중...' : '중복확인'}
                  </button>
                )}
              </div>
              {idCheckMessage && (
                <div style={{
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                  color: isIdChecked ? '#059669' : '#dc2626'
                }}>
                  {idCheckMessage}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호1 {!isEditMode && '*'}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditMode}
                className="admin-modal-input"
                autoComplete='new-password'
                placeholder={isEditMode ? '변경하지 않으려면 비워두세요' : ''}
              />
              {formData.password && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  <div style={{ color: passwordValidation.length ? '#059669' : '#dc2626' }}>
                    ✓ 8~10자
                  </div>
                  <div style={{ color: passwordValidation.hasUpper ? '#059669' : '#dc2626' }}>
                    ✓ 영문 대문자
                  </div>
                  <div style={{ color: passwordValidation.hasLower ? '#059669' : '#dc2626' }}>
                    ✓ 영문 소문자
                  </div>
                  <div style={{ color: passwordValidation.hasNumber ? '#059669' : '#dc2626' }}>
                    ✓ 숫자
                  </div>
                  <div style={{ color: passwordValidation.hasSpecial ? '#059669' : '#dc2626' }}>
                    ✓ 특수문자
                  </div>
                </div>
              )}
            </div>

            {formData.password && (
              <div className="form-group">
                <label htmlFor="confirmPassword">비밀번호 확인 *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="admin-modal-input"
                  autoComplete='new-password'
                />
                {confirmPassword && (
                  <div style={{
                    fontSize: '0.875rem',
                    marginTop: '0.25rem',
                    color: formData.password === confirmPassword ? '#059669' : '#dc2626'
                  }}>
                    {formData.password === confirmPassword ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">관리자명 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="admin-modal-input"
                autoComplete='off'
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일 *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="admin-modal-input"
                autoComplete='off'
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">권한 *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="admin-modal-input"
                disabled={isEditingSelf}
              >
                <option value="ADMIN">일반 관리자</option>
                <option value="SUPER_ADMIN">최고 관리자</option>
              </select>
              {isEditingSelf && (
                <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: '#6b7280' }}>
                  본인 정보 수정 시에는 권한을 변경할 수 없습니다.
                </div>
              )}
            </div>

            {isEditMode && (
              <div className="form-group">
                <label htmlFor="status">상태 *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="admin-modal-input"
                  disabled={isEditingSelf}
                >
                  <option value="ACTIVE">활성</option>
                  <option value="INACTIVE">비활성</option>
                </select>
                {isEditingSelf && (
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: '#6b7280' }}>
                    본인 정보 수정 시에는 상태를 변경할 수 없습니다.
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="error-message" style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {error}
              </div>
            )}

            <div className="form-actions" style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={handleClose}
                className="cancel-button"
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="submit-button"
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#2563eb')}
                onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#3b82f6')}
              >
                {loading ? '처리중...' : (isEditMode ? '수정' : '등록')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminAdminModal;


