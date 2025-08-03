import type { User } from '../store/userStore';
import axios from 'axios';
import type { Country } from '../store/countryStore';
import type { MyBankAccount } from '../store/myBankAccountStore';

const API_BASE_URL = 'http://localhost:8080/api';

export interface AuthUser {
  email: string;
  name: string;
  picture: string;
}

export const api = {
  // 모든 사용자 조회
  async getUsers(): Promise<User[]> {
    const response = await axios.get(`${API_BASE_URL}/users`, { withCredentials: true });
    return response.data;
  },

  // 특정 사용자 조회
  async getUserById(id: number): Promise<User> {
    const response = await axios.get(`${API_BASE_URL}/users/${id}`, { withCredentials: true });
    return response.data;
  },

 
  // 사용자 수정
  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const response = await axios.post(`${API_BASE_URL}/users/${id}`, user, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    return response.data;
  },

  // 인증 관련 API
  async authSuccess(): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    const response = await axios.get(`${API_BASE_URL}/auth/success`, { withCredentials: true });
    return response.data;
  },

  async getCurrentUser(): Promise<{ success: boolean; user?: AuthUser }> {
    const response = await axios.get(`${API_BASE_URL}/auth/user`, { withCredentials: true });
    return response.data;
  },

  async logout(): Promise<void> {
    await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
  },

  // 관심 환율 등록
  async saveFavoriteCurrency(params: { type: string; user_id: number; currency_code: string }): Promise<void> {
    await axios.post(`${API_BASE_URL}/exchange/saveFavoriteRates`, params, { withCredentials: true });
  },

  // 관심 환율 목록 조회
    // 관심 환율 목록 조회
    async getFavoriteCurrencyList(user_id: number): Promise<string[]> {
      const response = await axios.get(`${API_BASE_URL}/exchange/favoriteRatesList/${user_id}`, { withCredentials: true });
      return response.data;
    },

  // 국가/통화 리스트 조회
  async getCountries(): Promise<Country[]> {
    const response = await axios.get(`${API_BASE_URL}/countries`, { withCredentials: true });
    return response.data;
  },

  // 송금 가능 국가 리스트 조회
  async getRemittanceCountries(): Promise<Country[]> {
    const response = await axios.get(`${API_BASE_URL}/countries/remittance`, { withCredentials: true });
    return response.data;
  },

    // 은행 리스트 조회 (currencyCode 파라미터)
    async getBanks(currencyCode: string): Promise<{ bankCode: string; name: string }[]> {
      const response = await axios.get(`${API_BASE_URL}/bank`, {
        params: { currencyCode },
        withCredentials: true,
      });
      return response.data;
    },

  // 내 은행/계좌 정보 조회
  async getMyBankAccount(userId: number): Promise<MyBankAccount | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/userBankAccount/${userId}`, { withCredentials: true });
      return response.data;
    } catch (e) {
      return null;
    }
  },

  // 내 은행/계좌 정보 저장/수정
  async saveMyBankAccount(params: { userId: number,bankCode:string, accountNumber:string }): Promise<void> {
    await axios.post(`${API_BASE_URL}/userBankAccount`, params, { withCredentials: true });
  },

  // 송금 이력 조회 (기존)
  async getRemittanceHistory(params: {
    page: number;
    size: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    currency?: string;
  }): Promise<{
    content: any[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
  }> {
    const response = await axios.get(`${API_BASE_URL}/remittance/history`, {
      params,
      withCredentials: true,
    });
    return response.data;
  },

  // 송금 생성
  async createRemittance(remittanceData: any): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/remittances`, remittanceData, {
      withCredentials: true,
    });
    return response.data;
  },

  // 송금 이력 검색 (페이징 포함)
  async searchRemittanceHistory(params: {
    userId: number;
    recipient?: string;
    currency?: string;
    status?: string;
    minAmount?: string;
    maxAmount?: string;
    startDate?: string;
    endDate?: string;
    sortOrder?: string;
    page?: number;
    size?: number;
  }): Promise<{
    content: any[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const response = await axios.post(`${API_BASE_URL}/remittances/history`, params, {
      withCredentials: true,
    });
    return response.data;
  },

  // 대시보드 통계 조회
  async getDashboardStats(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`, { withCredentials: true });
    return response.data;
  },
}; 