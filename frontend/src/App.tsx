import { Provider, useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import './App.css';
import AdminDashboard from './components/AdminDashboard';
import AuthFailure from './components/AuthFailure';
import AuthSuccess from './components/AuthSuccess';
import { ExchangeRates } from './components/ExchangeRates';
import { Header } from './components/Header';
import Login from './components/Login';
import RemittanceApplyPage from './components/RemittanceApplyPage';
import RemittanceHistoryPage from './components/RemittanceHistoryPage';
import { api } from './services/api';
import { authAtom, setAuthAtom } from './store/authStore';
import { countryAtom } from './store/countryStore';
import { userInfoAtom } from './store/userStore';

function AppContent() {
  const [auth, setAuth] = useAtom(authAtom);
  const [, setAuthState] = useAtom(setAuthAtom);
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const setCountryList = useSetAtom(countryAtom);
  const location = useLocation();

  const getUserInfo = async (email?: string) => {
    const userEmail = email || userInfo?.email;
    if (userEmail) {
      const users = await api.getUsers();
      const found = users.find(u => u.email === userEmail);
      if (found) setUserInfo(found);
    }
  };

  const checkAuth = async () => {
    try {
      const authResult = await api.getCurrentUser();
      if (authResult.success && authResult.user?.email) {
        // DB에서 사용자 정보 get
        const users = await api.getUsers();
        const found = users.find(u => u.email === authResult.user?.email);
        if (found) {
          setUserInfo(found);
        } else {
          setUserInfo(null);
        }
      }
      setAuthState({ isAuthenticated: authResult.success, isLoading: false });
    } catch {
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
        <div className="container">
          <div className="loading">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Login />;
  }

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      {!isAdminPage && (
        <Header user={userInfo} onUserUpdated={getUserInfo} />
      )}
      <div className={`container ${isAdminPage ? 'admin-container' : ''}`}>
        <Routes>
          <Route path="/" element={<ExchangeRates user={userInfo} />} />
          <Route path="/remit/apply" element={<RemittanceApplyPage />} />
          <Route path="/remit/history" element={<RemittanceHistoryPage />} />
          <Route path="/admin" element={<AdminDashboard user={userInfo} />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/auth/failure" element={<AuthFailure />} />
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
