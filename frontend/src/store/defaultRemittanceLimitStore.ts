import { atom } from 'jotai';

export interface DefaultRemittanceLimit {
  id: number;
  dailyLimit: number;
  monthlyLimit: number;
  singleLimit: number;
  description: string;
  adminName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const defaultRemittanceLimitAtom = atom<DefaultRemittanceLimit | null>(null);
export const defaultRemittanceLimitLoadingAtom = atom<boolean>(false); 