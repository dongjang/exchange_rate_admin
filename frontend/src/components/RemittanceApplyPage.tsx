import React from 'react';
import RemittanceForm from './RemittanceForm';

function RemittanceApplyPage() {
  return (
    <div style={{ maxWidth: 650, margin: '0.9rem auto 2.5rem auto' }}>
      <div style={{ boxShadow: '0 4px 24px rgba(30,41,59,0.13), 0 1.5px 6px rgba(59,130,246,0.07)', borderRadius: 18, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', border: '1.5px solid #e0e7ef', padding: '0 0 2.2rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)', color: '#fff', padding: '1.2rem 2rem 1.1rem 2rem', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.01em', borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>
          <span style={{ fontSize: '1.7rem', filter: 'drop-shadow(0 1px 2px rgba(59,130,246,0.13))' }}>💸</span>
          <span>송금</span>
        </div>
        <div style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
          <RemittanceForm />
        </div>
      </div>
    </div>
  );
}

export default RemittanceApplyPage; 