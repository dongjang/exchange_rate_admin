import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaSave, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { useAtom } from 'jotai';
import Swal from 'sweetalert2';
import { api } from '../services/api';
import type { DefaultRemittanceLimit } from '../store/defaultRemittanceLimitStore';
import { userInfoAtom } from '../store/userStore';

interface DefaultRemittanceLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultLimit: DefaultRemittanceLimit | null;
}

const DefaultRemittanceLimitModal: React.FC<DefaultRemittanceLimitModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultLimit
}) => {
  const [userInfo] = useAtom(userInfoAtom);
  const [formData, setFormData] = useState({
    dailyLimit: '',
    monthlyLimit: '',
    singleLimit: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && defaultLimit) {
      setFormData({
        dailyLimit: defaultLimit.dailyLimit ? defaultLimit.dailyLimit.toLocaleString() : '',
        monthlyLimit: defaultLimit.monthlyLimit ? defaultLimit.monthlyLimit.toLocaleString() : '',
        singleLimit: defaultLimit.singleLimit ? defaultLimit.singleLimit.toLocaleString() : '',
        description: defaultLimit.description || ''
      });
    }
  }, [isOpen, defaultLimit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 숫자 입력 필드인 경우 콤마 처리
    if (['dailyLimit', 'monthlyLimit', 'singleLimit'].includes(name)) {
      const raw = value.replace(/[^0-9]/g, '');
      const formattedValue = raw ? parseInt(raw, 10).toLocaleString() : '';
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      // 확인 창 표시
      const result = await Swal.fire({
        icon: 'question',
        title: '기본 한도 설정',
        text: '입력한 내용으로 기본 한도를 설정하시겠습니까?',
        showCancelButton: true,
        confirmButtonText: '설정',
        cancelButtonText: '취소',
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#d1d5db',
        customClass: {
          popup: 'swal2-z-top',
          container: 'swal2-z-top'
        }
      });

      if (!result.isConfirmed) {
        return;
      }

      setLoading(true);
      
      // 콤마 제거 후 숫자로 변환
      const dailyLimit = parseInt(formData.dailyLimit.replace(/[^0-9]/g, ''), 10);
      const monthlyLimit = parseInt(formData.monthlyLimit.replace(/[^0-9]/g, ''), 10);
      const singleLimit = parseInt(formData.singleLimit.replace(/[^0-9]/g, ''), 10);
      
      if (!dailyLimit || !monthlyLimit || !singleLimit) {
        await Swal.fire({
          icon: 'error',
          title: '입력 오류',
          text: '모든 한도 값을 입력해주세요.',
          confirmButtonText: '확인',
          customClass: {
            popup: 'swal2-z-top',
            container: 'swal2-z-top'
          }
        });
        return;
      }

      await api.updateDefaultRemittanceLimit({
        dailyLimit,
        monthlyLimit,
        singleLimit,
        description: formData.description,
        adminId: userInfo?.id
      });

      await Swal.fire({
        icon: 'success',
        title: '업데이트 완료',
        text: '기본 한도가 성공적으로 업데이트되었습니다.',
        confirmButtonText: '확인',
        customClass: {
          popup: 'swal2-z-top',
          container: 'swal2-z-top'
        }
      });

      onSuccess();
      onClose();
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: '업데이트 실패',
        text: '기본 한도 업데이트에 실패했습니다.',
        confirmButtonText: '확인',
        customClass: {
          popup: 'swal2-z-top',
          container: 'swal2-z-top'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
    >
      <div 
        style={{ 
          position: 'relative', 
          zIndex: 10000,
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '896px',
          margin: '0 16px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '32px',
          borderBottom: '1px solid #f3f4f6',
          background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaSave style={{ color: '#3b82f6', fontSize: '18px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0' }}>기본 한도 설정</h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>시스템 전체의 기본 송금 한도를 설정합니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <FaTimes style={{ fontSize: '14px' }} />
          </button>
        </div>

        {/* 내용 */}
        <div style={{ padding: '32px' }}>
          {/* 한도 입력 섹션 */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                marginRight: '12px'
              }}></div>
              한도 설정
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  일일 한도 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="dailyLimit"
                    value={formData.dailyLimit}
                    onChange={handleInputChange}
                    placeholder="1,000,000"
                    style={{
                      width: '100%',
                      padding: '16px',
                      paddingRight: '48px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '16px',
                      fontSize: '18px',
                      fontWeight: '500',
                      backgroundColor: '#f9fafb',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}>
                    원
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  월 한도 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="monthlyLimit"
                    value={formData.monthlyLimit}
                    onChange={handleInputChange}
                    placeholder="5,000,000"
                    style={{
                      width: '100%',
                      padding: '16px',
                      paddingRight: '48px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '16px',
                      fontSize: '18px',
                      fontWeight: '500',
                      backgroundColor: '#f9fafb',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}>
                    원
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  1회 한도 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="singleLimit"
                    value={formData.singleLimit}
                    onChange={handleInputChange}
                    placeholder="500,000"
                    style={{
                      width: '100%',
                      padding: '16px',
                      paddingRight: '48px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '16px',
                      fontSize: '18px',
                      fontWeight: '500',
                      backgroundColor: '#f9fafb',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}>
                    원
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 설명 입력 섹션 */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                marginRight: '12px'
              }}></div>
              설정 설명
            </h3>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="예: 2024년 신규 사용자 기본 한도 설정"
              rows={4}
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                fontSize: '16px',
                backgroundColor: '#f9fafb',
                transition: 'all 0.2s ease',
                resize: 'none',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* 정보 박스 */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #dbeafe',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '2px'
              }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%' }}></div>
              </div>
              <div style={{ flex: '1' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', margin: '0 0 4px 0' }}>설정 안내</h4>
                <p style={{ fontSize: '14px', color: '#1d4ed8', lineHeight: '1.6', margin: '0' }}>
                  설정한 기본 한도는 새로운 사용자에게 자동으로 적용되며, 기존 사용자의 한도는 변경되지 않습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px',
          padding: '32px',
          borderTop: '1px solid #f3f4f6',
          backgroundColor: '#f9fafb',
          borderRadius: '0 0 16px 16px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '16px 32px',
              color: '#374151',
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              borderRadius: '16px',
              fontWeight: '500',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '12px'
                }}></div>
                처리 중...
              </>
            ) : (
              <>
                <FaSave style={{ marginRight: '8px' }} />
                저장하기
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DefaultRemittanceLimitModal; 