import { atom } from 'jotai';

export interface Admin {
  id: number;
  adminId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  updatedAdminName?: string;
  updatedAdminId?: string;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

// localStorage에서 초기 인증 상태 가져오기
const getInitialAuthState = (): AdminAuthState => {
  const isStoredAuth = localStorage.getItem('adminAuthenticated') === 'true';
  const hasSessionId = localStorage.getItem('adminSessionId') !== null;
  
  // adminSessionId가 없으면 인증 상태를 false로 설정
  if (isStoredAuth && !hasSessionId) {
    localStorage.removeItem('adminAuthenticated');
    return {
      isAuthenticated: false,
      isLoading: false,
    };
  }
  
  return {
    isAuthenticated: false, // 초기에는 항상 false로 시작 (API 확인 후 true로 변경)
    isLoading: isStoredAuth && hasSessionId, // 인증 정보와 세션 ID가 모두 있으면 로딩 상태로 시작
  };
};

// 관리자 인증 상태
export const adminAuthAtom = atom<AdminAuthState>(getInitialAuthState());

// 관리자 정보
export const adminInfoAtom = atom<Admin | null>(null);

// 관리자 인증 상태 설정
export const setAdminAuthAtom = atom(
  null,
  (get, set, authState: AdminAuthState) => {
    set(adminAuthAtom, authState);
  }
);

// 관리자 인증 상태 초기화
export const clearAdminAuthAtom = atom(
  null,
  (get, set) => {
    set(adminAuthAtom, {
      isAuthenticated: false,
      isLoading: false,
    });
    set(adminInfoAtom, null);
  }
);

// 관리자 정보 설정
export const setAdminInfoAtom = atom(
  null,
  (get, set, adminInfo: Admin | null) => {
    set(adminInfoAtom, adminInfo);
  }
);
