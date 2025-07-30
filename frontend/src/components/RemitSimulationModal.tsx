import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import { useAtom, useSetAtom } from 'jotai';
import { remittanceCountriesAtom, getRemittanceCountries } from '../store/countryStore';

function formatNumberWithCommas(value: string | number) {
  const num = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value.toString();
  if (!num) return '';
  return parseInt(num, 10).toLocaleString();
}

interface RemitSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: { [key: string]: number };
}

const FEE_RATE = 0.01; // 1% 수수료

export function RemitSimulationModal({ isOpen, onClose, rates }: RemitSimulationModalProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [backdropClicked, setBackdropClicked] = useState(false);
  // 모달이 열릴 때마다 입력값/통화 초기화
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setCurrency('');
    }
  }, [isOpen]);

  const [remittanceCountries] = useAtom(remittanceCountriesAtom);
  const getRemitCountries = useSetAtom(getRemittanceCountries);
  useEffect(() => {
    if (isOpen && !remittanceCountries) {
      getRemitCountries();
    }
  }, [isOpen, remittanceCountries, getRemitCountries]);

  // 숫자만 추출해서 계산에 사용
  const numericAmount = amount.replace(/[^0-9]/g, '');
  const parsedAmount = parseFloat(numericAmount) || 0;
  const rate = rates[currency] ? 1 / rates[currency] : 0;
  const fee = useMemo(() => Math.floor(parsedAmount * FEE_RATE), [parsedAmount]);
  const krwRate = rates['KRW'] || 0;
  // USD 등 타 통화 환산: (송금액-수수료) / (KRW 환율)
  const received = useMemo(() => {
    if (!krwRate || !rates[currency]) return 0;
    if (currency === 'USD') {
      return (parsedAmount - fee) / krwRate;
    } else {
      // USD → 타 통화: (원화 → USD → 타 통화)
      const usd = (parsedAmount - fee) / krwRate;
      return usd * rates[currency];
    }
  }, [parsedAmount, fee, krwRate, rates, currency]);

  // react-select용 옵션 생성
  const currencyOptions = (remittanceCountries ?? [])
    .filter(c => c.code !== 'KRW')
    .map(c => ({
      value: c.code,
      label: `${c.countryName} – ${c.codeName} (${c.code})`
    }));
  const selectedCurrencyOption = currencyOptions.find(opt => opt.value === currency) || null;

  if (!isOpen) return null;

  return (
    <div
      className="remit-modal-backdrop"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,41,59,0.48)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onMouseDown={e => {
        if (e.target === e.currentTarget) setBackdropClicked(true);
        else setBackdropClicked(false);
      }}
      onMouseUp={e => {
        if (e.target === e.currentTarget && backdropClicked) {
          setBackdropClicked(false);
          onClose();
        }
      }}
    >
      <div
        className="remit-modal-card"
        style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(30,41,59,0.13)', minWidth: 350, maxWidth: 400, width: '100%', padding: '2.2rem 2rem 1.5rem 2rem', position: 'relative' }}
        onMouseDown={e => e.stopPropagation()}
        onMouseUp={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: '1.5rem', color: '#888', cursor: 'pointer' }} aria-label="닫기">×</button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.2rem', color: '#2563eb' }}>송금 시뮬레이션</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <label style={{ fontWeight: 500, color: '#222' }}>
            송금액 (원 : KRW)
            <input
              type="text"
              inputMode="numeric"
              value={formatNumberWithCommas(amount)}
              onChange={e => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                setAmount(raw);
              }}
              style={{ width: '100%', marginTop: 6, padding: '0.7rem', borderRadius: 7, border: '1.5px solid #e0e7ef', fontSize: '1.1rem', fontWeight: 500 }}
              placeholder="예: 1,000,000"
              autoComplete="off"
              maxLength={12}
            />
          </label>
          <label style={{ fontWeight: 500, color: '#222' }}>
            수취 통화
            <div style={{ margin: '6px 0 4px 0', fontSize: '0.98em', color: '#64748b' }}>
              국가, 통화명, 통화로 검색 또는 선택해 주세요
            </div>
            <div style={{ marginTop: 6 }}>
              <Select
                key={isOpen ? 'open' : 'closed'}
                options={currencyOptions}
                value={selectedCurrencyOption}
                onChange={opt => {
                  setCurrency(opt?.value || '');
                  setAmount(''); // 통화 변경 시 송금액 초기화
                }}
                isSearchable
                placeholder="국가/통화명/통화로 검색"
                styles={{
                  control: base => ({ ...base, borderRadius: 7, border: '1.5px solid #e0e7ef', fontSize: '1.1rem', fontWeight: 500, minHeight: 44 }),
                  menu: base => ({ ...base, zIndex: 99999 }),
                }}
                noOptionsMessage={() => '검색 결과가 없습니다.'}
              />
            </div>
          </label>
        </div>
        <div style={{ marginTop: '1.5rem', background: '#f8fafc', borderRadius: 10, padding: '1.1rem', fontSize: '1.08rem', color: '#222', boxShadow: '0 1px 4px rgba(30,41,59,0.06)' }}>
          {krwRate > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontWeight: 500, color: '#2563eb' }}>
              <span>현재 원화 환율</span>
              <span>1 USD = {krwRate.toLocaleString(undefined, { maximumFractionDigits: 2 })} KRW</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>환율</span>
            <span>
              1 KRW = {
                krwRate && rates[currency] && currency
                  ? (
                      currency === 'USD'
                        ? (1 / krwRate).toFixed(2)
                        : (rates[currency] / krwRate).toFixed(2)
                    )
                  : '-'
              } {currency}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>수수료 (1%)</span>
            <span>{fee.toLocaleString()} KRW</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>송금액(원화)</span>
            <span>{parsedAmount > 0 ? parsedAmount.toLocaleString() : '-'} KRW</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#3b82f6', marginBottom: 6 }}>
            <span>총 출금액</span>
            <span>{parsedAmount > 0 ? (parsedAmount + fee).toLocaleString() : '-'} KRW</span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: '2.2rem',
            width: '100%',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0.9rem 0',
            fontWeight: 700,
            fontSize: '1.08rem',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(30,41,59,0.07)'
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
} 