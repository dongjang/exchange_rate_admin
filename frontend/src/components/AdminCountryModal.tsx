import React, { useState, useEffect } from 'react';

interface Country {
  code: string;
  codeName: string;
  countryName: string;
}

interface AdminCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (country: Country) => void;
  country?: Country | null;
  isEdit?: boolean;
}

const AdminCountryModal: React.FC<AdminCountryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  country,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<Country>({
    code: '',
    codeName: '',
    countryName: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (country) {
      setFormData({
        code: country.code,
        codeName: country.codeName,
        countryName: country.countryName
      });
    } else {
      setFormData({
        code: '',
        codeName: '',
        countryName: ''
      });
    }
    setErrors({});
  }, [country, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.countryName.trim()) {
      newErrors.countryName = '국가명을 입력해주세요.';
    }
    if (!formData.codeName.trim()) {
      newErrors.codeName = '통화명을 입력해주세요.';
    }
    if (!formData.code.trim()) {
      newErrors.code = '통화를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof Country, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        width: '90%',
        maxWidth: '500px',
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
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: 0
          }}>
            {isEdit ? '국가 수정' : '국가 등록'}
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
            fontWeight: '600',
            color: '#374151',
            fontSize: '14px'
          }}>
            국가명 *
          </label>
          <input
            type="text"
            value={formData.countryName}
            onChange={(e) => handleInputChange('countryName', e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: errors.countryName ? '2px solid #ef4444' : '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease'
            }}
            placeholder="국가명을 입력하세요"
          />
          {errors.countryName && (
            <div style={{
              color: '#ef4444',
              fontSize: '12px',
              marginTop: '4px'
            }}>
              {errors.countryName}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#374151',
            fontSize: '14px'
          }}>
            통화명 *
          </label>
          <input
            type="text"
            value={formData.codeName}
            onChange={(e) => handleInputChange('codeName', e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: errors.codeName ? '2px solid #ef4444' : '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease'
            }}
            placeholder="통화명을 입력하세요"
          />
          {errors.codeName && (
            <div style={{
              color: '#ef4444',
              fontSize: '12px',
              marginTop: '4px'
            }}>
              {errors.codeName}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#374151',
            fontSize: '14px'
          }}>
            통화 *
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            disabled={isEdit}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: errors.code ? '2px solid #ef4444' : '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
              background: isEdit ? '#f3f4f6' : 'white'
            }}
            placeholder="통화 코드를 입력하세요"
          />
          {errors.code && (
            <div style={{
              color: '#ef4444',
              fontSize: '12px',
              marginTop: '4px'
            }}>
              {errors.code}
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
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
              fontWeight: '600',
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
              fontWeight: '600',
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

export default AdminCountryModal;
