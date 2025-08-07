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
  
  // 관리자용 송금 이력 조회
  async getAdminRemittanceHistory(params: any): Promise<any[]> {
    const response = await axios.post(`${API_BASE_URL}/remittances/admin/search`, params, { withCredentials: true });
    return response.data;
  },
  
  // 관리자용 송금 이력 개수 조회
  async getAdminRemittanceHistoryCount(params: any): Promise<number> {
    const response = await axios.post(`${API_BASE_URL}/remittances/admin/count`, params, { withCredentials: true });
    return response.data;
  },

  // 기본 송금 한도 관련 API
  async getDefaultRemittanceLimit(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/default-remittance-limit`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('기본 한도 조회 실패:', error);
      throw error;
    }
  },

  async updateDefaultRemittanceLimit(data: any): Promise<void> {
    try {
      await axios.put(`${API_BASE_URL}/admin/default-remittance-limit`, data, { withCredentials: true });
    } catch (error) {
      console.error('기본 한도 업데이트 실패:', error);
      throw error;
    }
  },

  async getUserRemittanceLimit(userId: number): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/remittance-limit?userId=${userId}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('사용자 송금 한도 조회 실패:', error);
      throw error;
    }
  },

  // 한도 상향 신청 API
  async createRemittanceLimitRequest(userId: number, data: FormData): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/remittance-limit-requests/user/${userId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    return response.data;
  },

  async updateRemittanceLimitRequest(userId: number, requestId: number, data: FormData): Promise<any> {
    const response = await axios.put(`${API_BASE_URL}/remittance-limit-requests/user/${userId}/${requestId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    return response.data;
  },

  async getUserRemittanceLimitRequests(userId: number): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/remittance-limit-requests/user/${userId}`, { withCredentials: true });
    return response.data;
  },



  async getAdminRemittanceLimitRequests(params: {
    userId?: number;
    status?: string;
    searchTerm?: string;
    page?: number;
    size?: number;
  }): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/remittance-limit-requests/admin`, {
        params,
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('관리자 한도 상향 신청 조회 실패:', error);
      throw error;
    }
  },

  async countAdminRemittanceLimitRequests(params: {
    userId?: number;
    status?: string;
    searchTerm?: string;
  }): Promise<number> {
    try {
      const response = await axios.get(`${API_BASE_URL}/remittance-limit-requests/admin/count`, {
        params,
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('관리자 한도 상향 신청 개수 조회 실패:', error);
      throw error;
    }
  },

  async processRemittanceLimitRequest(requestId: number, data: {
    status: string;
    adminId: number;
    adminComment?: string;
    userId?: number;
    dailyLimit?: number;
    monthlyLimit?: number;
    singleLimit?: number;
  }): Promise<void> {
    try {
      console.log('API 호출 데이터:', { requestId, data });
      
      await axios.put(`${API_BASE_URL}/remittance-limit-requests/admin/${requestId}/process`, null, {
        params: data,
        withCredentials: true
      });
      
      console.log('API 호출 성공');
    } catch (error) {
      console.error('한도 상향 신청 처리 실패:', error);
      throw error;
    }
  },

  // 신청 취소
  async cancelRemittanceLimitRequest(userId: number, requestId: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/remittance-limit-requests/user/${userId}/${requestId}`, {
        withCredentials: true
      });
    } catch (error) {
      console.error('한도 상향 신청 취소 실패:', error);
      throw error;
    }
  },

  // 파일 다운로드
  async downloadFile(fileId: number): Promise<void> {
    try {
      // 먼저 파일 정보를 가져와서 파일명을 확보
      let filename = 'download';
      try {
        const fileInfoResponse = await axios.get(`${API_BASE_URL}/files/${fileId}/info`, {
          withCredentials: true
        });
        if (fileInfoResponse.data && fileInfoResponse.data.originalName) {
          filename = fileInfoResponse.data.originalName;
          console.log('Filename from file info:', filename);
        }
      } catch (error) {
        console.log('Could not get file info, will try from headers');
      }
      
      const response = await axios.get(`${API_BASE_URL}/files/${fileId}/download`, {
        responseType: 'blob',
        withCredentials: true
      });
      
      // 디버깅: 실제 헤더 확인
      console.log('Response headers:', response.headers);
      console.log('Content-Disposition:', response.headers['content-disposition']);
      
      // 파일 다운로드 처리
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Content-Disposition 헤더에서 파일명 추출 (이미 파일명이 있으면 덮어쓰지 않음)
      const contentDisposition = response.headers['content-disposition'];
      
      if (contentDisposition && filename === 'download') {
        console.log('Raw Content-Disposition:', contentDisposition);
        
        // 여러 패턴으로 파일명 추출 시도
        const patterns = [
          /filename\*="UTF-8''([^"]+)"/,  // UTF-8 인코딩된 파일명
          /filename="([^"]+)"/,            // 일반 파일명
          /filename=([^;]+)/               // 따옴표 없는 파일명
        ];
        
        for (const pattern of patterns) {
          const match = contentDisposition.match(pattern);
          if (match && match[1]) {
            console.log('Pattern matched:', pattern, 'Value:', match[1]);
            try {
              // URL 디코딩 시도
              filename = decodeURIComponent(match[1]);
              console.log('Decoded filename:', filename);
              break;
            } catch (e) {
              // 디코딩 실패 시 원본 사용
              filename = match[1];
              console.log('Using original filename:', filename);
              break;
            }
          }
        }
      }
      
      // 파일명이 여전히 'download'인 경우, 파일 확장자 추정
      if (filename === 'download') {
        console.log('Filename still "download", trying to extract from Content-Type');
        const contentType = response.headers['content-type'];
        if (contentType) {
          if (contentType.includes('image/')) {
            filename = 'image.' + contentType.split('/')[1];
          } else if (contentType.includes('application/pdf')) {
            filename = 'document.pdf';
          } else if (contentType.includes('text/')) {
            filename = 'document.txt';
          } else {
            filename = 'file.' + contentType.split('/')[1];
          }
        }
      }
      
      console.log('Final filename:', filename);
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      throw error;
    }
  },
}; 