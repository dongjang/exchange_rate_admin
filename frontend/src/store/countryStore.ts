import type { Getter, Setter } from 'jotai';
import { atom } from 'jotai';
import { api } from '../services/api';

export type Country = {
  code: string;
  codeName: string;
  countryName: string;
};

export const countryAtom = atom<Country[]>([]);

// 송금 가능 국가 atom
export const remittanceCountriesAtom = atom<Country[] | null>(null);



export const getRemittanceCountries = atom(
  null,
  async (get: Getter, set: Setter) => {
    if (!get(remittanceCountriesAtom)) {
      const data = await api.getRemittanceCountries();
      set(remittanceCountriesAtom, data);
    }
  }
); 