import { atom } from 'jotai';
import type { AuthUser } from '../services/api';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const authAtom = atom<AuthState>({
  isAuthenticated: false,
  isLoading: true,
});

export const setAuthAtom = atom(
  null,
  (get, set, authState: AuthState) => {
    set(authAtom, authState);
  }
);

export const clearAuthAtom = atom(
  null,
  (get, set) => {
    set(authAtom, {
      isAuthenticated: false,
      isLoading: false,
    });
  }
); 