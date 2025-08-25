import { Provider, useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import './App.css';
import AdminDashboard from './components/AdminDashboard';
import AdminRemittanceManagement from './components/AdminRemittanceManagement';
import AuthFailure from './components/AuthFailure';
import AuthSuccess from './components/AuthSuccess';
import Dashboard from './components/Dashboard';
import { ExchangeRates } from './components/ExchangeRates';
import GlobalLoading from './components/GlobalLoading';
import { Header } from './components/Header';
import Login from './components/Login';
import NoticePage from './components/NoticePage';
import QnaPage from './components/QnaPage';
import RemittanceApplyPage from './components/RemittanceApplyPage';
import RemittanceHistoryPage from './components/RemittanceHistoryPage';
import { api } from './services/api';
import { authAtom, setAuthAtom } from './store/authStore';
import { countryAtom } from './store/countryStore';
import { userInfoAtom } from './store/userStore';
import AdminNotices from './components/AdminNotices';
import AdminQna from './components/AdminQna';
import AdminUsers from './components/AdminUsers';
import AdminCountriesBanks from './components/AdminCountriesBanks';
import AdminLogin from './components/AdminLogin';

function AppContent() {
  const [auth, setAuth] = useAtom(authAtom);
  const [, setAuthState] = useAtom(setAuthAtom);
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const setCountryList = useSetAtom(countryAtom);
  const location = useLocation();

  const checkAuth = async () => {
    try {
      const authResult = await api.getCurrentUser();
      if (authResult.success && authResult.user?.email) {
        // DB에서 현재 사용자 정보 get
        try {
          const userInfo = await api.getCurrentUserInfo();
          setUserInfo(userInfo);
        } catch (userError) {
          console.log('사용자 정보 조회 실패, OAuth 정보로 설정:', userError);
          // 사용자가 DB에 없으면 OAuth 정보로 임시 설정
          setUserInfo({
            id: userInfo?.id || 0,
            email: authResult.user.email,
            name: authResult.user.name,
            pictureUrl: authResult.user.picture,
            status: 'ACTIVE',
          });
        }
      }
      setAuthState({ isAuthenticated: authResult.success, isLoading: false });
    } catch (error) {
      console.error('인증 확인 실패:', error);
      setAuthState({ isAuthenticated: false, isLoading: false });
      setUserInfo(null);
    }
  };

  useEffect(() => { checkAuth(); }, []);

  // 로그인 성공 시 country 리스트 get
  useEffect(() => {
    if (auth.isAuthenticated) {
      api.getCountries().then(setCountryList);
    }
  }, [auth.isAuthenticated, setCountryList]);

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

  const isAdminPage = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <div className="app">
      <GlobalLoading />
      {location.pathname === '/admin/login' ? (
        <AdminLogin />
      ) : (
        <>
          {!isAdminPage && (
            <Header user={userInfo} onUserUpdated={setUserInfo}/>
          )}
          <div className={`container ${isAdminPage ? 'admin-container' : ''}`}>
            <Routes>
              <Route path="/" element={<Dashboard user={userInfo} />} />
              <Route path="/exchange-rates" element={<ExchangeRates user={userInfo} />} />
              <Route path="/remittance" element={<RemittanceApplyPage />} />
              <Route path="/remittance-history" element={<RemittanceHistoryPage />} />
              <Route path="/notices" element={<NoticePage />} />
              <Route path="/qna" element={<QnaPage />} />
              <Route path="/admin" element={<AdminDashboard user={userInfo} />} />
              <Route path="/admin/remittance" element={<AdminRemittanceManagement user={userInfo} />} />
              <Route path="/admin/countries-banks" element={<AdminCountriesBanks />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/notices" element={<AdminNotices />} />
              <Route path="/admin/qna" element={<AdminQna />} />
              <Route path="/auth/success" element={<AuthSuccess />} />
              <Route path="/auth/failure" element={<AuthFailure />} />
            </Routes>
          </div>
        </>
      )}
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
