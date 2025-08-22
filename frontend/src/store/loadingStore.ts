import { atom } from 'jotai';

export const globalLoadingAtom = atom(false);
export const loadingCountAtom = atom(0);

// 로딩 카운트를 관리하는 함수들
export const incrementLoadingAtom = atom(
  null,
  (get, set) => {
    const currentCount = get(loadingCountAtom);
    set(loadingCountAtom, currentCount + 1);
    set(globalLoadingAtom, true);
  }
);

export const decrementLoadingAtom = atom(
  null,
  (get, set) => {
    const currentCount = get(loadingCountAtom);
    const newCount = Math.max(0, currentCount - 1);
    set(loadingCountAtom, newCount);
    set(globalLoadingAtom, newCount > 0);
  }
);
