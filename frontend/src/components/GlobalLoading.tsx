import React, { useState, useEffect } from 'react';

const GlobalLoading: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);

  useEffect(() => {
    // 전역 로딩 상태 감지
    const handleLoadingChange = (event: CustomEvent) => {
      const { loading } = event.detail;
      setLoadingCount(prev => {
        const newCount = loading ? prev + 1 : Math.max(0, prev - 1);
        setIsLoading(newCount > 0);
        return newCount;
      });
    };

    window.addEventListener('loading-change', handleLoadingChange as EventListener);
    
    return () => {
      window.removeEventListener('loading-change', handleLoadingChange as EventListener);
    };
  }, []);


  if (!isLoading) {
    return null;
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default GlobalLoading;
