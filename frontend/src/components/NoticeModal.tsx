import React from 'react';
import Swal from 'sweetalert2';

interface Notice {
  id: number;
  title: string;
  content: string;
  status: string;
  priority: string;
  noticeStartAt?: string;
  noticeEndAt?: string;
  effectivePriority?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  createdUserId: number;
  createdUserName: string;
}

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingNotice: Notice | null;
  formData: {
    title: string;
    content: string;
    priority: string;
    status: string;
    noticeStartAt: Date | null;
    noticeEndAt: Date | null;
  };
  setFormData: (data: any) => void;
  priorityOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
}

const NoticeModal: React.FC<NoticeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingNotice,
  formData,
  setFormData,
  priorityOptions,
  statusOptions
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* 모달 헤더 */}
        <div style={{
          padding: '32px 32px 24px 32px',
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          <h2 style={{
            margin: 0,
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'white',
            position: 'relative',
            zIndex: 1,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            {editingNotice ? '공지사항 수정' : '공지사항 등록'}
          </h2>
        </div>

        {/* 모달 바디 */}
        <div style={{ 
          padding: '32px', 
          maxHeight: '60vh', 
          overflowY: 'auto',
        }}>
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              color: '#1e293b',
              fontSize: '15px'
            }}>
              제목 <span style={{ color: '#ef4444', fontWeight: '700' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '15px',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                background: 'white'
              }}
              placeholder="제목을 입력하세요 (최대 20자)"
              maxLength={20}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              color: '#1e293b',
              fontSize: '15px'
            }}>
              내용 <span style={{ color: '#ef4444', fontWeight: '700' }}>*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '15px',
                resize: 'vertical',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                background: 'white',
                fontFamily: 'inherit'
              }}
              placeholder="내용을 입력하세요"
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

                     <div style={{ marginBottom: '28px' }}>
             <label style={{
               display: 'block',
               marginBottom: '10px',
               fontWeight: '600',
               color: '#1e293b',
               fontSize: '15px'
             }}>
               중요도
             </label>
             <select
               value={formData.priority}
               onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
               style={{
                 width: '100%',
                 padding: '16px 20px',
                 border: '2px solid #e2e8f0',
                 borderRadius: '12px',
                 fontSize: '15px',
                 backgroundColor: 'white',
                 cursor: 'pointer',
                 transition: 'all 0.2s ease'
               }}
               onFocus={(e) => {
                 e.target.style.borderColor = '#667eea';
                 e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
               }}
               onBlur={(e) => {
                 e.target.style.borderColor = '#e2e8f0';
                 e.target.style.boxShadow = 'none';
               }}
             >
               {priorityOptions.map(option => (
                 <option key={option.value} value={option.value}>
                   {option.label}
                 </option>
               ))}
             </select>
           </div>

           {formData.priority === 'HIGH' && (
             <div style={{
               marginBottom: '20px',
               padding: '16px',
               backgroundColor: '#fef3c7',
               border: '1px solid #f59e0b',
               borderRadius: '12px',
               borderLeft: '4px solid #f59e0b'
             }}>
               <div style={{
                 display: 'flex',
                 alignItems: 'flex-start',
                 gap: '12px'
               }}>
                 <div style={{
                   fontSize: '18px',
                   color: '#f59e0b',
                   marginTop: '2px'
                 }}>
                   ⚠️
                 </div>
                 <div>
                   <div style={{
                     fontWeight: '600',
                     color: '#92400e',
                     fontSize: '14px',
                     marginBottom: '4px'
                   }}>
                     중요도 높음 선택 시 주의사항
                   </div>
                   <div style={{
                     color: '#92400e',
                     fontSize: '13px',
                     lineHeight: '1.5'
                   }}>
                     기존에 중요도가 높음으로 설정된 공지사항의 중요도는 보통으로 변경되고, 
                     새로 저장되는 공지사항의 중요도가 높음으로 설정됩니다.
                   </div>
                 </div>
               </div>
             </div>
           )}

          {formData.priority === 'HIGH' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#374151',
                fontSize: '14px'
              }}>
                모달 표시 기간 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="date"
                    value={formData.noticeStartAt ? formData.noticeStartAt.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      setFormData({ ...formData, noticeStartAt: date });
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                  
                <span style={{ fontSize: '1.2rem', color: '#6b7280' }}>~</span>
                  
                <div style={{ flex: 1 }}>
                  <input
                    type="date"
                    value={formData.noticeEndAt ? formData.noticeEndAt.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      setFormData({ ...formData, noticeEndAt: date });
                    }}
                    min={formData.noticeStartAt ? formData.noticeStartAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {editingNotice && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#374151',
                fontSize: '14px'
              }}>
                상태
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div style={{
          padding: '24px 32px 32px 32px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          gap: '16px',
          justifyContent: 'flex-end',
          background: 'white'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '14px 28px',
              backgroundColor: 'white',
              color: '#64748b',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }}
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
          >
            {editingNotice ? '수정' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeModal;
