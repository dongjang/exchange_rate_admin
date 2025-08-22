import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import Swal from 'sweetalert2';
import { api } from '../services/api';
import { userInfoAtom } from '../store/userStore';
import QnaSearchForm from './QnaSearchForm';
import QnaModal from './QnaModal';
import RemittancePaging from './RemittancePaging';

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

interface QnaSearchRequest {
  title?: string;
  content?: string;
  status?: string;
  page: number;
  size: number;
}

const QnaPage: React.FC = () => {
  const [userInfo] = useAtom(userInfoAtom);
  const [qnaList, setQnaList] = useState<Qna[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchRequest, setSearchRequest] = useState<QnaSearchRequest>({
    page: 0,
    size: 5
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQna, setEditingQna] = useState<Qna | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    file: null as File | null,
    removeExistingFile: false
  });

  const statusOptions = [
    { value: 'PENDING', label: '대기중' },
    { value: 'ANSWERED', label: '답변완료' }
  ];

  const fetchQnaList = async () => {
    try {
      const response = await api.searchQna(searchRequest);
      if (response && response.content) {
        setQnaList(response.content);
        setTotalCount(response.totalElements);
      } else {
        setQnaList([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Q&A 조회 실패:', error);
      Swal.fire('오류', 'Q&A를 불러오는데 실패했습니다.', 'error');
    }
  };

  useEffect(() => {
    fetchQnaList();
  }, [searchRequest]);

  // 검색 조건이 변경될 때만 검색 실행 (페이지 변경 제외)
  useEffect(() => {
    setSearchRequest(prev => ({ ...prev, page: 0 }));
    setCurrentPage(1);
  }, [searchRequest.title, searchRequest.content, searchRequest.status]);

  const handleSearch = () => {
    setSearchRequest(prev => ({ ...prev, page: 0 }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    console.log('페이지 변경:', page, '->', page - 1);
    setCurrentPage(page);
    setSearchRequest(prev => ({ ...prev, page: (page - 1) * prev.size }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setSearchRequest(prev => ({ ...prev, size: newPageSize, page: 0 }));
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setEditingQna(null);
    setFormData({
      title: '',
      content: '',
      file: null,
      removeExistingFile: false
    });
    setIsModalOpen(true);
  };

  const handleEdit = (qna: Qna) => {
    setEditingQna(qna);
    setFormData({
      title: qna.title,
      content: qna.content,
      file: null,
      removeExistingFile: false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Swal.fire('오류', '제목을 입력해주세요.', 'error');
      return;
    }

    if (!formData.content.trim()) {
      Swal.fire('오류', '내용을 입력해주세요.', 'error');
      return;
    }

    // 컨펌 창 표시
    const confirmText = editingQna ? 'Q&A를 수정하시겠습니까?' : 'Q&A를 등록하시겠습니까?';
    const result = await Swal.fire({
      title: '확인',
      text: confirmText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: editingQna ? '수정' : '등록',
      cancelButtonText: '취소'
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }
      formDataToSend.append('removeExistingFile', formData.removeExistingFile.toString());

      if (editingQna) {
        await api.updateQna(editingQna.id, formDataToSend);
        Swal.fire('성공', 'Q&A가 수정되었습니다.', 'success');
      } else {
        await api.createQna(formDataToSend);
        Swal.fire('성공', 'Q&A가 등록되었습니다.', 'success');
      }

      setIsModalOpen(false);
      setEditingQna(null);
      setFormData({
        title: '',
        content: '',
        file: null,
        removeExistingFile: false
      });
      fetchQnaList();
    } catch (error) {
      console.error('Q&A 저장 실패:', error);
      Swal.fire('오류', 'Q&A 저장에 실패했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!editingQna) return;

    const result = await Swal.fire({
      title: '확인',
      text: '정말로 이 Q&A를 취소하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '취소',
      cancelButtonText: '돌아가기'
    });

    if (result.isConfirmed) {
      try {
        await api.cancelQna(editingQna.id);
        Swal.fire('성공', 'Q&A가 취소되었습니다.', 'success');
        setIsModalOpen(false);
        setEditingQna(null);
        fetchQnaList();
      } catch (error) {
        console.error('Q&A 취소 실패:', error);
        Swal.fire('오류', 'Q&A 취소에 실패했습니다.', 'error');
      }
    }
  };

  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'ANSWERED':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '40px',
        marginBottom: '30px',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
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
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          margin: '0 0 10px 0',
          position: 'relative',
          zIndex: 1,
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          Q&A
        </h1>
        <p style={{
          fontSize: '1.1rem',
          margin: 0,
          opacity: 0.9,
          position: 'relative',
          zIndex: 1
        }}>
          궁금한 점을 문의하고 답변을 받아보세요
        </p>
      </div>

      {/* 검색 폼 */}
      <QnaSearchForm
        searchRequest={searchRequest}
        setSearchRequest={setSearchRequest}
        onSearch={handleSearch}
        onAdd={handleAdd}
        statusOptions={statusOptions}
      />

      {/* Q&A 리스트 */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '3fr 1fr 1fr 1fr',
          gap: '16px',
          padding: '16px 0',
          borderBottom: '2px solid #e2e8f0',
          fontWeight: '600',
          color: '#374151',
          fontSize: '14px'
        }}>
          <div>제목</div>
          <div style={{ textAlign: 'center' }}>상태</div>
          <div style={{ textAlign: 'center' }}>첨부파일</div>
          <div style={{ textAlign: 'center' }}>등록일</div>
        </div>

        {qnaList.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6b7280',
            fontSize: '16px'
          }}>
            등록된 Q&A가 없습니다.
          </div>
        ) : (
          qnaList.map((qna) => (
            <div
              key={qna.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '3fr 1fr 1fr 1fr',
                gap: '16px',
                padding: '16px 0',
                borderBottom: '1px solid #f1f5f9',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={() => handleEdit(qna)}
            >
              <div style={{
                fontWeight: '500',
                color: '#1e293b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {qna.title}
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: getStatusColor(qna.status) + '20',
                  color: getStatusColor(qna.status)
                }}>
                  {getStatusLabel(qna.status)}
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                {qna.fileName ? (
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: '#10b981',
                    color: 'white',
                    display: 'inline-block'
                  }}>
                    첨부파일
                  </span>
                ) : (
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: '#e5e7eb',
                    color: '#6b7280',
                    display: 'inline-block'
                  }}>
                    없음
                  </span>
                )}
              </div>
              <div style={{ textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                {new Date(qna.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })}
              </div>
            </div>
          ))
        )}
      </div>

             {/* 페이징 */}
       <RemittancePaging
         currentPage={currentPage}
         totalPages={Math.ceil(totalCount / searchRequest.size)}
         totalItems={totalCount}
         pageSize={searchRequest.size}
         onPageChange={handlePageChange}
         onPageSizeChange={handlePageSizeChange}
       />

      {/* 모달 */}
      <QnaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        editingQna={editingQna}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default QnaPage;
