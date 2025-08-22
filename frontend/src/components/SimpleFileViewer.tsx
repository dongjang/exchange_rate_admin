import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { api } from '../services/api';

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: {
    income?: { id: number; originalName: string; fileSize: number; fileType: string };
    bankbook?: { id: number; originalName: string; fileSize: number; fileType: string };
    business?: { id: number; originalName: string; fileSize: number; fileType: string };
    qna?: { id: number; originalName: string; fileSize: number; fileType: string };
  };
}

const SimpleFileViewer: React.FC<FileViewerModalProps> = ({ isOpen, onClose, files }) => {
  const [currentFile, setCurrentFile] = useState<{ id: number; originalName: string; fileSize: number; fileType: string; base64Data?: string } | null>(null);
  const [viewMode, setViewMode] = useState<'loading' | 'error' | 'success' | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [imageScale, setImageScale] = useState(1.0);
  const [pageInputValue, setPageInputValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      // 소득 증빙을 우선적으로 선택
      const firstFile = files.income || files.bankbook || files.business || files.qna;
      setCurrentFile(firstFile || null);
      setViewMode(null);
      setPdfScale(1.0);
      setImageScale(1.0);
      setPageNumber(1);
      setPageInputValue('');
      setDragOffset({ x: 0, y: 0 });
      
      // 첫 번째 파일이 있으면 자동으로 로드
      if (firstFile) {
        handleFileClick(firstFile);
      }
    }
  }, [isOpen, files]);

  const handleFileClick = async (file: { id: number; originalName: string; fileSize: number; fileType: string }) => {
    setCurrentFile(file);
    setViewMode('loading');
    setPdfScale(1.0);
    setImageScale(1.0);
    setPageNumber(1);
    setPageInputValue('');
    setDragOffset({ x: 0, y: 0 });
    
    try {
      // Base64 API를 사용하여 파일 데이터 가져오기
      const response = await fetch(`http://localhost:8080/api/files/${file.id}/base64`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        setViewMode('error');
        return;
      }
      
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        setViewMode('error');
        return;
      }
      
      const data = await response.json();
      
      // 파일 데이터를 상태에 저장
      setCurrentFile({
        ...file,
        base64Data: data.base64Data
      });
      
      setViewMode('success');
    } catch (error) {
      setViewMode('error');
    }
  };

  const isImageFile = (fileType: string) => {
    return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(fileType.toLowerCase());
  };

  const isPdfFile = (fileType: string) => {
    return fileType.toLowerCase() === 'application/pdf';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (isImageFile(fileType)) return '🖼️';
    if (isPdfFile(fileType)) return '📄';
    return '📁';
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleImageLoad = () => {
    // 이미지 로딩 성공
  };

  const handleImageError = () => {
    setViewMode('error');
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };

  const handlePageInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageInputSubmit();
    }
  };

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInputValue);
    if (page && page >= 1 && page <= (numPages || 1)) {
      setPageNumber(page);
      setPageInputValue('');
    }
  };

  const handleZoomIn = () => {
    setPdfScale(prev => Math.min(prev + 0.2, 3.0));
    setImageScale(prev => Math.min(prev + 0.2, 2.0));
  };

  const handleZoomOut = () => {
    const newPdfScale = Math.max(pdfScale - 0.2, 0.5);
    const newImageScale = Math.max(imageScale - 0.2, 0.5);
    
    setPdfScale(newPdfScale);
    setImageScale(newImageScale);
    
    // 100% 이하로 축소할 때 위치 초기화
    if (newPdfScale <= 1.0 || newImageScale <= 1.0) {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleZoomReset = () => {
    setPdfScale(1.0);
    setImageScale(1.0);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // 100% 미만에서도 드래그 가능하도록 수정
    setIsDragging(true);
    setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setDragOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    
    if (isImageFile(currentFile?.fileType || '')) {
      const newImageScale = Math.max(Math.min(imageScale + delta, 2.0), 0.5);
      setImageScale(newImageScale);
      
      // 100% 이하로 축소할 때 위치 초기화
      if (newImageScale <= 1.0) {
        setDragOffset({ x: 0, y: 0 });
      }
    } else if (isPdfFile(currentFile?.fileType || '')) {
      const newPdfScale = Math.max(Math.min(pdfScale + delta, 3.0), 0.5);
      setPdfScale(newPdfScale);
      
      // 100% 이하로 축소할 때 위치 초기화
      if (newPdfScale <= 1.0) {
        setDragOffset({ x: 0, y: 0 });
      }
    }
  };

  // wheel 이벤트 리스너를 직접 추가
  useEffect(() => {
    if (!isOpen || !currentFile) return;

    const handleWheelEvent = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      
      const wheelEvent = e as WheelEvent;
      const delta = wheelEvent.deltaY > 0 ? -0.1 : 0.1;
      
      if (isImageFile(currentFile.fileType)) {
        const newImageScale = Math.max(Math.min(imageScale + delta, 2.0), 0.5);
        setImageScale(newImageScale);
        
        // 100% 이하로 축소할 때 위치 초기화
        if (newImageScale <= 1.0) {
          setDragOffset({ x: 0, y: 0 });
        }
      } else if (isPdfFile(currentFile.fileType)) {
        const newPdfScale = Math.max(Math.min(pdfScale + delta, 3.0), 0.5);
        setPdfScale(newPdfScale);
        
        // 100% 이하로 축소할 때 위치 초기화
        if (newPdfScale <= 1.0) {
          setDragOffset({ x: 0, y: 0 });
        }
      }
    };

    const imageViewerElement = document.querySelector('[data-image-viewer]');
    const pdfViewerElement = document.querySelector('[data-pdf-viewer]');
    
    if (imageViewerElement) {
      imageViewerElement.addEventListener('wheel', handleWheelEvent, { passive: false });
    }
    
    if (pdfViewerElement) {
      pdfViewerElement.addEventListener('wheel', handleWheelEvent, { passive: false });
    }
    
    return () => {
      if (imageViewerElement) {
        imageViewerElement.removeEventListener('wheel', handleWheelEvent);
      }
      if (pdfViewerElement) {
        pdfViewerElement.removeEventListener('wheel', handleWheelEvent);
      }
    };
  }, [isOpen, currentFile, imageScale, pdfScale]);



  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
             <div 
         style={{
           background: 'white',
           borderRadius: '12px',
           padding: '24px',
           maxWidth: '95vw',
           maxHeight: '95vh',
           width: '1200px',
           height: '90vh',
           display: 'flex',
           flexDirection: 'column',
           gap: '20px'
         }}
       >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>첨부파일 보기</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

         <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
           {files.income && (
             <button
               onClick={() => handleFileClick(files.income!)}
               style={{
                 padding: '8px 12px',
                 border: '1px solid #d1d5db',
                 borderRadius: '6px',
                 background: currentFile?.id === files.income?.id ? '#3b82f6' : 'white',
                 color: currentFile?.id === files.income?.id ? 'white' : '#374151',
                 cursor: 'pointer',
                 fontSize: '14px',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '8px'
               }}
             >
               {getFileIcon(files.income.fileType)} 소득 증빙
             </button>
           )}
           {files.bankbook && (
             <button
               onClick={() => handleFileClick(files.bankbook!)}
               style={{
                 padding: '8px 12px',
                 border: '1px solid #d1d5db',
                 borderRadius: '6px',
                 background: currentFile?.id === files.bankbook?.id ? '#3b82f6' : 'white',
                 color: currentFile?.id === files.bankbook?.id ? 'white' : '#374151',
                 cursor: 'pointer',
                 fontSize: '14px',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '8px'
               }}
             >
               {getFileIcon(files.bankbook.fileType)} 통장 사본
             </button>
           )}
           {files.business && (
             <button
               onClick={() => handleFileClick(files.business!)}
               style={{
                 padding: '8px 12px',
                 border: '1px solid #d1d5db',
                 borderRadius: '6px',
                 background: currentFile?.id === files.business?.id ? '#3b82f6' : 'white',
                 color: currentFile?.id === files.business?.id ? 'white' : '#374151',
                 cursor: 'pointer',
                 fontSize: '14px',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '8px'
               }}
             >
               {getFileIcon(files.business.fileType)} 사업자 등록증
             </button>
           )}
         </div>

        {currentFile && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                {currentFile.originalName}
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                크기: {formatFileSize(currentFile.fileSize)}
              </p>
            </div>
            <button
              onClick={() => api.downloadFile(currentFile.id)}
              style={{
                padding: '8px 16px',
                border: '1px solid #3b82f6',
                borderRadius: '4px',
                background: 'white',
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📥 다운로드
            </button>
          </div>
        )}

                 <div 
           style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', minHeight: '600px', position: 'relative' }}
         >
          {viewMode === 'loading' && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 10
            }}>
              <div style={{
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px'
              }}></div>
              <p>파일을 불러오는 중...</p>
            </div>
          )}
          
          {viewMode === 'error' && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#ef4444',
              maxWidth: '400px',
              zIndex: 10
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {currentFile && isImageFile(currentFile.fileType) ? '🖼️' : '📄'}
              </div>
              <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                파일을 불러올 수 없습니다
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                파일을 표시할 수 없습니다.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => currentFile && api.downloadFile(currentFile.id)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ef4444',
                    borderRadius: '4px',
                    background: 'white',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  다운로드
                </button>
                <button
                  onClick={() => currentFile && window.open(`/api/files/${currentFile.id}`, '_blank')}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #3b82f6',
                    borderRadius: '4px',
                    background: 'white',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  새 탭에서 열기
                </button>
              </div>
            </div>
          )}
          
          {viewMode === 'success' && currentFile && (
            <>
              {isImageFile(currentFile.fileType) ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                     {/* 이미지 줌 컨트롤 */}
                   <div style={{ 
                     display: 'flex', 
                     flexDirection: 'column',
                     gap: '8px',
                     padding: '12px',
                     borderBottom: '1px solid #e5e7eb',
                     backgroundColor: '#f9fafb'
                   }}>
                     {/* 사용법 안내 */}
                     <div style={{
                       textAlign: 'center',
                       fontSize: '12px',
                       color: '#6b7280',
                       fontStyle: 'italic'
                     }}>
                       💡 마우스 휠로 확대/축소, 드래그로 이동 가능
                     </div>
                     {/* 줌 컨트롤 버튼들 */}
                     <div style={{ 
                       display: 'flex', 
                       justifyContent: 'center', 
                       alignItems: 'center', 
                       gap: '12px'
                     }}>

                    <button
                      onClick={handleZoomOut}
                      disabled={imageScale <= 0.5}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        background: 'white',
                        color: imageScale <= 0.5 ? '#9ca3af' : '#374151',
                        cursor: imageScale <= 0.5 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      🔍-
                    </button>
                    <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '60px', textAlign: 'center' }}>
                      {Math.round(imageScale * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                                             disabled={imageScale >= 2.0}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        background: 'white',
                                                 color: imageScale >= 2.0 ? '#9ca3af' : '#374151',
                         cursor: imageScale >= 2.0 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      🔍+
                    </button>
                    <button
                      onClick={handleZoomReset}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        background: 'white',
                        color: '#374151',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                                         >
                       🔄 초기화
                     </button>
                     </div>
                   </div>

                                      {/* 이미지 뷰어 영역 */}
                                       <div 
                      data-image-viewer
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        overflow: 'hidden', 
                        padding: '20px',
                                                cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: 'none'
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseLeave}
                    >
                                           <img
                        src={currentFile.base64Data ? `data:${currentFile.fileType};base64,${currentFile.base64Data}` : `/api/files/${currentFile.id}?t=${Date.now()}`}
                        alt={currentFile.originalName}
                        style={{ 
                          maxWidth: `${100 * imageScale}%`, 
                          maxHeight: `${100 * imageScale}%`, 
                          objectFit: 'contain',
                          display: 'block',
                          transition: imageScale === 1.0 ? 'max-width 0.2s ease, max-height 0.2s ease' : 'none',
                          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                          cursor: isDragging ? 'grabbing' : 'grab'
                        }}
                       onLoad={handleImageLoad}
                       onError={handleImageError}
                       crossOrigin="anonymous"
                       referrerPolicy="no-referrer"
                       draggable={false}
                     />
                   </div>
                </div>
              ) : isPdfFile(currentFile.fileType) ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* PDF 줌 컨트롤 */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '12px',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb'
                  }}>
                    {/* 사용법 안내 */}
                    <div style={{
                      textAlign: 'center',
                      fontSize: '12px',
                      color: '#6b7280',
                      fontStyle: 'italic'
                    }}>
                      💡 마우스 휠로 확대/축소, 드래그로 이동 가능
                    </div>
                    {/* 줌 컨트롤 버튼들 */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      gap: '12px'
                    }}>
                      <button
                      onClick={handleZoomOut}
                      disabled={pdfScale <= 0.5}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        background: 'white',
                        color: pdfScale <= 0.5 ? '#9ca3af' : '#374151',
                        cursor: pdfScale <= 0.5 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      🔍-
                    </button>
                    <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '60px', textAlign: 'center' }}>
                      {Math.round(pdfScale * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      disabled={pdfScale >= 3.0}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        background: 'white',
                        color: pdfScale >= 3.0 ? '#9ca3af' : '#374151',
                        cursor: pdfScale >= 3.0 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      🔍+
                    </button>
                    <button
                      onClick={handleZoomReset}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        background: 'white',
                        color: '#374151',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      🔄 초기화
                    </button>
                    </div>
                  </div>

                                     {/* PDF 뷰어 영역 */}
                                       <div 
                      data-pdf-viewer
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        overflow: 'hidden', 
                        padding: '20px',
                                                cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: 'none'
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseLeave}
                    >
                     <Document
                       file={currentFile.base64Data ? `data:${currentFile.fileType};base64,${currentFile.base64Data}` : `/api/files/${currentFile.id}`}
                       onLoadSuccess={onDocumentLoadSuccess}
                       loading={
                         <div style={{ textAlign: 'center', padding: '20px' }}>
                           <div style={{
                             border: '3px solid #f3f3f3',
                             borderTop: '3px solid #3b82f6',
                             borderRadius: '50%',
                             width: '30px',
                             height: '30px',
                             animation: 'spin 1s linear infinite',
                             margin: '0 auto 10px'
                           }}></div>
                           <p>PDF를 불러오는 중...</p>
                         </div>
                       }
                     >
                       {numPages && (
                         <div style={{ 
                           border: '1px solid #e5e7eb', 
                           borderRadius: '4px', 
                           padding: '8px', 
                           backgroundColor: 'white',
                           transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                           transition: pdfScale === 1.0 ? 'transform 0.2s ease' : 'none'
                         }}>
                           <Page
                             pageNumber={pageNumber}
                             width={Math.min(800 * pdfScale, window.innerWidth - 100)}
                             scale={pdfScale}
                             renderTextLayer={false}
                             renderAnnotationLayer={false}
                           />
                         </div>
                       )}
                     </Document>
                   </div>

                  {/* 페이지 네비게이션 (PDF 아래) */}
                  {numPages && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      gap: '16px', 
                      padding: '16px',
                      borderTop: '1px solid #e5e7eb',
                      backgroundColor: '#f9fafb'
                    }}>
                      <button
                        onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                        disabled={pageNumber <= 1}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          background: 'white',
                          color: pageNumber <= 1 ? '#9ca3af' : '#374151',
                          cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        ◀ 이전
                      </button>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          페이지
                        </span>
                        <input
                          type="number"
                          value={pageInputValue}
                          onChange={handlePageInputChange}
                          onKeyPress={handlePageInputKeyPress}
                          min={1}
                          max={numPages}
                          style={{
                            width: '60px',
                            padding: '6px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '14px',
                            textAlign: 'center'
                          }}
                          placeholder={pageNumber.toString()}
                        />
                        <button
                          onClick={handlePageInputSubmit}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #3b82f6',
                            borderRadius: '4px',
                            background: '#3b82f6',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          이동
                        </button>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          / {numPages}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                        disabled={pageNumber >= numPages}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          background: 'white',
                          color: pageNumber >= numPages ? '#9ca3af' : '#374151',
                          cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        다음 ▶
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                  <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>지원하지 않는 파일 형식</p>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                    이 파일 형식은 미리보기를 지원하지 않습니다.
                  </p>
                  <button
                    onClick={() => api.downloadFile(currentFile.id)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #3b82f6',
                      borderRadius: '4px',
                      background: 'white',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    다운로드
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleFileViewer; 