import { Provider, useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import './App.css';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRemittanceManagement from './components/admin/AdminRemittanceManagement';
import AuthFailure from './components/user/AuthFailure';
import AuthSuccess from './components/user/AuthSuccess';
import Dashboard from './components/user/Dashboard';
import { ExchangeRates } from './components/user/ExchangeRates';
import GlobalLoading from './components/user/GlobalLoading';
import { Header } from './components/user/Header';
import Login from './components/user/Login';
import NoticePage from './components/user/NoticePage';
import QnaPage from './components/user/QnaPage';
import RemittanceApplyPage from './components/user/RemittanceApplyPage';
import RemittanceHistoryPage from './components/user/RemittanceHistoryPage';
import { api } from './services/api';
import { authAtom, setAuthAtom } from './store/authStore';
import { countryAtom } from './store/countryStore';
import { userInfoAtom, type User, } from './store/userStore';
import { adminAuthAtom, setAdminAuthAtom, adminInfoAtom, setAdminInfoAtom } from './store/adminStore';
import AdminNotices from './components/admin/AdminNotices';
import AdminQna from './components/admin/AdminQna';
import AdminUsers from './components/admin/AdminUsers';
import AdminCountriesBanks from './components/admin/AdminCountriesBanks';
import AdminLogin from './components/admin/AdminLogin';
import NotFound from './components/user/NotFound';

function AppContent() {
  const [auth, setAuth] = useAtom(authAtom);
  const [, setAuthState] = useAtom(setAuthAtom);
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const [adminAuth, setAdminAuth] = useAtom(adminAuthAtom);
  const [, setAdminAuthState] = useAtom(setAdminAuthAtom);
  const [adminInfo, setAdminInfo] = useAtom(adminInfoAtom);
  const [, setAdminInfoState] = useAtom(setAdminInfoAtom);
  const setCountryList = useSetAtom(countryAtom);
  const location = useLocation();

  // 페이지 타입 판별 변수들
  const validAdminPaths = ['/admin', '/admin/remittance', '/admin/countries-banks', '/admin/users', '/admin/notices', '/admin/qna'];
  const isAdminPage = validAdminPaths.includes(location.pathname);
  const isNotFoundPage = !['/', '/exchange-rates', '/remittance', '/remittance-history', '/notices', '/qna', '/admin', '/admin/remittance', '/admin/countries-banks', '/admin/users', '/admin/notices', '/admin/qna', '/auth/success', '/auth/failure'].includes(location.pathname);

  const handleUserAuthSuccess = async () => {
    // 함수 시작 시 로딩 상태 설정
    setAuthState({ isAuthenticated: false, isLoading: true });
    
    try {
      const successResult = await api.authSuccess();
      
      if (successResult.success && successResult.user) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
        });
        // AuthUser를 User 타입으로 변환
        const user: User = {
          id: successResult.user.id,
          email: successResult.user.email,
          name: successResult.user.name,
          pictureUrl: successResult.user.pictureUrl,
          status: successResult.user.status || 'ACTIVE' // status가 없으면 기본값 설정
        };
        setUserInfo(user);
        return true;
      } else {
        setAuthState({ isAuthenticated: false, isLoading: false });
        return false;
      }
    } catch (error) {
      console.error('사용자 인증 실패:', error);
      // 에러 발생 시에도 로딩 상태 해제
      setAuthState({ isAuthenticated: false, isLoading: false });
      return false;
    }
  };

  const checkAdminAuth = async () => {
    try {
      const adminResult = await api.getCurrentAdmin();
      if (adminResult.success && adminResult.admin) {
        setAdminInfoState(adminResult.admin);
        setAdminAuthState({ isAuthenticated: true, isLoading: false });
      } else {
        setAdminAuthState({ isAuthenticated: false, isLoading: false });
        setAdminInfoState(null);
      }
    } catch (error) {
      console.error('관리자 인증 확인 실패:', error);
      setAdminAuthState({ isAuthenticated: false, isLoading: false });
      setAdminInfoState(null);
    }
  };

  useEffect(() => { 
    // 관리자 페이지이거나 admin 경로에서 404가 발생한 경우 관리자 인증 확인
    if (isAdminPage || location.pathname.startsWith('/admin')) {
      checkAdminAuth();
    }
  }, [location.pathname]);

  // 사용자 인증 상태 확인 (앱 시작 시 한 번만)
  useEffect(() => {
    // 관리자 페이지가 아니고, 아직 인증 상태를 모르는 경우에만 체크
    if (!isAdminPage && auth.isAuthenticated === 'unknown' && !auth.isLoading) {
      handleUserAuthSuccess();
    }
  }, []); // 의존성 배열을 빈 배열로 설정하여 한 번만 실행

  // 로그인 성공 시 country 리스트 get
  useEffect(() => {
    if (auth.isAuthenticated) {
      api.getAllCountries().then(setCountryList);
    }
  }, [auth.isAuthenticated, setCountryList]);

  //const isAdminLoginPage = location.pathname === '/admin/login'; // 실제 로그인 페이지만

  // 관리자 페이지인 경우 관리자 인증 확인 (사용자 로그인 상태와 무관)
  if (isAdminPage) {
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

    if (!adminAuth.isAuthenticated) {
      return <AdminLogin />;
    }
  } else if (!isNotFoundPage) {
    // 사용자 페이지인 경우 사용자 인증 확인 (404 페이지 제외)
    if (auth.isLoading) {
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

    if (!auth.isAuthenticated) {
      return <Login />;
    }
  }

  return (
    <div className="app">
      <GlobalLoading />
        <>
          {!isAdminPage && !isNotFoundPage && (
            <Header user={userInfo} onUserUpdated={setUserInfo}/>
          )}
          <div className={`container ${isAdminPage ? 'admin-container' : ''} ${isNotFoundPage ? 'not-found-container' : ''}`}>
            <Routes>
              <Route path="/" element={<Dashboard user={userInfo} />} />
              <Route path="/exchange-rates" element={<ExchangeRates user={userInfo} />} />
              <Route path="/remittance" element={<RemittanceApplyPage />} />
              <Route path="/remittance-history" element={<RemittanceHistoryPage />} />
              <Route path="/notices" element={<NoticePage />} />
              <Route path="/qna" element={<QnaPage />} />
              <Route path="/admin" element={<AdminDashboard admin={adminInfo} />} />
              <Route path="/admin/remittance" element={<AdminRemittanceManagement admin={adminInfo} />} />
              <Route path="/admin/countries-banks" element={<AdminCountriesBanks />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/notices" element={<AdminNotices />} />
              <Route path="/admin/qna" element={<AdminQna />} />
              <Route path="/auth/success" element={<AuthSuccess handleUserAuthSuccess={handleUserAuthSuccess}/>} />
              <Route path="/auth/failure" element={<AuthFailure />} />
              {/* 404 처리 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </>
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
