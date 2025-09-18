import { Provider, useAtom } from 'jotai';
import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import './App.css';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRemittanceManagement from './components/admin/AdminRemittanceManagement';
import GlobalLoading from './components/admin/GlobalLoading';
import { api } from './services/api';
import { adminAuthAtom, setAdminAuthAtom, adminInfoAtom, setAdminInfoAtom } from './store/adminStore';
import AdminNotices from './components/admin/AdminNotices';
import AdminQna from './components/admin/AdminQna';
import AdminUsers from './components/admin/AdminUsers';
import AdminCountriesBanks from './components/admin/AdminCountriesBanks';
import AdminLogin from './components/admin/AdminLogin';
import NotFound from './components/admin/NotFound';

function AppContent() {
  const [adminAuth] = useAtom(adminAuthAtom);
  const [, setAdminAuthState] = useAtom(setAdminAuthAtom);
  const [adminInfo] = useAtom(adminInfoAtom);
  const [, setAdminInfoState] = useAtom(setAdminInfoAtom);
  const location = useLocation();


  const checkAdminAuth = async () => {
    // 이미 인증된 상태이면 API 호출하지 않음
    if (adminAuth.isAuthenticated) {
      return;
    }
    
    // adminSessionId가 없으면 인증 확인 불가
    const adminSessionId = localStorage.getItem('adminSessionId');
    if (!adminSessionId) {
      setAdminAuthState({ isAuthenticated: false, isLoading: false });
      setAdminInfoState(null);
      localStorage.removeItem('adminAuthenticated');
      return;
    }
    
    // 로딩 상태를 true로 설정
    setAdminAuthState({ isAuthenticated: false, isLoading: true });
    
    try {
      // 타임아웃 설정 (5초)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API 호출 타임아웃')), 5000);
      });
      
      const adminResult = await Promise.race([
        api.getCurrentAdmin(),
        timeoutPromise
      ]);
      
      if (adminResult.success && adminResult.admin) {
        setAdminInfoState(adminResult.admin);
        setAdminAuthState({ isAuthenticated: true, isLoading: false });
        // 세션 상태를 localStorage에 저장
        localStorage.setItem('adminAuthenticated', 'true');
      } else {
        setAdminAuthState({ isAuthenticated: false, isLoading: false });
        setAdminInfoState(null);
        // 인증 실패 시 localStorage에서 제거
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminSessionId');
      }
    } catch (error) {
      setAdminAuthState({ isAuthenticated: false, isLoading: false });
      setAdminInfoState(null);
      
      // 타임아웃이나 네트워크 에러 시에는 localStorage 유지
      if (error?.message === 'API 호출 타임아웃') {
        return;
      }
      
      // 401 Unauthorized나 403 Forbidden 에러만 localStorage 정리
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminSessionId');
      }
    }
  };

  // 초기 로드 시 인증 확인
  useEffect(() => {
    // adminStore에서 이미 로딩 상태로 설정되어 있으면 checkAdminAuth 호출
    if (adminAuth.isLoading) {
      checkAdminAuth();
    }
  }, []);

  useEffect(() => { 
    // 페이지 변경 시 인증 상태 확인 (필요시에만)
    if (adminAuth.isAuthenticated && adminAuth.isLoading) {
      checkAdminAuth();
    }
  }, [location.pathname]);

  // 로딩 중인 경우
  if (adminAuth.isLoading) {
    return (
      <div className="app">
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // 관리자 인증되지 않은 경우 로그인 페이지로
  if (!adminAuth.isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="app">
      <GlobalLoading />
      <div className="container admin-container">
        <Routes>
          <Route path="/" element={<AdminDashboard admin={adminInfo} />} />
          <Route path="/remittance" element={<AdminRemittanceManagement admin={adminInfo} />} />
          <Route path="/countries-banks" element={<AdminCountriesBanks />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/notices" element={<AdminNotices />} />
          <Route path="/qna" element={<AdminQna />} />
          {/* 404 처리 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Provider>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
