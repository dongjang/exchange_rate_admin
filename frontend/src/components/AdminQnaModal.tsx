import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import SimpleFileViewer from './SimpleFileViewer';

interface Qna {
  id: number;
  title: string;
  content: string;
  status: string;
  fileId?: number;
  fileName?: string;
  createdAt: string;
  answeredAt?: string;
  answerContent?: string;
  answerUserName?: string;
  userName?: string;
  fileSize?: number;
}

interface AdminQnaModalProps {
  isOpen: boolean;
  onClose: () => void;
  qna: Qna | null;
  onAnswerSubmit?: () => void;
}

const AdminQnaModal: React.FC<AdminQnaModalProps> = ({
  isOpen,
  onClose,
  qna,
  onAnswerSubmit
}) => {
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (qna) {
      setAnswerContent(qna.answerContent || '');
    }
  }, [qna]);

  if (!isOpen || !qna) return null;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기중';
      case 'ANSWERED':
        return '답변완료';
      case 'CANCELED':
        return '취소됨';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'ANSWERED':
        return '#10b981';
      case 'CANCELED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answerContent.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.answerQna(qna.id, { answerContent });
      alert('답변이 등록되었습니다.');
      onAnswerSubmit?.();
      onClose();
    } catch (error) {
      console.error('답변 등록 실패:', error);
      alert('답변 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadFile = () => {
    if (qna.fileId) {
      api.downloadFile(qna.fileId);
    }
  };

  return (
    <>
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
          width: '95%',
          maxWidth: '1400px',
          height: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* 모달 헤더 */}
          <div style={{
            padding: '24px 32px',
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.75rem',
                fontWeight: '700',
                color: 'white',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                Q&A 상세
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* 모달 바디 */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            overflow: 'hidden'
          }}>
            {/* 좌측: Q&A 정보 */}
            <div style={{
              flex: 1,
              padding: '32px',
              overflowY: 'auto',
              borderRight: '1px solid #f1f5f9'
            }}>
              {/* 기본 정보 */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  기본 정보
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      제목
                    </label>
                    <div style={{
                      padding: '12px 16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#1e293b'
                    }}>
                      {qna.title}
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      상태
                    </label>
                    <div style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: getStatusColor(qna.status) + '20',
                      color: getStatusColor(qna.status),
                      display: 'inline-block'
                    }}>
                      {getStatusLabel(qna.status)}
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      작성자
                    </label>
                    <div style={{
                      padding: '12px 16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#1e293b'
                    }}>
                      {qna.userName || '알 수 없음'}
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      등록일
                    </label>
                    <div style={{
                      padding: '12px 16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#1e293b'
                    }}>
                      {new Date(qna.createdAt).toLocaleString('ko-KR')}
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      첨부파일
                    </label>
                    <div style={{
                      padding: '12px 16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#1e293b',
                      minHeight: '46px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {qna.fileName ? (
                        <span style={{ color: '#10b981', fontWeight: '500' }}>
                          📎 {qna.fileName}
                        </span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>첨부파일 없음</span>
                      )}
                    </div>
                  </div>

                  {qna.answeredAt && (
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '14px'
                      }}>
                        처리일
                      </label>
                      <div style={{
                        padding: '12px 16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#1e293b'
                      }}>
                        {new Date(qna.answeredAt).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 문의 내용 */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  문의 내용
                </h3>
                <div style={{
                  padding: '16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1e293b',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  minHeight: '120px'
                }}>
                  {qna.content}
                </div>
              </div>

              {/* 답변 내용 */}
              {qna.answerContent && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '16px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #e2e8f0'
                  }}>
                    답변 내용
                  </h3>
                  <div style={{
                    padding: '16px',
                    background: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#0c4a6e',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    minHeight: '120px'
                  }}>
                    {qna.answerContent}
                  </div>
                  {qna.answerUserName && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#0ea5e9',
                      fontWeight: '500'
                    }}>
                      답변자: {qna.answerUserName}
                    </div>
                  )}
                </div>
              )}

              {/* 답변 입력 (PENDING 상태일 때만) */}
              {qna.status === 'PENDING' && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '16px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #e2e8f0'
                  }}>
                    답변 작성
                  </h3>
                  <textarea
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    placeholder="답변 내용을 입력하세요..."
                    style={{
                      width: '100%',
                      minHeight: '150px',
                      padding: '16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                  <div style={{
                    marginTop: '16px',
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={isSubmitting || !answerContent.trim()}
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: isSubmitting || !answerContent.trim() ? 'not-allowed' : 'pointer',
                        opacity: isSubmitting || !answerContent.trim() ? 0.6 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isSubmitting ? '답변 등록 중...' : '답변 등록'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 우측: 첨부파일 미리보기 */}
            {qna.fileId && qna.fileName && (
              <div style={{
                width: '600px',
                borderLeft: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #f1f5f9',
                  background: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1e293b',
                      margin: 0
                    }}>
                      첨부파일 미리보기
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '6px 0 0 0'
                    }}>
                      {qna.fileName}
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadFile}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    📥 다운로드
                  </button>
                </div>
                <div style={{
                  flex: 1,
                  padding: '20px',
                  overflow: 'hidden'
                }}>
                  <FilePreview fileId={qna.fileId} fileName={qna.fileName} fileSize={qna.fileSize} />
                </div>
              </div>
            )}
          </div>

          {/* 하단 닫기 버튼 */}
          <div style={{
            padding: '24px 32px',
            borderTop: '1px solid #f1f5f9',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>


    </>
  );
};

// 파일 타입 추정 함수
const getFileType = (fileName: string): string => {
  const ext = fileName.toLowerCase().split('.').pop();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
};

// SimpleFileViewer를 사용한 파일 미리보기 컴포넌트
const FilePreview: React.FC<{ fileId: number; fileName: string; fileSize?: number }> = ({ fileId, fileName, fileSize }) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const getFileType = (fileName: string): string => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  };

  const isImageFile = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  const handlePreviewClick = () => {
    setIsViewerOpen(true);
  };

  return (
    <>
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onClick={handlePreviewClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#f1f5f9';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#f8fafc';
      }}
      >
        {isImageFile(fileName) ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
            <p style={{ marginBottom: '8px', color: '#374151', fontWeight: '500' }}>이미지 파일</p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>클릭하여 미리보기</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
            <p style={{ marginBottom: '8px', color: '#374151', fontWeight: '500' }}>{fileName}</p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>클릭하여 미리보기</p>
          </div>
        )}
      </div>

             {/* SimpleFileViewer 모달 */}
       <SimpleFileViewer
         isOpen={isViewerOpen}
         onClose={() => setIsViewerOpen(false)}
         files={{
           qna: {
             id: fileId,
             originalName: fileName,
             fileSize: fileSize || 0,
             fileType: getFileType(fileName)
           }
         }}
       />
    </>
  );
};

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default AdminQnaModal;
