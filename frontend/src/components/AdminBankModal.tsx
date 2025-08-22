import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { api } from '../services/api';

interface Country {
  code: string;
  codeName: string;
  countryName: string;
}

interface Bank {
  id?: number;
  name: string;
  currencyCode: string;
}

interface AdminBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bank: Bank) => void;
  bank: Bank | null;
  isEdit?: boolean;
}

const AdminBankModal: React.FC<AdminBankModalProps> = ({
  isOpen,
  onClose,
  onSave,
  bank,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<Bank>({ name: '', currencyCode: '' });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [countriesLoaded, setCountriesLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && !countriesLoaded) {
      fetchCountries();
    }
  }, [isOpen, countriesLoaded]);

  useEffect(() => {
    if (isOpen) {
      if (bank) {
        setFormData(bank);
        // 국가 목록이 로드된 후에 선택된 국가 설정
        if (countries.length > 0 && bank.currencyCode) {
          const country = countries.find(c => c.code === bank.currencyCode);
          if (country) {
            setSelectedCountry({
              value: country.code,
              label: `${country.countryName} - ${country.codeName} (${country.code})`
            });
          }
        }
      } else {
        setFormData({ name: '', currencyCode: '' });
        setSelectedCountry(null);
      }
      setErrors({});
    }
  }, [isOpen, bank, countries]);

  const fetchCountries = async () => {
    try {
      const response = await api.getAllCountries();
      setCountries(response);
      setCountriesLoaded(true);
    } catch (error) {
      console.error('국가 목록 조회 실패:', error);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '은행명을 입력해주세요.';
    }
    
    if (!formData.currencyCode) {
      newErrors.currencyCode = '국가를 선택해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof Bank, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCountryChange = (selectedOption: any) => {
    setSelectedCountry(selectedOption);
    if (selectedOption) {
      setFormData(prev => ({ ...prev, currencyCode: selectedOption.value }));
      if (errors.currencyCode) {
        setErrors(prev => ({ ...prev, currencyCode: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, currencyCode: '' }));
    }
  };

  const countryOptions = countries.map(country => ({
    value: country.code,
    label: `${country.countryName} - ${country.codeName} (${country.code})`
  }));

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        width: '500px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            {isEdit ? '은행 상세' : '은행 등록'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            국가 *
          </label>
          <Select
            value={selectedCountry}
            onChange={handleCountryChange}
            options={countryOptions}
            placeholder="국가를 선택하세요"
            isClearable
            isDisabled={isEdit}
            styles={{
              control: (provided) => ({
                ...provided,
                border: errors.currencyCode ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '8px',
                minHeight: '48px',
                backgroundColor: isEdit ? '#f3f4f6' : 'white'
              }),
              placeholder: (provided) => ({
                ...provided,
                color: '#9ca3af'
              }),
              menu: (provided) => ({
                ...provided,
                zIndex: 9999
              })
            }}
          />
          {errors.currencyCode && (
            <div style={{
              color: '#ef4444',
              fontSize: '12px',
              marginTop: '4px'
            }}>
              {errors.currencyCode}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            은행명 *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="은행명을 입력하세요"
            style={{
              width: '100%',
              padding: '14px 16px',
              border: errors.name ? '2px solid #ef4444' : '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          {errors.name && (
            <div style={{
              color: '#ef4444',
              fontSize: '12px',
              marginTop: '4px'
            }}>
              {errors.name}
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          marginTop: '32px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isEdit ? '수정' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBankModal;
