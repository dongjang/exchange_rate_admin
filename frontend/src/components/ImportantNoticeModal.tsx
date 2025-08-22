import React, { useState } from 'react';
import './ImportantNoticeModal.css';

interface ImportantNoticeModalProps {
  isOpen: boolean;
  notices: any[];
  onClose: () => void;
}

const ImportantNoticeModal: React.FC<ImportantNoticeModalProps> = ({
  isOpen,
  notices,
  onClose
}) => {
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [hideToday, setHideToday] = useState(false);

  console.log('ImportantNoticeModal props:', { isOpen, noticesLength: notices.length });

  if (!isOpen || notices.length === 0) {
    console.log('ImportantNoticeModal: 조건에 맞지 않아 렌더링하지 않음');
    return null;
  }

  const handleClose = () => {
    onClose();
    setCurrentNoticeIndex(0);
  };

  const handleHideToday = () => {
    const today = new Date().toDateString();
    const hideTodayKey = `hideImportantNotice_${today}`;
    localStorage.setItem(hideTodayKey, 'true');
    setHideToday(true);
    handleClose();
  };

  const handleNextNotice = () => {
    if (currentNoticeIndex < notices.length - 1) {
      setCurrentNoticeIndex(currentNoticeIndex + 1);
    }
  };

  const handlePrevNotice = () => {
    if (currentNoticeIndex > 0) {
      setCurrentNoticeIndex(currentNoticeIndex - 1);
    }
  };

  const formatNoticeDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="important-notice-modal-overlay" onClick={handleClose}>
      <div className="important-notice-modal" onClick={(e) => e.stopPropagation()}>
        <div className="important-notice-modal-header">
          <h2>📢 중요 공지사항</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
                 <div className="important-notice-modal-content">
           <div className="notice-info">
             <div className="notice-title">
               {notices[currentNoticeIndex]?.title}
             </div>
             <div className="notice-content">
               {notices[currentNoticeIndex]?.content}
             </div>
             <div className="notice-date">
               {formatNoticeDate(notices[currentNoticeIndex]?.createdAt)}
             </div>
           </div>
          
          {notices.length > 1 && (
            <div className="notice-navigation">
              <button 
                className="nav-btn prev-btn" 
                onClick={handlePrevNotice}
                disabled={currentNoticeIndex === 0}
              >
                ‹ 이전
              </button>
              <span className="notice-counter">
                {currentNoticeIndex + 1} / {notices.length}
              </span>
              <button 
                className="nav-btn next-btn" 
                onClick={handleNextNotice}
                disabled={currentNoticeIndex === notices.length - 1}
              >
                다음 ›
              </button>
            </div>
          )}
        </div>
        
        <div className="important-notice-modal-footer">
          <label className="hide-today-checkbox">
            <input 
              type="checkbox" 
              checked={hideToday} 
              onChange={(e) => setHideToday(e.target.checked)}
            />
            <span>오늘 하루 보지 않기</span>
          </label>
          <div className="modal-buttons">
            {hideToday && (
              <button className="hide-today-btn" onClick={handleHideToday}>
                오늘 하루 보지 않기
              </button>
            )}
            <button className="close-modal-btn" onClick={handleClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportantNoticeModal;
