import React, { useRef } from 'react';

interface Qna {
  id: number;
  title: string;
  content: string;
  status: string;
  fileId?: number;
  fileName?: string;
  createdAt: string;
  answerContent?: string;
}

interface QnaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  editingQna: Qna | null;
  formData: {
    title: string;
    content: string;
    file: File | null;
    removeExistingFile?: boolean;
  };
  setFormData: (data: any) => void;
  isSubmitting: boolean;
}

const QnaModal: React.FC<QnaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onCancel,
  editingQna,
  formData,
  setFormData,
  isSubmitting
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, file });
  };

  const handleFileRemove = () => {
    setFormData({ ...formData, file: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveExistingFile = () => {
    setFormData({ ...formData, file: null, removeExistingFile: true });
  };

  const isValidFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    return validTypes.includes(file.type) && file.size <= maxSize;
  };

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
            {editingQna && editingQna.status === 'ANSWERED' ? 'Q&A 상세' : (editingQna ? 'Q&A 수정' : 'Q&A 등록')}
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
              제목 {editingQna && editingQna.status === 'ANSWERED' ? '' : <span style={{ color: '#ef4444', fontWeight: '700' }}>*</span>}
            </label>
            {editingQna && editingQna.status === 'ANSWERED' ? (
              <div style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '15px',
                boxSizing: 'border-box',
                background: '#f8fafc',
                color: '#1e293b'
              }}>
                {formData.title}
              </div>
            ) : (
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
            )}
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              color: '#1e293b',
              fontSize: '15px'
            }}>
              내용 {editingQna && editingQna.status === 'ANSWERED' ? '' : <span style={{ color: '#ef4444', fontWeight: '700' }}>*</span>}
            </label>
            {editingQna && editingQna.status === 'ANSWERED' ? (
              <div style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '15px',
                boxSizing: 'border-box',
                background: '#f8fafc',
                color: '#1e293b',
                minHeight: '120px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                {formData.content}
              </div>
            ) : (
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
            )}
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              color: '#1e293b',
              fontSize: '15px'
            }}>
              첨부파일
            </label>
            
            {editingQna && editingQna.status === 'ANSWERED' ? (
              // 답변완료된 경우: 첨부파일 표시만
              <div style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '15px',
                boxSizing: 'border-box',
                background: '#f8fafc',
                color: '#1e293b'
              }}>
                {editingQna.fileName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', color: '#10b981' }}>📎</span>
                    <span style={{ color: '#10b981', fontWeight: '500' }}>
                      {editingQna.fileName}
                    </span>
                  </div>
                ) : (
                  <span style={{ color: '#6b7280' }}>첨부파일 없음</span>
                )}
              </div>
            ) : (
              // 수정 가능한 경우: 기존 파일 관리 기능 포함
              <>
                {/* 기존 파일 표시 (수정 시) */}
                {editingQna && editingQna.fileName && !formData.file && !formData.removeExistingFile && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', color: '#0ea5e9' }}>📎</span>
                      <span style={{ fontSize: '14px', color: '#0c4a6e', fontWeight: '500' }}>
                        기존 파일: {editingQna.fileName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveExistingFile}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}

                {/* 기존 파일 삭제됨 표시 */}
                {editingQna && editingQna.fileName && formData.removeExistingFile && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: '#fef2f2',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', color: '#ef4444' }}>🗑️</span>
                      <span style={{ fontSize: '14px', color: '#991b1b', fontWeight: '500' }}>
                        기존 파일: {editingQna.fileName}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      color: '#ef4444',
                      backgroundColor: '#fee2e2',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      삭제됨
                    </span>
                  </div>
                )}
                
                <div style={{
                  border: '2px dashed #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  background: '#f8fafc'
                }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    style={{ display: 'none' }}
                  />
                  
                  {formData.file ? (
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px', color: '#10b981' }}>📎</span>
                          <span style={{ fontSize: '14px', color: '#374151' }}>
                            {formData.file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleFileRemove}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          삭제
                        </button>
                      </div>
                      {!isValidFile(formData.file) && (
                        <div style={{
                          color: '#ef4444',
                          fontSize: '12px',
                          marginTop: '8px'
                        }}>
                          PDF 또는 이미지 파일만 업로드 가능하며, 최대 10MB까지 가능합니다.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 24px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        파일 선택
                      </button>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginTop: '8px'
                      }}>
                        PDF, JPG, PNG, GIF 파일만 가능 (최대 10MB)
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

                     {editingQna && editingQna.status === 'PENDING' && (
             <div style={{
               marginBottom: '24px',
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
                     문의 취소 안내
                   </div>
                   <div style={{
                     color: '#92400e',
                     fontSize: '13px',
                     lineHeight: '1.5'
                   }}>
                     아직 답변이 완료되지 않은 문의입니다. 문의를 취소하시면 더 이상 수정할 수 없습니다.
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* 답변 내용 (답변완료된 경우) */}
           {editingQna && editingQna.status === 'ANSWERED' && editingQna.answerContent && (
             <div style={{ marginBottom: '28px' }}>
               <label style={{
                 display: 'block',
                 marginBottom: '10px',
                 fontWeight: '600',
                 color: '#1e293b',
                 fontSize: '15px'
               }}>
                 답변 내용
               </label>
               <div style={{
                 width: '100%',
                 padding: '16px 20px',
                 border: '2px solid #e2e8f0',
                 borderRadius: '12px',
                 fontSize: '15px',
                 boxSizing: 'border-box',
                 background: '#f0f9ff',
                 color: '#0c4a6e',
                 minHeight: '120px',
                 lineHeight: '1.6',
                 whiteSpace: 'pre-wrap',
                 borderColor: '#0ea5e9'
               }}>
                 {editingQna.answerContent}
               </div>
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
          {editingQna && editingQna.status === 'PENDING' && (
            <button
              onClick={onCancel}
              style={{
                padding: '14px 28px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
            >
              문의 취소
            </button>
          )}

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
          {((editingQna && editingQna.status === 'PENDING')|| !editingQna) && (
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              opacity: isSubmitting ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            {isSubmitting ? '처리중...' : (editingQna ? '수정' : '등록')}
          </button>
             )}
        </div>
      </div>
    </div>
  );
};

export default QnaModal;
