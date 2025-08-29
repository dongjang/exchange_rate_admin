import React, { useState, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { adminInfoAtom, setAdminAuthAtom } from '../../store/adminStore';
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
  const [, setAdminAuthState] = useAtom(setAdminAuthAtom);
  const navigate = useNavigate();
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
      setIdCheckMessage('아이디는 4~20자의 영문, 숫자, 언더스코어(_)만 사용 가능합니다.');
      return;
    }

    setIdCheckLoading(true);
    try {
      const response = await api.checkAdminIdDuplicate(formData.adminId);
      if (response.duplicate) {
        setIdCheckMessage('이미 사용 중인 아이디입니다.');
        setIsIdChecked(false);
      } else {
        setIdCheckMessage('사용 가능한 아이디입니다.');
        setIsIdChecked(true);
      }
    } catch (err) {
      setIdCheckMessage('중복 확인 중 오류가 발생했습니다.');
      setIsIdChecked(false);
    } finally {
      setIdCheckLoading(false);
    }
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
      
      // 비밀번호가 변경되었고, 본인 정보를 수정한 경우 로그아웃 처리
      if (isEditMode && isEditingSelf && formData.password) {
        await Swal.fire({
          icon: 'info',
          title: '비밀번호 변경 완료',
          text: '비밀번호가 변경되었습니다. 다시 로그인해 주세요.',
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'swal2-popup-high-zindex'
          }
        });
        
        // 로그아웃 처리
        try {
          await api.adminLogout();
          setAdminAuthState({
            isAuthenticated: false,
            isLoading: false,
          });
          navigate('/admin');
        } catch (error) {
          console.error('Logout failed:', error);
        }
      } else {
        // 일반적인 성공 메시지 표시
        await Swal.fire({
          icon: 'success',
          title: '완료',
          text: isEditMode ? '관리자 정보가 성공적으로 수정되었습니다.' : '관리자가 성공적으로 등록되었습니다.',
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'swal2-popup-high-zindex'
          }
        });
        
        // 메시지 확인 후 모달 닫기와 콜백 실행
        handleClose();
        onAdminUpdated();
      }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 아이디가 변경되면 중복 확인 상태 초기화
    if (name === 'adminId') {
      setIsIdChecked(false);
      setIdCheckMessage('');
    }

         // 비밀번호가 변경되면 유효성 검사 실행 및 비밀번호 확인 초기화
     if (name === 'password') {
       validatePassword(value);
       setConfirmPassword(''); // 비밀번호가 변경되면 확인 필드 초기화
     }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div
      className="admin-modal-backdrop"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,41,59,0.48)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        className="admin-modal-card"
        style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(30,41,59,0.13)', minWidth: 400, maxWidth: 500, width: '100%', padding: '2.2rem 2rem 1.5rem 2rem', position: 'relative' }}
      >
        <button className="close-button admin-modal-close-fancy admin-modal-close-float" onClick={handleClose} aria-label="닫기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="admin-modal-header-fancy" style={{ justifyContent: 'center', borderBottom: 'none', background: 'none', padding: '0 0 10px 0' }}>
          <h2 className="admin-modal-title" style={{ color: '#222', fontWeight: 700 }}>
            {isEditMode ? '관리자 상세' : '관리자 등록'}
          </h2>
        </div>
        <div className="admin-modal-divider"></div>

        <form onSubmit={handleSubmit} className="admin-form admin-modal-form-fancy">
          <div className="form-group">
            <label htmlFor="adminId">관리자 아이디 *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                id="adminId"
                name="adminId"
                value={formData.adminId}
                onChange={handleChange}
                placeholder="4~20자의 영문, 숫자, 언더스코어(_)"
                required
                disabled={isEditMode} // 수정 시에는 아이디 변경 불가
                className="admin-modal-input"
                autoComplete='off'
                style={{ flex: 1 }}
                maxLength={20}
              />
                             {!isEditMode && (
                 <button
                   type="button"
                   onClick={handleIdCheck}
                   disabled={idCheckLoading || !formData.adminId || !formData.adminId.trim()}
                   style={{
                     padding: '8px 16px',
                     backgroundColor: idCheckLoading || !formData.adminId || !formData.adminId.trim() ? '#9ca3af' : '#3b82f6',
                     color: 'white',
                     border: 'none',
                     borderRadius: '6px',
                     cursor: idCheckLoading || !formData.adminId || !formData.adminId.trim() ? 'not-allowed' : 'pointer',
                     fontSize: '12px',
                     whiteSpace: 'nowrap'
                   }}
                 >
                   {idCheckLoading ? '확인중...' : '중복확인'}
                 </button>
               )}
            </div>
            {idCheckMessage && (
              <div style={{
                fontSize: '12px',
                marginTop: '4px',
                color: isIdChecked ? '#10b981' : '#ef4444'
              }}>
                {idCheckMessage}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              비밀번호 {!isEditMode && '*'}
              {isEditMode && <span style={{ fontSize: '0.8em', color: '#666' }}> (변경 시에만 입력)</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="8~10자, 영문 대/소문자, 숫자, 특수문자 포함"
              required={!isEditMode}
              className="admin-modal-input"
              autoComplete='off'
              maxLength={10}
            />
                         {formData.password && (
               <div style={{ marginTop: '8px', fontSize: '12px' }}>
                 <div style={{ color: passwordValidation.length ? '#10b981' : '#ef4444' }}>
                   ✓ 8~10자 길이 {passwordValidation.length ? '✓' : '✗'}
                 </div>
                 <div style={{ color: passwordValidation.hasNumber ? '#10b981' : '#ef4444' }}>
                   ✓ 숫자 포함 {passwordValidation.hasNumber ? '✓' : '✗'}
                 </div>
                 <div style={{ color: passwordValidation.hasSpecial ? '#10b981' : '#ef4444' }}>
                   ✓ 특수문자 포함 {passwordValidation.hasSpecial ? '✓' : '✗'}
                 </div>
                 <div style={{ color: passwordValidation.hasUpper ? '#10b981' : '#ef4444' }}>
                   ✓ 대문자 포함 {passwordValidation.hasUpper ? '✓' : '✗'}
                 </div>
                 <div style={{ color: passwordValidation.hasLower ? '#10b981' : '#ef4444' }}>
                   ✓ 소문자 포함 {passwordValidation.hasLower ? '✓' : '✗'}
                 </div>
               </div>
             )}
          </div>

                     {(formData.password || !isEditMode) && (
             <div className="form-group">
               <label htmlFor="confirmPassword">비밀번호 확인 {!isEditMode && '*'}</label>
               <input
                 type="password"
                 id="confirmPassword"
                 name="confirmPassword"
                 value={confirmPassword}
                 onChange={handleConfirmPasswordChange}
                 placeholder="비밀번호를 다시 입력해주세요"
                 required={formData.password ? true : false}
                 className="admin-modal-input"
                 autoComplete='off'
                 maxLength={10}
               />
               {confirmPassword && (
                 <div style={{
                   fontSize: '12px',
                   marginTop: '4px',
                   color: formData.password === confirmPassword ? '#10b981' : '#ef4444'
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
               disabled={adminId === adminInfo?.id && adminInfo?.role !== 'SUPER_ADMIN'}
             >
              <option value="ADMIN">일반 관리자</option>
              <option value="SUPER_ADMIN">최고 관리자</option>
            </select>
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
                 disabled={adminId === adminInfo?.id && adminInfo?.role !== 'SUPER_ADMIN'}
               >
                <option value="ACTIVE">활성</option>
                <option value="INACTIVE">비활성</option>
              </select>
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
  );
}

export default AdminAdminModal;
