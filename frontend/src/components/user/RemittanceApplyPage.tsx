import React, { useState } from 'react';
import { FaSync } from 'react-icons/fa';
import RemittanceForm from './RemittanceForm';
import CommonPageHeader from './CommonPageHeader';

function RemittanceApplyPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleRefresh = () => {
    // 송금 한도 정보만 새로고침
    setRefreshKey(prev => prev + 1);
  };

  const handleRemittanceComplete = () => {
    // 송금 완료 후 한도 정보 새로고침
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div style={{ maxWidth: 650, margin: '0.9rem auto 2.5rem auto' }}>
      <CommonPageHeader
        title="💸 송금"
        subtitle="송금 서비스를 이용하실 수 있습니다"
        gradientColors={{ from: '#667eea', to: '#764ba2' }}
      />
      <div style={{ boxShadow: '0 4px 24px rgba(30,41,59,0.13), 0 1.5px 6px rgba(59,130,246,0.07)', borderRadius: 18, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', border: '1.5px solid #e0e7ef', padding: '0 0 2.2rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '1.2rem 2rem 1.1rem 2rem' }}>
          <button
            onClick={handleRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              padding: '8px 12px',
              borderRadius: '8px',
              fontWeight: '500',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '13px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <FaSync style={{ fontSize: '12px' }} />
            새로고침
          </button>
        </div>
        <div style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
          <RemittanceForm refreshKey={refreshKey} onSubmit={handleRemittanceComplete} />
        </div>
      </div>
    </div>
  );
}

export default RemittanceApplyPage; 