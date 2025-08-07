import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { FaInfoCircle, FaExclamationTriangle, FaArrowUp, FaChartLine, FaHistory, FaEye } from 'react-icons/fa';
import { api } from '../services/api';
import { userInfoAtom } from '../store/userStore';
import RemittanceLimitModal from './RemittanceLimitModal';
import RemittanceLimitHistoryModal from './RemittanceLimitHistoryModal';

interface RemittanceLimit {
  dailyLimit: number;
  monthlyLimit: number;
  singleLimit: number;
  limitType: 'USER_LIMIT' | 'DEFAULT_LIMIT';
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';
}

interface RemittanceLimitRequest {
  id: number;
  userId: number;
  dailyLimit: number;
  monthlyLimit: number;
  singleLimit: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
}

const RemittanceLimitDisplay: React.FC = () => {
  const [userInfo] = useAtom(userInfoAtom);
  const [limit, setLimit] = useState<RemittanceLimit | null>(null);
  const [pendingRequest, setPendingRequest] = useState<RemittanceLimitRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const fetchData = async () => {
    if (!userInfo?.id) return;
    
    try {
      setLoading(true);
      
      // 송금 한도 조회
      const limitResponse = await api.getUserRemittanceLimit(userInfo.id);
      setLimit(limitResponse);
      
      // 한도 상향 신청 데이터 조회 (파일 정보 포함)
      const requests = await api.getUserRemittanceLimitRequests(userInfo.id);
      const latestPendingRequest = requests.find(request => request.status === 'PENDING');
      if (latestPendingRequest) {
        setPendingRequest(latestPendingRequest);
      } else {
        setPendingRequest(null);
      }
      
      setError(null);
    } catch (err) {
      console.error('데이터 조회 실패:', err);
      setError('정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userInfo?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-blue-700">송금 한도 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!limit) {
    return null;
  }

  return (
    <>
             <div 
         className="remittance-limit-container"
         style={{
           background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #f3f4f6 100%)',
           border: '2px solid #3b82f6',
           borderRadius: '12px',
           padding: '16px',
           marginBottom: '16px',
           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
           position: 'relative',
           overflow: 'hidden'
         }}
       >
                 <div 
           className="remittance-limit-header"
           style={{
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'space-between',
             marginBottom: '16px'
           }}
         >
          <div style={{ display: 'flex', alignItems: 'center' }}>
                         <div 
               className="remittance-limit-icon"
               style={{
                 width: '36px',
                 height: '36px',
                 background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                 borderRadius: '8px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 marginRight: '12px',
                 boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
               }}
             >
               <FaChartLine style={{ color: 'white', fontSize: '16px' }} />
             </div>
            <div>
                             <h3 
                 className="remittance-limit-title"
                 style={{
                   fontSize: '18px',
                   fontWeight: 'bold',
                   color: '#1f2937',
                   margin: '0'
                 }}
               >
                 송금 한도 정보
               </h3>
                  {limit.limitType === 'DEFAULT_LIMIT' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span 
                        className="remittance-limit-badge"
                        style={{
                          display: 'inline-block',
                          marginTop: '2px',
                          fontSize: '11px',
                          background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                          color: '#1e40af',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontWeight: '500',
                          border: '1px solid #93c5fd'
                        }}
                      >
                        기본 한도 적용
                      </span>
                      {!pendingRequest && (
                        <div 
                          className="remittance-limit-tooltip"
                          style={{
                            position: 'relative',
                            display: 'inline-block',
                            cursor: 'help'
                          }}
                          onMouseEnter={(e) => {
                            const tooltip = e.currentTarget.querySelector('.tooltip-text') as HTMLElement;
                            if (tooltip) tooltip.style.display = 'block';
                          }}
                          onMouseLeave={(e) => {
                            const tooltip = e.currentTarget.querySelector('.tooltip-text') as HTMLElement;
                            if (tooltip) tooltip.style.display = 'none';
                          }}
                        >
                          <div 
                            style={{
                              width: '18px',
                              height: '18px',
                              background: '#3b82f6',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            ?
                          </div>
                          <div 
                            className="tooltip-text"
                            style={{
                              display: 'none',
                              position: 'absolute',
                              bottom: '125%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              background: '#1f2937',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              whiteSpace: 'nowrap',
                              minWidth: '280px',
                              zIndex: 1000,
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            개인별 한도 상향이 필요하시면 "한도 상향 신청" 버튼을 클릭해주세요
                            <div 
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                border: '4px solid transparent',
                                borderTopColor: '#1f2937'
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
            </div>
          </div>
          
                    {limit.limitType === 'DEFAULT_LIMIT' && !pendingRequest && (
            <button
              onClick={() => setShowLimitModal(true)}
              className="remittance-limit-upgrade-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                fontSize: '13px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
            >
              <FaArrowUp style={{ fontSize: '12px' }} />
              한도 상향 신청
            </button>
          )}
          
          {limit.limitType === 'DEFAULT_LIMIT' && pendingRequest && (
            <button
              onClick={() => setShowHistoryModal(true)}
              className="remittance-limit-status-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                fontSize: '13px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
            >
              <FaEye style={{ fontSize: '12px' }} />
              한도 상향 신청 상세
            </button>
          )}
        </div>
        
                            <div 
             className="remittance-limit-cards"
             style={{
               display: 'flex',
               justifyContent: 'space-between',
               gap: '12px',
               marginTop: '12px'
             }}
           >
                        <div 
               className="remittance-limit-card daily"
               style={{
                 background: 'white',
                 borderRadius: '6px',
                 padding: '12px',
                 boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                 border: '1px solid #dbeafe',
                 transition: 'box-shadow 0.2s ease',
                 flex: '1'
               }}
             onMouseEnter={(e) => {
               e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
             }}
           >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                 <div style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280' }}>일일 한도</div>
                 <div 
                   style={{
                     width: '20px',
                     height: '20px',
                     background: '#dbeafe',
                     borderRadius: '50%',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                   }}
                 >
                   <span style={{ color: '#2563eb', fontSize: '9px', fontWeight: 'bold' }}>일</span>
                 </div>
               </div>
                               <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af' }}>
                  {formatCurrency(limit.dailyLimit)}
                </div>
           </div>
           
                        <div 
               className="remittance-limit-card monthly"
               style={{
                 background: 'white',
                 borderRadius: '6px',
                 padding: '12px',
                 boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                 border: '1px solid #e0e7ff',
                 transition: 'box-shadow 0.2s ease',
                 flex: '1'
               }}
             onMouseEnter={(e) => {
               e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
             }}
           >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                 <div style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280' }}>월 한도</div>
                 <div 
                   style={{
                     width: '20px',
                     height: '20px',
                     background: '#e0e7ff',
                     borderRadius: '50%',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                   }}
                 >
                   <span style={{ color: '#4f46e5', fontSize: '9px', fontWeight: 'bold' }}>월</span>
                 </div>
               </div>
                               <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#3730a3' }}>
                  {formatCurrency(limit.monthlyLimit)}
                </div>
           </div>
           
                        <div 
               className="remittance-limit-card single"
               style={{
                 background: 'white',
                 borderRadius: '6px',
                 padding: '12px',
                 boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                 border: '1px solid #f3e8ff',
                 transition: 'box-shadow 0.2s ease',
                 flex: '1'
               }}
             onMouseEnter={(e) => {
               e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
             }}
           >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                 <div style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280' }}>1회 한도</div>
                 <div 
                   style={{
                     width: '20px',
                     height: '20px',
                     background: '#f3e8ff',
                     borderRadius: '50%',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                   }}
                 >
                   <span style={{ color: '#7c3aed', fontSize: '9px', fontWeight: 'bold' }}>회</span>
                 </div>
               </div>
                               <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#5b21b6' }}>
                  {formatCurrency(limit.singleLimit)}
                </div>
           </div>
         </div>
        
                 
      </div>
      
      {/* 한도 상향 신청 모달 */}
      <RemittanceLimitModal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        currentLimit={{
          ...limit,
          status: 'APPROVED' // 기본값으로 APPROVED 설정
        }}
        user={userInfo}
        onSuccess={fetchData}
      />

      {/* 한도 상향 신청 현황 모달 */}
      <RemittanceLimitHistoryModal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onSuccess={fetchData}
      />
    </>
  );
};

export default RemittanceLimitDisplay; 